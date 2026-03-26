import type { LucideIcon } from "lucide-react";

interface CommandHintProps {
  icon: LucideIcon;
  command: string;
  description: string;
}

export function CommandHint({ icon: Icon, command, description }: CommandHintProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-elevated/50 px-4 py-2.5 text-xs text-text-muted">
      <Icon className="h-4 w-4 shrink-0 text-text-muted" />
      <span>
        Use <code className="font-mono text-accent-cyan">{command}</code> to {description}
      </span>
    </div>
  );
}
