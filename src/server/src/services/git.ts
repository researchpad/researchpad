import simpleGit from "simple-git";

export interface FileDiff {
  file: string;
  additions: number;
  deletions: number;
  chunks: string;
}

export interface CommitInfo {
  message: string;
  date: string;
  author: string;
  files: FileDiff[];
  stats: { additions: number; deletions: number; changed: number };
}

export async function getDiff(
  projectRoot: string,
  commitHash: string
): Promise<string> {
  const git = simpleGit(projectRoot);
  const diff = await git.diff([`${commitHash}~1`, commitHash]);
  return diff;
}

export async function getCommitInfo(
  projectRoot: string,
  commitHash: string
): Promise<CommitInfo> {
  const git = simpleGit(projectRoot);
  const log = await git.log({ from: `${commitHash}~1`, to: commitHash, maxCount: 1 });
  const commit = log.latest;

  const diffSummary = await git.diffSummary([`${commitHash}~1`, commitHash]);
  const fileDiffs = await getParsedDiff(projectRoot, commitHash);

  return {
    message: commit?.message ?? "",
    date: commit?.date ?? "",
    author: commit?.author_name ?? "",
    files: fileDiffs,
    stats: {
      additions: diffSummary.insertions,
      deletions: diffSummary.deletions,
      changed: diffSummary.changed,
    },
  };
}

export async function getParsedDiff(
  projectRoot: string,
  commitHash: string
): Promise<FileDiff[]> {
  const git = simpleGit(projectRoot);

  const rawDiff = await git.diff([`${commitHash}~1`, commitHash, "--no-color"]);
  const diffSummary = await git.diffSummary([`${commitHash}~1`, commitHash]);

  const statsMap = new Map<string, { additions: number; deletions: number }>();
  for (const f of diffSummary.files) {
    const ins = "insertions" in f ? (f.insertions as number) : 0;
    const del = "deletions" in f ? (f.deletions as number) : 0;
    statsMap.set(f.file, { additions: ins, deletions: del });
  }

  const fileDiffs: FileDiff[] = [];
  const fileSections = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const section of fileSections) {
    const lines = section.split("\n");
    const headerMatch = lines[0]?.match(/a\/(.+?) b\/(.+)/);
    const file = headerMatch ? headerMatch[2] : "unknown";
    const stats = statsMap.get(file) ?? { additions: 0, deletions: 0 };

    fileDiffs.push({
      file,
      additions: stats.additions,
      deletions: stats.deletions,
      chunks: "diff --git " + section,
    });
  }

  return fileDiffs;
}
