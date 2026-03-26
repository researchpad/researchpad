interface ShortcutsHelpProps {
  onClose: () => void;
}

const shortcuts = [
  { keys: ["g", "d"], description: "Go to Dashboard" },
  { keys: ["g", "e"], description: "Go to Experiments" },
  { keys: ["g", "r"], description: "Go to Research" },
  { keys: ["g", "b"], description: "Go to Debug" },
  { keys: ["g", "i"], description: "Go to Insights" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["j"], description: "Next row" },
  { keys: ["k"], description: "Previous row" },
  { keys: ["Enter"], description: "Open selected row" },
  { keys: ["?"], description: "Toggle this help" },
];

export function ShortcutsHelp({ onClose }: ShortcutsHelpProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-border-default bg-bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-xs text-text-muted hover:text-text-primary"
          >
            esc
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.description} className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, i) => (
                  <span key={i}>
                    {i > 0 && (
                      <span className="mx-0.5 text-xs text-text-muted">then</span>
                    )}
                    <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-border-default bg-bg-elevated px-1.5 font-mono text-xs text-text-primary">
                      {k}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
