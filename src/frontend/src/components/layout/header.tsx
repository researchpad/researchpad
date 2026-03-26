import { Sun, Moon, Monitor } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useLoops } from "@/hooks/use-loops";
import { useActiveLoop } from "@/contexts/loop-context";
import { useTheme } from "@/contexts/theme-context";

export function Header() {
  const { isConnected } = useWebSocket();
  const { data: loopsData } = useLoops();
  const { activeLoop, setActiveLoop } = useActiveLoop();
  const { mode, toggle } = useTheme();

  const loops = loopsData?.loops ?? [];
  const current = loops.find((l) => l.label === activeLoop) ?? loops[0];

  return (
    <header className="flex h-14 items-center justify-between border-b border-border-subtle bg-bg-surface px-6">
      <div className="flex items-center gap-4">
        {loops.length > 1 ? (
          <select
            value={activeLoop}
            onChange={(e) => setActiveLoop(e.target.value)}
            className="rounded-md border border-border-default bg-bg-elevated px-3 py-1.5 font-mono text-sm text-text-primary outline-none focus:border-accent-cyan/50"
          >
            {loops.map((loop) => (
              <option key={loop.label} value={loop.label}>
                {loop.label} ({loop.experiment_count} experiments)
              </option>
            ))}
          </select>
        ) : current ? (
          <span className="font-mono text-sm text-text-secondary">
            {current.label} loop — {current.experiment_count} experiments
          </span>
        ) : (
          <span className="font-mono text-sm text-text-muted">
            No experiment logs found
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          title={`Theme: ${mode}`}
        >
          {mode === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : mode === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected
                ? "bg-accent-emerald animate-pulse-dot"
                : "bg-accent-red"
            }`}
          />
          <span className="font-mono text-xs text-text-muted">
            {isConnected ? "live" : "disconnected"}
          </span>
        </div>
      </div>
    </header>
  );
}
