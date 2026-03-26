import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs";
import { projectRoot } from "../index.js";
import { parseArtifactsDir, parseArtifact } from "../services/markdown-parser.js";

export const researchRouter = new Hono();

function formatDate(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return String(val);
}

function researchDir(): string {
  return path.join(projectRoot, ".researchpad", "experiments", "research");
}

researchRouter.get("/research", async (c) => {
  const artifacts = await parseArtifactsDir(researchDir());

  const search = c.req.query("search")?.toLowerCase();
  const sourceType = c.req.query("source_type");
  const tag = c.req.query("tag");

  let filtered = artifacts;

  if (search) {
    filtered = filtered.filter((a) => {
      const title = String(a.frontmatter.title ?? "").toLowerCase();
      const summary = String(a.frontmatter.summary ?? "").toLowerCase();
      const content = a.content.toLowerCase();
      return title.includes(search) || summary.includes(search) || content.includes(search);
    });
  }

  if (sourceType) {
    filtered = filtered.filter(
      (a) => String(a.frontmatter.source_type ?? "").toLowerCase() === sourceType.toLowerCase()
    );
  }

  if (tag) {
    filtered = filtered.filter((a) => {
      const tags = Array.isArray(a.frontmatter.tags) ? a.frontmatter.tags : [];
      return tags.some((t: unknown) => String(t).toLowerCase() === tag.toLowerCase());
    });
  }

  const items = filtered.map((a) => ({
    slug: a.slug,
    title: a.frontmatter.title ?? a.slug,
    source_type: a.frontmatter.source_type ?? "general",
    source_url: a.frontmatter.source_url ?? null,
    date_retrieved: formatDate(a.frontmatter.date_retrieved),
    tags: Array.isArray(a.frontmatter.tags) ? a.frontmatter.tags : [],
    related_experiments: Array.isArray(a.frontmatter.related_experiments)
      ? a.frontmatter.related_experiments
      : [],
    loop: a.frontmatter.loop ?? null,
    summary: a.frontmatter.summary ?? "",
    file_path: path.relative(projectRoot, a.filePath),
  }));

  return c.json({ artifacts: items });
});

researchRouter.get("/research/:slug", async (c) => {
  const slug = c.req.param("slug");
  const filePath = path.join(researchDir(), `${slug}.md`);

  try {
    const artifact = await parseArtifact(filePath);
    return c.json({
      slug: artifact.slug,
      title: artifact.frontmatter.title ?? artifact.slug,
      source_type: artifact.frontmatter.source_type ?? "general",
      source_url: artifact.frontmatter.source_url ?? null,
      date_retrieved: formatDate(artifact.frontmatter.date_retrieved),
      tags: Array.isArray(artifact.frontmatter.tags) ? artifact.frontmatter.tags : [],
      related_experiments: Array.isArray(artifact.frontmatter.related_experiments)
        ? artifact.frontmatter.related_experiments
        : [],
      loop: artifact.frontmatter.loop ?? null,
      summary: artifact.frontmatter.summary ?? "",
      content: artifact.content,
      file_path: path.relative(projectRoot, artifact.filePath),
    });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

researchRouter.get("/research/:slug/prompt", async (c) => {
  const slug = c.req.param("slug");
  const filePath = path.join(researchDir(), `${slug}.md`);

  try {
    const artifact = await parseArtifact(filePath);
    const relativePath = path.relative(projectRoot, artifact.filePath);

    const bullets = artifact.content
      .split("\n")
      .filter((line) => line.trim().startsWith("- "))
      .slice(0, 3)
      .map((line) => line.trim())
      .join("\n");

    const prompt = [
      `Refer to research artifact: ${relativePath}`,
      `Key findings:`,
      bullets || "(see artifact for details)",
    ].join("\n");

    return c.json({ prompt });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

researchRouter.delete("/research/:slug", async (c) => {
  const slug = c.req.param("slug");
  const filePath = path.join(researchDir(), `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return c.json({ error: "Not found" }, 404);
  }

  try {
    fs.unlinkSync(filePath);
    return c.json({ deleted: true });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});
