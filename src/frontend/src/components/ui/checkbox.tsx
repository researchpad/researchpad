import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

export function Checkbox({ checked, onChange, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        checked
          ? "border-accent-cyan bg-accent-cyan text-white"
          : "border-border-default bg-bg-surface hover:border-text-muted",
        className,
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
    </button>
  );
}
