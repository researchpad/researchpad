import fs from "node:fs";
import { parse } from "csv-parse/sync";

export interface Experiment {
  experiment_id: string;
  timestamp: string;
  status: string;
  description: string;
  commit: string | null;
  duration_seconds: number | null;
  metrics: Record<string, number | null>;
  [key: string]: unknown;
}

const RESERVED_COLUMNS = new Set([
  "experiment_id",
  "timestamp",
  "status",
  "description",
  "commit",
  "duration_s",
  "duration_seconds",
  "run_id",
  "run_folder",
  "branch",
  "parent_experiment",
]);

function tryParseNumber(val: string): number | null {
  if (!val || val === "-" || val === "nan" || val === "NaN" || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

export async function parseExperimentLog(filePath: string): Promise<Experiment[]> {
  const content = fs.readFileSync(filePath, "utf-8");
  const records: Record<string, string>[] = parse(content, {
    delimiter: "\t",
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  if (records.length === 0) return [];

  const allColumns = Object.keys(records[0]);
  const metricColumns = allColumns.filter((col) => {
    if (RESERVED_COLUMNS.has(col)) return false;
    const hasNumeric = records.some((r) => {
      const v = r[col]?.trim();
      return v && v !== "-" && v !== "nan" && Number.isFinite(Number(v));
    });
    return hasNumeric;
  });

  return records.map((row) => {
    const metrics: Record<string, number | null> = {};
    for (const col of metricColumns) {
      metrics[col] = tryParseNumber(row[col] ?? "");
    }

    const durationRaw = row["duration_s"] ?? row["duration_seconds"] ?? "";

    return {
      experiment_id: row["experiment_id"] ?? "",
      timestamp: row["timestamp"] ?? "",
      status: row["status"]?.trim() ?? "",
      description: row["description"] ?? "",
      commit: row["commit"]?.trim() || null,
      duration_seconds: tryParseNumber(durationRaw),
      metrics,
      run_folder: row["run_folder"] ?? null,
      branch: row["branch"] ?? null,
    };
  });
}

export function discoverMetricColumns(experiments: Experiment[]): string[] {
  if (experiments.length === 0) return [];
  const first = experiments[0];
  return Object.keys(first.metrics);
}

export interface MetricHint {
  likely_pct: boolean;
  is_count: boolean;
}

export function computeMetricHints(
  experiments: Experiment[],
  metricColumns: string[]
): Record<string, MetricHint> {
  const hints: Record<string, MetricHint> = {};

  for (const col of metricColumns) {
    const values = experiments
      .map((e) => e.metrics[col])
      .filter((v): v is number => v !== null);

    const allBetween01 =
      values.length > 0 && values.every((v) => Math.abs(v) >= 0 && Math.abs(v) <= 1);
    const allIntegers =
      values.length > 0 && values.every((v) => Number.isInteger(v));
    const hasLargeValues = values.some((v) => Math.abs(v) > 10);

    hints[col] = {
      likely_pct: allBetween01 && !allIntegers,
      is_count: allIntegers && hasLargeValues,
    };
  }

  return hints;
}
