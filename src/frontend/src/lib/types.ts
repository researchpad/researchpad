export interface Experiment {
  experiment_id: string;
  timestamp: string;
  status: string;
  description: string;
  commit: string | null;
  duration_seconds: number | null;
  metrics: Record<string, number | null>;
  output_path?: string | null;
  branch?: string | null;
}

export interface MetricHint {
  likely_pct: boolean;
  is_count: boolean;
  direction?: "minimize" | "maximize" | "zero";
}

export interface ExperimentsResponse {
  experiments: Experiment[];
  metric_columns: string[];
  metric_hints: Record<string, MetricHint>;
}

export interface SummaryResponse {
  baseline: { experiment_id: string; metrics: Record<string, number | null> } | null;
  best: Record<string, { value: number; experiment_id: string }>;
  improvement: Record<string, number | null>;
  most_impactful: {
    experiment_id: string;
    metric: string;
    delta: number;
  } | null;
  stats: {
    total: number;
    kept: number;
    discarded: number;
    crashed: number;
    avg_duration: number;
  };
  metric_columns: string[];
  metric_hints: Record<string, MetricHint>;
}

export interface ProgressPoint {
  index: number;
  experiment_id: string;
  status: string;
  description: string;
  metrics: Record<string, number | null>;
  duration_seconds: number | null;
  timestamp: string;
}

export interface ProgressResponse {
  points: ProgressPoint[];
  kept: ProgressPoint[];
  metric_columns: string[];
  metric_hints: Record<string, MetricHint>;
}

export interface Loop {
  label: string;
  file_path: string;
  experiment_count: number;
  last_updated: string | null;
  metric_columns: string[];
}

export interface LoopsResponse {
  loops: Loop[];
}

export type WSMessage =
  | { type: "experiment:new"; data: Experiment }
  | { type: "experiments:refresh" }
  | { type: "research:new" }
  | { type: "research:updated" }
  | { type: "debug:new" }
  | { type: "debug:updated" };

export interface ExperimentDetailResponse {
  experiment: Experiment;
  baseline: { experiment_id: string; metrics: Record<string, number | null> } | null;
  metric_columns: string[];
  metric_hints: Record<string, MetricHint>;
}

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

export interface EvalFile {
  name: string;
  size: number;
  ext: string;
}

export interface EvalListResponse {
  files: EvalFile[];
  eval_dir?: string | null;
  dir_missing?: boolean;
}

export interface EvalDataResponse {
  columns: string[];
  rows: Record<string, string>[];
  total: number;
}

export interface CompareResponse {
  experiments: Experiment[];
  baseline: { experiment_id: string; metrics: Record<string, number | null> } | null;
  metric_columns: string[];
  metric_hints: Record<string, MetricHint>;
}

export interface ResearchArtifact {
  slug: string;
  title: string;
  source_type: string;
  source_url: string | null;
  date_retrieved: string | null;
  tags: string[];
  related_experiments: string[];
  loop: string | null;
  summary: string;
  content?: string;
  file_path: string;
}

export interface ResearchListResponse {
  artifacts: ResearchArtifact[];
}

export interface DebugAnalysis {
  slug: string;
  title: string;
  date: string | null;
  analyzed_experiment: string | null;
  analyzed_run_folder: string | null;
  status: string;
  resolved_by: string | null;
  loop: string | null;
  tags: string[];
  content?: string;
  file_path: string;
}

export interface DebugListResponse {
  analyses: DebugAnalysis[];
}

export interface ThemeExperiment {
  id: string;
  status: string;
  description: string;
}

export interface Theme {
  name: string;
  experiments: ThemeExperiment[];
  metric_deltas: Record<string, number | null>;
}

export interface ThemesResponse {
  themes: Theme[];
}

export interface DiminishingReturnsPoint {
  index: number;
  experiment_id: string;
  delta: number | null;
  rolling_avg: number | null;
}

export interface DiminishingReturnsResponse {
  points: DiminishingReturnsPoint[];
  metric: string;
  recommendation: string | null;
  untried_research: number;
  unresolved_debug: number;
}
