import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs";
import { parse } from "csv-parse/sync";
import { projectRoot, storageRoot } from "../index.js";
import {
  parseExperimentLog,
  discoverMetricColumns,
  computeMetricHints,
  type Experiment,
} from "../services/tsv-parser.js";
import { getDiff, getCommitInfo } from "../services/git.js";

export const experimentsRouter = new Hono();

function resolveLoopFile(loopLabel?: string): string {
  if (!loopLabel || loopLabel === "default") {
    return path.join(projectRoot, ".researchpad", "experiment_log.tsv");
  }
  return path.join(projectRoot, ".researchpad", `experiment_log.${loopLabel}.tsv`);
}

async function loadExperiments(loopLabel?: string): Promise<Experiment[]> {
  const tsvPath = resolveLoopFile(loopLabel);
  if (!fs.existsSync(tsvPath)) return [];
  return parseExperimentLog(tsvPath);
}

experimentsRouter.get("/experiments", async (c) => {
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const status = c.req.query("status");
  const search = c.req.query("search")?.toLowerCase();

  let filtered = experiments;
  if (status) {
    const statuses = status.split(",");
    filtered = filtered.filter((e) => statuses.includes(e.status));
  }
  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.experiment_id.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search)
    );
  }

  const metricColumns = discoverMetricColumns(experiments);
  const metricHints = computeMetricHints(experiments, metricColumns);
  return c.json({ experiments: filtered, metric_columns: metricColumns, metric_hints: metricHints });
});

experimentsRouter.get("/experiments/summary", async (c) => {
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const metricColumns = discoverMetricColumns(experiments);
  const kept = experiments.filter(
    (e) => e.status === "keep" || e.status === "keep*" || e.status === "baseline"
  );
  const nonBaseline = kept.filter((e) => e.status !== "baseline");
  const baselines = experiments.filter((e) => e.status === "baseline");
  const baseline = baselines[0] ?? null;

  const metricHints = computeMetricHints(experiments, metricColumns);

  const bestMetrics: Record<string, { value: number; experiment_id: string }> = {};
  for (const col of metricColumns) {
    let best: { value: number; experiment_id: string } | null = null;
    const dir = metricHints[col]?.direction ?? "minimize";
    for (const e of kept) {
      const v = e.metrics[col];
      if (v === null) continue;
      if (best === null) {
        best = { value: v, experiment_id: e.experiment_id };
        continue;
      }
      let isBetter = false;
      switch (dir) {
        case "minimize": isBetter = v < best.value; break;
        case "maximize": isBetter = v > best.value; break;
        case "zero": isBetter = Math.abs(v) < Math.abs(best.value); break;
      }
      if (isBetter) {
        best = { value: v, experiment_id: e.experiment_id };
      }
    }
    if (best) bestMetrics[col] = best;
  }

  const improvement: Record<string, number | null> = {};
  for (const col of metricColumns) {
    const baseVal = baseline?.metrics[col];
    const bestVal = bestMetrics[col]?.value;
    if (baseVal != null && bestVal != null) {
      improvement[col] = bestVal - baseVal;
    } else {
      improvement[col] = null;
    }
  }

  let mostImpactful: { experiment_id: string; metric: string; delta: number } | null =
    null;
  if (metricColumns.length > 0 && baseline) {
    const primaryMetric = metricColumns[0];
    const pmDir = metricHints[primaryMetric]?.direction ?? "minimize";
    let bestDelta = 0;
    for (const e of nonBaseline) {
      const v = e.metrics[primaryMetric];
      const base = baseline.metrics[primaryMetric];
      if (v == null || base == null) continue;
      const delta = v - base;
      let isBetter = false;
      switch (pmDir) {
        case "minimize": isBetter = delta < bestDelta; break;
        case "maximize": isBetter = delta > bestDelta; break;
        case "zero": isBetter = Math.abs(v) < Math.abs(base) && Math.abs(delta) > Math.abs(bestDelta); break;
      }
      if (isBetter) {
        bestDelta = delta;
        mostImpactful = {
          experiment_id: e.experiment_id,
          metric: primaryMetric,
          delta,
        };
      }
    }
  }

  const totalExperiments = experiments.length;
  const keptCount = experiments.filter(
    (e) => e.status === "keep" || e.status === "keep*"
  ).length;
  const discardedCount = experiments.filter((e) => e.status === "discard").length;
  const crashCount = experiments.filter(
    (e) => e.status === "crash" || e.status === "timeout"
  ).length;
  const avgDuration =
    experiments
      .filter((e) => e.duration_seconds != null)
      .reduce((sum, e) => sum + (e.duration_seconds ?? 0), 0) /
    (experiments.filter((e) => e.duration_seconds != null).length || 1);

  return c.json({
    baseline: baseline
      ? { experiment_id: baseline.experiment_id, metrics: baseline.metrics }
      : null,
    best: bestMetrics,
    improvement,
    most_impactful: mostImpactful,
    stats: {
      total: totalExperiments,
      kept: keptCount,
      discarded: discardedCount,
      crashed: crashCount,
      avg_duration: Math.round(avgDuration),
    },
    metric_columns: metricColumns,
    metric_hints: metricHints,
  });
});

experimentsRouter.get("/experiments/progress", async (c) => {
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const metricColumns = discoverMetricColumns(experiments);
  const metricHints = computeMetricHints(experiments, metricColumns);

  const points = experiments.map((e, idx) => ({
    index: idx + 1,
    experiment_id: e.experiment_id,
    status: e.status,
    description: e.description,
    metrics: e.metrics,
    duration_seconds: e.duration_seconds,
    timestamp: e.timestamp,
  }));

  const keptPoints = points.filter(
    (p) => p.status === "keep" || p.status === "keep*" || p.status === "baseline"
  );

  return c.json({ points, kept: keptPoints, metric_columns: metricColumns, metric_hints: metricHints });
});

experimentsRouter.get("/experiments/compare", async (c) => {
  const loop = c.req.query("loop");
  const ids = c.req.query("ids")?.split(",").filter(Boolean) ?? [];
  if (ids.length === 0) return c.json({ experiments: [], metric_columns: [], metric_hints: {} });

  const allExperiments = await loadExperiments(loop);
  const metricColumns = discoverMetricColumns(allExperiments);
  const metricHints = computeMetricHints(allExperiments, metricColumns);
  const baseline = allExperiments.find((e) => e.status === "baseline") ?? null;

  const selected = ids.map((id) => allExperiments.find((e) => e.experiment_id === id)).filter(Boolean);

  return c.json({
    experiments: selected,
    baseline: baseline ? { experiment_id: baseline.experiment_id, metrics: baseline.metrics } : null,
    metric_columns: metricColumns,
    metric_hints: metricHints,
  });
});

experimentsRouter.get("/experiments/:id", async (c) => {
  const id = c.req.param("id");
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const experiment = experiments.find((e) => e.experiment_id === id);
  if (!experiment) return c.json({ error: "Not found" }, 404);

  const metricColumns = discoverMetricColumns(experiments);
  const metricHints = computeMetricHints(experiments, metricColumns);
  const baseline = experiments.find((e) => e.status === "baseline") ?? null;

  return c.json({
    experiment,
    baseline: baseline ? { experiment_id: baseline.experiment_id, metrics: baseline.metrics } : null,
    metric_columns: metricColumns,
    metric_hints: metricHints,
  });
});

experimentsRouter.get("/experiments/:id/commit-info", async (c) => {
  const id = c.req.param("id");
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const experiment = experiments.find((e) => e.experiment_id === id);
  if (!experiment || !experiment.commit) {
    return c.json({ error: "No commit found" }, 404);
  }
  try {
    const info = await getCommitInfo(projectRoot, experiment.commit as string);
    return c.json(info);
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

experimentsRouter.get("/experiments/:id/diff", async (c) => {
  const id = c.req.param("id");
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const experiment = experiments.find((e) => e.experiment_id === id);
  if (!experiment || !experiment.commit) {
    return c.json({ error: "No commit found" }, 404);
  }
  try {
    const diff = await getDiff(projectRoot, experiment.commit as string);
    return c.json({ commit: experiment.commit, diff });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

/**
 * Resolve an output_path value from the TSV to an absolute path on disk.
 * Uses the configured storage root (passed from the Python CLI) as the base
 * directory. Falls back to projectRoot if storageRoot is not available.
 */
function resolveOutputPath(outputPath: string): string | null {
  if (storageRoot) {
    const resolved = path.join(storageRoot, outputPath);
    if (fs.existsSync(resolved)) return resolved;
  }
  const fallback = path.join(projectRoot, outputPath);
  if (fs.existsSync(fallback)) return fallback;
  return null;
}

experimentsRouter.get("/experiments/:id/eval", async (c) => {
  const id = c.req.param("id");
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const experiment = experiments.find((e) => e.experiment_id === id);
  if (!experiment) return c.json({ error: "Not found" }, 404);

  const outputPath = (experiment as Record<string, unknown>).output_path as string | null;
  if (!outputPath) return c.json({ files: [], eval_dir: null });

  const evalDir = resolveOutputPath(outputPath);
  if (!evalDir) return c.json({ files: [], eval_dir: outputPath, dir_missing: true });

  const allFiles = walkDir(evalDir);
  const evalFiles = allFiles
    .filter((f) => /\.(csv|tsv|parquet)$/i.test(f))
    .map((f) => {
      const stat = fs.statSync(f);
      return {
        name: path.relative(evalDir, f),
        size: stat.size,
        ext: path.extname(f).toLowerCase().replace(".", ""),
      };
    });

  return c.json({ files: evalFiles, eval_dir: outputPath });
});

experimentsRouter.get("/experiments/:id/eval/:filename{.+}", async (c) => {
  const id = c.req.param("id");
  const filename = c.req.param("filename");
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const experiment = experiments.find((e) => e.experiment_id === id);
  if (!experiment) return c.json({ error: "Not found" }, 404);

  const outputPath = (experiment as Record<string, unknown>).output_path as string | null;
  if (!outputPath) return c.json({ error: "No output path" }, 404);

  const resolvedDir = resolveOutputPath(outputPath);
  if (!resolvedDir) return c.json({ error: "Output path not found on disk" }, 404);

  const filePath = path.join(resolvedDir, filename);
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(path.normalize(resolvedDir))) {
    return c.json({ error: "Invalid path" }, 400);
  }

  if (!fs.existsSync(filePath)) return c.json({ error: "File not found" }, 404);

  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv" || ext === ".tsv") {
    const content = fs.readFileSync(filePath, "utf-8");
    const delimiter = ext === ".tsv" ? "\t" : ",";
    const records = parse(content, {
      delimiter,
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    });
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    return c.json({ columns, rows: records, total: records.length });
  }

  if (ext === ".parquet") {
    const stat = fs.statSync(filePath);
    return c.json({ type: "parquet", size: stat.size, message: "Parquet preview not supported yet" });
  }

  return c.json({ error: "Unsupported file type" }, 400);
});

experimentsRouter.get("/experiments/:id/explain-command", async (c) => {
  const id = c.req.param("id");
  const loop = c.req.query("loop");
  const experiments = await loadExperiments(loop);
  const experiment = experiments.find((e) => e.experiment_id === id);
  if (!experiment) return c.json({ error: "Not found" }, 404);

  const parts = [`/explain experiment_id=${experiment.experiment_id}`];
  if (experiment.commit) {
    parts.push(`commit=${experiment.commit}`);
  }
  const outputPath = (experiment as Record<string, unknown>).output_path as string | null;
  if (outputPath) {
    parts.push(`output_path=${outputPath}`);
  }

  return c.json({ command: parts.join(" ") });
});

function walkDir(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkDir(fullPath));
      } else {
        results.push(fullPath);
      }
    }
  } catch {
    // ignore permission errors
  }
  return results;
}
