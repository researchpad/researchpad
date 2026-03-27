import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMetric(
  value: number | null | undefined,
  options?: { pct?: boolean; count?: boolean; decimals?: number }
): string {
  if (value == null) return "—";
  const { pct = false, count = false, decimals = 2 } = options ?? {};
  if (pct) return `${(value * 100).toFixed(decimals)}%`;
  if (count) return Math.round(value).toLocaleString();
  return value.toFixed(decimals);
}

export function formatDelta(
  value: number | null | undefined,
  options?: { pct?: boolean; decimals?: number }
): string {
  if (value == null) return "—";
  const { pct = false, decimals = 2 } = options ?? {};
  const prefix = value > 0 ? "+" : "";
  if (pct) return `${prefix}${(value * 100).toFixed(decimals)}%`;
  return `${prefix}${value.toFixed(decimals)}`;
}

export function metricFormatOpts(
  hints: Record<string, { likely_pct: boolean; is_count: boolean; direction?: string }> | undefined,
  metric: string
): { pct: boolean; count: boolean; direction: "minimize" | "maximize" | "zero" } {
  const h = hints?.[metric];
  return {
    pct: h?.likely_pct ?? false,
    count: h?.is_count ?? false,
    direction: (h?.direction as "minimize" | "maximize" | "zero") ?? "minimize",
  };
}

export function deltaColorClass(
  delta: number,
  direction: "minimize" | "maximize" | "zero" = "minimize"
): string {
  if (delta === 0) return "text-text-muted";
  let isGood: boolean;
  switch (direction) {
    case "minimize":
      isGood = delta < 0;
      break;
    case "maximize":
      isGood = delta > 0;
      break;
    case "zero":
      // For zero-is-best, we can't determine from delta alone
      // but negative absolute change is always good
      isGood = delta < 0;
      break;
  }
  return isGood ? "text-accent-emerald" : "text-accent-red";
}

export function bestValue(
  values: number[],
  direction: "minimize" | "maximize" | "zero" = "minimize"
): number | null {
  if (values.length === 0) return null;
  switch (direction) {
    case "minimize":
      return Math.min(...values);
    case "maximize":
      return Math.max(...values);
    case "zero":
      return values.reduce((best, v) => Math.abs(v) < Math.abs(best) ? v : best);
  }
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

export function relativeTime(timestamp: string): string {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function statusColor(status: string): string {
  switch (status) {
    case "keep":
    case "keep*":
      return "text-accent-emerald";
    case "baseline":
      return "text-accent-cyan";
    case "discard":
      return "text-text-muted";
    case "crash":
    case "timeout":
      return "text-accent-red";
    case "pending":
      return "text-accent-amber";
    default:
      return "text-text-secondary";
  }
}

export function cssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function statusBg(status: string): string {
  switch (status) {
    case "keep":
    case "keep*":
      return "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30";
    case "baseline":
      return "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30";
    case "discard":
      return "bg-bg-hover text-text-muted border-border-default";
    case "crash":
    case "timeout":
      return "bg-accent-red/15 text-accent-red border-accent-red/30";
    case "pending":
      return "bg-accent-amber/15 text-accent-amber border-accent-amber/30";
    default:
      return "bg-bg-hover text-text-secondary border-border-default";
  }
}
