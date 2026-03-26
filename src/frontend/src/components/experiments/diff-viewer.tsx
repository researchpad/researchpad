import { useState } from "react";
import { ChevronDown, ChevronRight, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileDiff } from "@/lib/types";

function DiffLine({ line }: { line: string }) {
  let bgClass = "";
  let textClass = "text-text-secondary";

  if (line.startsWith("+") && !line.startsWith("+++")) {
    bgClass = "bg-accent-emerald/8";
    textClass = "text-accent-emerald";
  } else if (line.startsWith("-") && !line.startsWith("---")) {
    bgClass = "bg-accent-red/8";
    textClass = "text-accent-red";
  } else if (line.startsWith("@@")) {
    bgClass = "bg-accent-blue/8";
    textClass = "text-accent-blue";
  }

  return (
    <div className={cn("px-4 py-0 leading-6", bgClass)}>
      <span className={cn("font-mono text-sm whitespace-pre", textClass)}>{line}</span>
    </div>
  );
}

function FileDiffSection({ fileDiff }: { fileDiff: FileDiff }) {
  const [expanded, setExpanded] = useState(true);

  const lines = fileDiff.chunks.split("\n");
  const contentLines = lines.filter(
    (l) => !l.startsWith("diff --git") && !l.startsWith("index ") && !l.startsWith("new file") && !l.startsWith("deleted file")
  );

  return (
    <div className="border border-border-subtle rounded-md overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 bg-bg-elevated hover:bg-bg-hover transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-text-muted shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
        )}
        <FileCode className="h-4 w-4 text-text-muted shrink-0" />
        <span className="font-mono text-sm text-text-primary truncate">{fileDiff.file}</span>
        <span className="ml-auto flex items-center gap-2.5 shrink-0">
          {fileDiff.additions > 0 && (
            <span className="font-mono text-xs text-accent-emerald">+{fileDiff.additions}</span>
          )}
          {fileDiff.deletions > 0 && (
            <span className="font-mono text-xs text-accent-red">-{fileDiff.deletions}</span>
          )}
        </span>
      </button>
      {expanded && (
        <div className="overflow-x-auto bg-bg-primary border-t border-border-subtle max-h-[600px] overflow-y-auto">
          {contentLines.map((line, i) => (
            <DiffLine key={i} line={line} />
          ))}
        </div>
      )}
    </div>
  );
}

interface DiffViewerProps {
  files: FileDiff[];
  stats: { additions: number; deletions: number; changed: number };
  message: string;
  author: string;
  date: string;
}

export function DiffViewer({ files, stats, message, author, date }: DiffViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm text-text-muted font-mono">
        <span>{stats.changed} file{stats.changed !== 1 ? "s" : ""} changed</span>
        <span className="text-accent-emerald">+{stats.additions}</span>
        <span className="text-accent-red">-{stats.deletions}</span>
      </div>
      {message && (
        <div className="rounded-lg bg-bg-elevated border border-border-subtle p-4">
          <p className="text-[15px] text-text-primary">{message}</p>
          <p className="mt-1.5 text-sm text-text-muted">
            {author} &middot; {new Date(date).toLocaleString()}
          </p>
        </div>
      )}
      <div className="space-y-2">
        {files.map((f) => (
          <FileDiffSection key={f.file} fileDiff={f} />
        ))}
      </div>
    </div>
  );
}
