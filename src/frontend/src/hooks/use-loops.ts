import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useLoops() {
  return useQuery({
    queryKey: ["loops"],
    queryFn: () => api.getLoops(),
    refetchInterval: 30000,
  });
}
