import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useActiveLoop } from "@/contexts/loop-context";

export function useThemes() {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["themes", activeLoop],
    queryFn: () => api.getThemes(activeLoop),
    refetchInterval: 30000,
  });
}

export function useDiminishingReturns() {
  const { activeLoop } = useActiveLoop();
  return useQuery({
    queryKey: ["diminishing-returns", activeLoop],
    queryFn: () => api.getDiminishingReturns(activeLoop),
    refetchInterval: 30000,
  });
}
