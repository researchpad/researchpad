import type {
  ExperimentsResponse,
  SummaryResponse,
  ProgressResponse,
  LoopsResponse,
  ExperimentDetailResponse,
  CommitInfo,
  EvalListResponse,
  EvalDataResponse,
  CompareResponse,
  ResearchListResponse,
  ResearchArtifact,
  DebugListResponse,
  DebugAnalysis,
  ThemesResponse,
  DiminishingReturnsResponse,
} from "./types";

async function fetchJSON<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

function loopParam(loop?: string): Record<string, string> {
  return loop && loop !== "default" ? { loop } : {};
}

export const api = {
  getExperiments: (params?: Record<string, string>, loop?: string) =>
    fetchJSON<ExperimentsResponse>("/api/experiments", { ...loopParam(loop), ...params }),

  getSummary: (loop?: string) =>
    fetchJSON<SummaryResponse>("/api/experiments/summary", loopParam(loop)),

  getProgress: (loop?: string) =>
    fetchJSON<ProgressResponse>("/api/experiments/progress", loopParam(loop)),

  getLoops: () => fetchJSON<LoopsResponse>("/api/loops"),

  getExperiment: (id: string, loop?: string) =>
    fetchJSON<ExperimentDetailResponse>(`/api/experiments/${id}`, loopParam(loop)),

  getExperimentDiff: (id: string, loop?: string) =>
    fetchJSON<{ commit: string; diff: string }>(`/api/experiments/${id}/diff`, loopParam(loop)),

  getCommitInfo: (id: string, loop?: string) =>
    fetchJSON<CommitInfo>(`/api/experiments/${id}/commit-info`, loopParam(loop)),

  getEvalFiles: (id: string, loop?: string) =>
    fetchJSON<EvalListResponse>(`/api/experiments/${id}/eval`, loopParam(loop)),

  getEvalData: (id: string, filename: string, loop?: string) =>
    fetchJSON<EvalDataResponse>(`/api/experiments/${id}/eval/${filename}`, loopParam(loop)),

  getExplainCommand: (id: string, loop?: string) =>
    fetchJSON<{ command: string }>(`/api/experiments/${id}/explain-command`, loopParam(loop)),

  getCompare: (ids: string[], loop?: string) =>
    fetchJSON<CompareResponse>("/api/experiments/compare", { ids: ids.join(","), ...loopParam(loop) }),

  getResearchList: (params?: Record<string, string>) =>
    fetchJSON<ResearchListResponse>("/api/research", params),

  getResearchDetail: (slug: string) =>
    fetchJSON<ResearchArtifact>(`/api/research/${slug}`),

  getResearchPrompt: (slug: string) =>
    fetchJSON<{ prompt: string }>(`/api/research/${slug}/prompt`),

  getDebugList: (params?: Record<string, string>) =>
    fetchJSON<DebugListResponse>("/api/debug", params),

  getDebugDetail: (slug: string) =>
    fetchJSON<DebugAnalysis>(`/api/debug/${slug}`),

  getDebugPrompt: (slug: string) =>
    fetchJSON<{ prompt: string }>(`/api/debug/${slug}/prompt`),

  deleteResearch: async (slug: string): Promise<{ deleted: boolean }> => {
    const res = await fetch(`/api/research/${slug}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
  },

  getThemes: (loop?: string) =>
    fetchJSON<ThemesResponse>("/api/insights/themes", loopParam(loop)),

  getDiminishingReturns: (loop?: string) =>
    fetchJSON<DiminishingReturnsResponse>("/api/insights/diminishing-returns", loopParam(loop)),
};
