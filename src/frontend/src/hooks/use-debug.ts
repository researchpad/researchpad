import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDebugList(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["debug", filters],
    queryFn: () => api.getDebugList(filters),
    refetchInterval: 30000,
  });
}

export function useDebugDetail(slug: string) {
  return useQuery({
    queryKey: ["debug", slug],
    queryFn: () => api.getDebugDetail(slug),
    enabled: !!slug,
  });
}

export function useDebugPrompt(slug: string) {
  return useQuery({
    queryKey: ["debug-prompt", slug],
    queryFn: () => api.getDebugPrompt(slug),
    enabled: !!slug,
  });
}
