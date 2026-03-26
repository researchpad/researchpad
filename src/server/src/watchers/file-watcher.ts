import chokidar from "chokidar";
import path from "node:path";
import { broadcast } from "../index.js";
import { parseExperimentLog } from "../services/tsv-parser.js";

let cachedRowCount = 0;

export function startFileWatcher(projectRoot: string) {
  const tsvPattern = path.join(projectRoot, "experiment_log*.tsv");

  const tsvWatcher = chokidar.watch(tsvPattern, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  tsvWatcher.on("change", async (filePath) => {
    try {
      const experiments = await parseExperimentLog(filePath);
      if (experiments.length !== cachedRowCount) {
        const newExperiments = experiments.slice(cachedRowCount);
        cachedRowCount = experiments.length;
        for (const exp of newExperiments) {
          broadcast({ type: "experiment:new", data: exp });
        }
      } else {
        broadcast({ type: "experiments:refresh" });
      }
    } catch (err) {
      console.error("File watcher parse error:", err);
    }
  });

  tsvWatcher.on("add", async (filePath) => {
    try {
      const experiments = await parseExperimentLog(filePath);
      cachedRowCount = experiments.length;
    } catch {
      // initial parse may fail if file is being written
    }
  });

  const researchPattern = path.join(projectRoot, ".researchpad", "experiments", "research", "**", "*.md");
  const debugPattern = path.join(projectRoot, ".researchpad", "experiments", "debug", "**", "*.md");

  const artifactWatcher = chokidar.watch([researchPattern, debugPattern], {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  });

  artifactWatcher.on("add", (filePath) => {
    const kind = filePath.includes(path.join(".researchpad", "experiments", "research"))
      ? "research"
      : "debug";
    broadcast({ type: `${kind}:new` as "research:new" | "debug:new" });
  });

  artifactWatcher.on("change", (filePath) => {
    const kind = filePath.includes(path.join(".researchpad", "experiments", "research"))
      ? "research"
      : "debug";
    broadcast({ type: `${kind}:updated` as "research:updated" | "debug:updated" });
  });

  return tsvWatcher;
}
