import { Hono } from "hono";
import path from "node:path";
import { projectRoot } from "../index.js";
import { parseArtifactsDir, parseArtifact } from "../services/markdown-parser.js";

export const debugRouter = new Hono();

function formatDate(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return String(val);
}

function debugDir(): string {
  return path.join(projectRoot, ".researchpad", "experiments", "debug");
}

debugRouter.get("/debug", async (c) => {
  const artifacts = await parseArtifactsDir(debugDir());

  const status = c.req.query("status");
  const tag = c.req.query("tag");
  const search = c.req.query("search")?.toLowerCase();

  let filtered = artifacts;

  if (status) {
    filtered = filtered.filter(
      (a) => String(a.frontmatter.status ?? "active").toLowerCase() === status.toLowerCase()
    );
  }

  if (tag) {
    filtered = filtered.filter((a) => {
      const tags = Array.isArray(a.frontmatter.tags) ? a.frontmatter.tags : [];
      return tags.some((t: unknown) => String(t).toLowerCase() === tag.toLowerCase());
    });
  }

  if (search) {
    filtered = filtered.filter((a) => {
      const title = String(a.frontmatter.title ?? "").toLowerCase();
      const content = a.content.toLowerCase();
      return title.includes(search) || content.includes(search);
    });
  }

  const items = filtered.map((a) => ({
    slug: a.slug,
    title: a.frontmatter.title ?? a.slug,
    date: formatDate(a.frontmatter.date),
    analyzed_experiment: a.frontmatter.analyzed_experiment ?? null,
    analyzed_run_folder: a.frontmatter.analyzed_run_folder ?? null,
    status: a.frontmatter.status ?? "active",
    resolved_by: a.frontmatter.resolved_by ?? null,
    loop: a.frontmatter.loop ?? null,
    tags: Array.isArray(a.frontmatter.tags) ? a.frontmatter.tags : [],
    file_path: path.relative(projectRoot, a.filePath),
  }));

  return c.json({ analyses: items });
});

debugRouter.get("/debug/:slug", async (c) => {
  const slug = c.req.param("slug");
  const filePath = path.join(debugDir(), `${slug}.md`);

  try {
    const artifact = await parseArtifact(filePath);
    return c.json({
      slug: artifact.slug,
      title: artifact.frontmatter.title ?? artifact.slug,
      date: formatDate(artifact.frontmatter.date),
      analyzed_experiment: artifact.frontmatter.analyzed_experiment ?? null,
      analyzed_run_folder: artifact.frontmatter.analyzed_run_folder ?? null,
      status: artifact.frontmatter.status ?? "active",
      resolved_by: artifact.frontmatter.resolved_by ?? null,
      loop: artifact.frontmatter.loop ?? null,
      tags: Array.isArray(artifact.frontmatter.tags) ? artifact.frontmatter.tags : [],
      content: artifact.content,
      file_path: path.relative(projectRoot, artifact.filePath),
    });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

debugRouter.get("/debug/:slug/prompt", async (c) => {
  const slug = c.req.param("slug");
  const filePath = path.join(debugDir(), `${slug}.md`);

  try {
    const artifact = await parseArtifact(filePath);
    const relativePath = path.relative(projectRoot, artifact.filePath);
    const title = String(artifact.frontmatter.title ?? slug);
    const rawDate = artifact.frontmatter.date;
    const date = rawDate instanceof Date
      ? rawDate.toISOString().split("T")[0]
      : String(rawDate ?? "unknown date");
    const loop = String(artifact.frontmatter.loop ?? "forecaster");

    const suggestedLines = artifact.content
      .split("\n")
      .filter((line) => /^\d+\.\s/.test(line.trim()))
      .slice(0, 3)
      .map((line) => line.trim())
      .join("\n");

    const prompt = [
      `/experiment dag_label=${loop} goal="Fix outlier pattern: ${title}"`,
      ``,
      `CONTEXT: Debug analysis from ${date} identified that ${title.toLowerCase()}.`,
      ``,
      `Refer to debug artifact: ${relativePath}`,
      ``,
      `Focus specifically on:`,
      suggestedLines || "(see debug artifact for suggested approaches)",
    ].join("\n");

    return c.json({ prompt });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});
