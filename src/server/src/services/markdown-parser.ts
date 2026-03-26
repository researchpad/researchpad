import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface ArtifactMeta {
  slug: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
  content: string;
}

export async function parseArtifactsDir(dirPath: string): Promise<ArtifactMeta[]> {
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
  const artifacts: ArtifactMeta[] = [];

  for (const file of files) {
    try {
      const artifact = await parseArtifact(path.join(dirPath, file));
      artifacts.push(artifact);
    } catch {
      // skip unparseable files
    }
  }

  return artifacts.sort((a, b) => {
    const dateA = String(a.frontmatter.date_retrieved ?? a.frontmatter.date ?? a.slug);
    const dateB = String(b.frontmatter.date_retrieved ?? b.frontmatter.date ?? b.slug);
    return dateB.localeCompare(dateA);
  });
}

export async function parseArtifact(filePath: string): Promise<ArtifactMeta> {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const slug = path.basename(filePath, ".md");

  return {
    slug,
    filePath,
    frontmatter: data,
    content,
  };
}
