import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useResearchList(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["research", filters],
    queryFn: () => api.getResearchList(filters),
    refetchInterval: 30000,
  });
}

export function useResearchDetail(slug: string) {
  return useQuery({
    queryKey: ["research", slug],
    queryFn: () => api.getResearchDetail(slug),
    enabled: !!slug,
  });
}

export function useResearchPrompt(slug: string) {
  return useQuery({
    queryKey: ["research-prompt", slug],
    queryFn: () => api.getResearchPrompt(slug),
    enabled: !!slug,
  });
}
