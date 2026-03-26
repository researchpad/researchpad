import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs";
import { glob } from "glob";
import { projectRoot } from "../index.js";
import { parseExperimentLog, discoverMetricColumns } from "../services/tsv-parser.js";

export const loopsRouter = new Hono();

loopsRouter.get("/loops", async (c) => {
  const pattern = path.join(projectRoot, "experiment_log*.tsv");
  const files = await glob(pattern);

  const loops = await Promise.all(
    files.map(async (filePath) => {
      const filename = path.basename(filePath);
      let label = "default";
      const match = filename.match(/^experiment_log\.(.+)\.tsv$/);
      if (match) label = match[1];

      const experiments = await parseExperimentLog(filePath);
      const metricColumns = discoverMetricColumns(experiments);
      const lastExp = experiments[experiments.length - 1];

      return {
        label,
        file_path: filename,
        experiment_count: experiments.length,
        last_updated: lastExp?.timestamp ?? null,
        metric_columns: metricColumns,
      };
    })
  );

  loops.sort((a, b) => (a.label === "default" ? -1 : a.label.localeCompare(b.label)));

  return c.json({ loops });
});
