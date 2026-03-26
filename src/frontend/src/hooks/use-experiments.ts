import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useActiveLoop } from "@/contexts/loop-context";

export function useExperiments(params?: Record<string, string>) {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["experiments", activeLoop, params],
    queryFn: () => api.getExperiments(params, activeLoop),
    refetchInterval: 10000,
  });
}

export function useSummary() {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["summary", activeLoop],
    queryFn: () => api.getSummary(activeLoop),
    refetchInterval: 10000,
  });
}

export function useProgress() {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["progress", activeLoop],
    queryFn: () => api.getProgress(activeLoop),
    refetchInterval: 10000,
  });
}
