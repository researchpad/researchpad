import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useActiveLoop } from "@/contexts/loop-context";

export function useExperimentDetail(id: string) {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["experiment", id, activeLoop],
    queryFn: () => api.getExperiment(id, activeLoop),
    enabled: !!id,
  });
}

export function useCommitInfo(id: string, hasCommit: boolean) {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["commit-info", id, activeLoop],
    queryFn: () => api.getCommitInfo(id, activeLoop),
    enabled: !!id && hasCommit,
  });
}

export function useEvalFiles(id: string, hasRunFolder: boolean) {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["eval-files", id, activeLoop],
    queryFn: () => api.getEvalFiles(id, activeLoop),
    enabled: !!id && hasRunFolder,
  });
}

export function useEvalData(id: string, filename: string) {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["eval-data", id, filename, activeLoop],
    queryFn: () => api.getEvalData(id, filename, activeLoop),
    enabled: !!id && !!filename,
  });
}

export function useExplainCommand(id: string) {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["explain-command", id, activeLoop],
    queryFn: () => api.getExplainCommand(id, activeLoop),
    enabled: !!id,
  });
}

export function useCompare(ids: string[]) {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["compare", ids, activeLoop],
    queryFn: () => api.getCompare(ids, activeLoop),
    enabled: ids.length >= 2,
  });
}
