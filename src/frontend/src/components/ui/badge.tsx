import { cn, statusBg } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-xs font-medium",
        statusBg(status),
        className
      )}
    >
      {status}
    </span>
  );
}
