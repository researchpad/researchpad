import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs";
import { projectRoot } from "../index.js";
import {
  parseExperimentLog,
  discoverMetricColumns,
  type Experiment,
} from "../services/tsv-parser.js";
import { parseArtifactsDir } from "../services/markdown-parser.js";

export const insightsRouter = new Hono();

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "shall", "can", "this", "that",
  "it", "its", "not", "no", "so", "if", "up", "out", "all", "more",
  "also", "very", "just", "than", "then", "too", "only", "into", "over",
  "such", "when", "which", "who", "how", "what", "where", "why",
  "test", "exp", "experiment", "run", "try", "using", "based",
  "vs", "via", "per", "new", "add", "set", "use", "get",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

interface Theme {
  name: string;
  experiments: { id: string; status: string; description: string }[];
  metric_deltas: Record<string, number | null>;
}

function clusterExperimentsByKeyword(experiments: Experiment[]): Theme[] {
  const wordToExps = new Map<string, Set<number>>();

  experiments.forEach((exp, idx) => {
    const tokens = tokenize(exp.description);
    const seen = new Set<string>();
    for (const token of tokens) {
      if (!seen.has(token)) {
        seen.add(token);
        if (!wordToExps.has(token)) wordToExps.set(token, new Set());
        wordToExps.get(token)!.add(idx);
      }
    }
  });

  const candidates = Array.from(wordToExps.entries())
    .filter(([, exps]) => exps.size >= 3)
    .sort((a, b) => b[1].size - a[1].size);

  const assigned = new Set<number>();
  const themes: Theme[] = [];

  for (const [keyword, expIdxs] of candidates) {
    const unassigned = Array.from(expIdxs).filter((i) => !assigned.has(i));
    if (unassigned.length < 2) continue;

    const themeExps = unassigned.map((i) => experiments[i]);
    unassigned.forEach((i) => assigned.add(i));

    const metricKeys = Object.keys(themeExps[0]?.metrics ?? {});
    const deltas: Record<string, number | null> = {};
    for (const key of metricKeys) {
      const kept = themeExps.filter(
        (e) => (e.status === "keep" || e.status === "keep*") && e.metrics[key] != null
      );
      if (kept.length >= 2) {
        const first = kept[0].metrics[key]!;
        const last = kept[kept.length - 1].metrics[key]!;
        deltas[key] = last - first;
      } else {
        deltas[key] = null;
      }
    }

    themes.push({
      name: keyword,
      experiments: themeExps.map((e) => ({
        id: e.experiment_id,
        status: e.status,
        description: e.description,
      })),
      metric_deltas: deltas,
    });
  }

  const overridePath = path.join(projectRoot, ".researchpad", "experiments", "themes.json");
  if (fs.existsSync(overridePath)) {
    try {
      const overrides = JSON.parse(fs.readFileSync(overridePath, "utf-8"));
      if (Array.isArray(overrides.renames)) {
        for (const r of overrides.renames) {
          const theme = themes.find((t) => t.name === r.from);
          if (theme) theme.name = r.to;
        }
      }
    } catch {
      // ignore malformed override file
    }
  }

  return themes;
}

// --- Themes ---

insightsRouter.get("/insights/themes", async (c) => {
  const loop = c.req.query("loop");
  let tsvPath = path.join(projectRoot, "experiment_log.tsv");
  if (loop && loop !== "default") {
    tsvPath = path.join(projectRoot, `experiment_log.${loop}.tsv`);
  }
  const experiments = fs.existsSync(tsvPath) ? await parseExperimentLog(tsvPath) : [];
  const themes = clusterExperimentsByKeyword(experiments);
  return c.json({ themes });
});

// --- Diminishing Returns ---

insightsRouter.get("/insights/diminishing-returns", async (c) => {
  const loop = c.req.query("loop");
  let tsvPath = path.join(projectRoot, "experiment_log.tsv");
  if (loop && loop !== "default") {
    tsvPath = path.join(projectRoot, `experiment_log.${loop}.tsv`);
  }
  if (!fs.existsSync(tsvPath)) {
    return c.json({ points: [], metric: "", recommendation: null, untried_research: 0, unresolved_debug: 0 });
  }

  const experiments = await parseExperimentLog(tsvPath);
  const metricColumns = discoverMetricColumns(experiments);
  const primaryMetric = metricColumns[0] ?? "";

  const kept = experiments.filter(
    (e) => e.status === "keep" || e.status === "keep*" || e.status === "baseline"
  );

  const points: { index: number; experiment_id: string; delta: number | null; rolling_avg: number | null }[] = [];
  const WINDOW = 5;

  for (let i = 0; i < kept.length; i++) {
    const current = kept[i].metrics[primaryMetric];
    const prev = i > 0 ? kept[i - 1].metrics[primaryMetric] : null;
    const delta = current != null && prev != null ? current - prev : null;

    const windowDeltas: number[] = [];
    for (let j = Math.max(0, points.length - WINDOW + 1); j <= points.length; j++) {
      const d = j === points.length ? delta : points[j]?.delta;
      if (d != null) windowDeltas.push(d);
    }
    const rolling_avg = windowDeltas.length > 0
      ? windowDeltas.reduce((s, v) => s + v, 0) / windowDeltas.length
      : null;

    points.push({
      index: i + 1,
      experiment_id: kept[i].experiment_id,
      delta,
      rolling_avg,
    });
  }

  const researchDir = path.join(projectRoot, ".researchpad", "experiments", "research");
  const debugDir = path.join(projectRoot, ".researchpad", "experiments", "debug");

  let untriedResearch = 0;
  let unresolvedDebug = 0;

  try {
    const researchArtifacts = await parseArtifactsDir(researchDir);
    untriedResearch = researchArtifacts.filter((a) => {
      const related = Array.isArray(a.frontmatter.related_experiments)
        ? a.frontmatter.related_experiments
        : [];
      return related.length === 0;
    }).length;
  } catch { /* empty */ }

  try {
    const debugArtifacts = await parseArtifactsDir(debugDir);
    unresolvedDebug = debugArtifacts.filter(
      (a) => String(a.frontmatter.status ?? "active") === "active"
    ).length;
  } catch { /* empty */ }

  let recommendation: string | null = null;
  if (points.length >= WINDOW) {
    const lastAvg = points[points.length - 1].rolling_avg;
    if (lastAvg != null && Math.abs(lastAvg) < 0.001) {
      const parts = [
        `Last ${WINDOW} kept experiments averaged ${lastAvg >= 0 ? "+" : ""}${(lastAvg * 100).toFixed(2)}pp improvement on ${primaryMetric}.`,
      ];
      if (untriedResearch > 0) {
        parts.push(`You have ${untriedResearch} untried research idea${untriedResearch > 1 ? "s" : ""}.`);
      }
      if (unresolvedDebug > 0) {
        parts.push(`You have ${unresolvedDebug} unresolved debug issue${unresolvedDebug > 1 ? "s" : ""}.`);
      }
      parts.push("Consider escalating approach boldness or trying a fundamentally different strategy.");
      recommendation = parts.join(" ");
    }
  }

  return c.json({ points, metric: primaryMetric, recommendation, untried_research: untriedResearch, unresolved_debug: unresolvedDebug });
});
