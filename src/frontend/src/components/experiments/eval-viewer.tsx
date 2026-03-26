import { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Database,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEvalData } from "@/hooks/use-experiment-detail";
import type { EvalFile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SortSpec {
  col: string;
  dir: "asc" | "desc";
}

function EvalTable({ experimentId, file }: { experimentId: string; file: EvalFile }) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useEvalData(experimentId, expanded ? file.name : "");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortSpec | null>(null);

  const isTabular = file.ext === "csv" || file.ext === "tsv";

  const processed = useMemo(() => {
    if (!data) return null;
    let rows = data.rows;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        data.columns.some((col) => String(row[col] ?? "").toLowerCase().includes(q))
      );
    }

    if (sort) {
      rows = [...rows].sort((a, b) => {
        const va = a[sort.col] ?? "";
        const vb = b[sort.col] ?? "";
        const na = Number(va);
        const nb = Number(vb);
        const numeric = !isNaN(na) && !isNaN(nb) && va !== "" && vb !== "";
        const cmp = numeric ? na - nb : String(va).localeCompare(String(vb));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }

    return { columns: data.columns, rows, total: data.total };
  }, [data, search, sort]);

  function toggleSort(col: string) {
    setSort((prev) => {
      if (prev?.col === col) {
        return prev.dir === "asc" ? { col, dir: "desc" } : null;
      }
      return { col, dir: "asc" };
    });
  }

  return (
    <div className="border border-border-subtle rounded-md overflow-hidden">
      <button
        onClick={() => isTabular && setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 bg-bg-elevated hover:bg-bg-hover transition-colors",
          !isTabular && "cursor-default"
        )}
      >
        {isTabular ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-text-muted shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
          )
        ) : (
          <Database className="h-3.5 w-3.5 text-text-muted shrink-0" />
        )}
        <FileSpreadsheet className="h-4 w-4 text-text-muted shrink-0" />
        <span className="font-mono text-sm text-text-primary truncate">{file.name}</span>
        <span className="ml-auto font-mono text-xs text-text-muted">
          {file.ext.toUpperCase()} &middot; {formatSize(file.size)}
        </span>
      </button>
      {expanded && isTabular && (
        <div className="border-t border-border-subtle">
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-bg-primary border-b border-border-subtle">
            <Search className="h-3.5 w-3.5 text-text-muted shrink-0" />
            <input
              type="text"
              placeholder="Filter rows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent font-mono text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            {processed && (
              <span className="font-mono text-xs text-text-muted shrink-0">
                {Math.min(processed.rows.length, 100)} of {processed.total} rows
              </span>
            )}
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-xs text-text-muted">Loading...</div>
            ) : processed ? (
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border-subtle bg-bg-primary">
                    {processed.columns.map((col) => (
                      <th
                        key={col}
                        onClick={() => toggleSort(col)}
                        className="px-3 py-2 text-left font-mono text-xs font-medium uppercase tracking-wider text-text-muted whitespace-nowrap cursor-pointer hover:text-text-secondary select-none"
                      >
                        <span className="inline-flex items-center gap-1">
                          {col}
                          {sort?.col === col && (
                            sort.dir === "asc"
                              ? <ArrowUp className="h-3.5 w-3.5" />
                              : <ArrowDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processed.rows.slice(0, 100).map((row, i) => (
                    <tr key={i} className="border-b border-border-subtle hover:bg-bg-hover">
                      {processed.columns.map((col) => (
                        <td
                          key={col}
                          className="px-3 py-1.5 font-mono text-sm text-text-secondary whitespace-nowrap"
                        >
                          {row[col] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-xs text-text-muted">No data</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

interface EvalViewerProps {
  experimentId: string;
  files: EvalFile[];
  evalDir?: string | null;
  dirMissing?: boolean;
}

export function EvalViewer({ experimentId, files, evalDir, dirMissing }: EvalViewerProps) {
  if (files.length === 0) {
    let message = "No evaluation artifacts found.";
    if (!evalDir) {
      message += " This experiment has no run_folder recorded.";
    } else if (dirMissing) {
      message += ` The run folder (${evalDir}) no longer exists on disk.`;
    } else {
      message += " No CSV/TSV files found in the run folder.";
    }
    return (
      <Card className="p-4">
        <p className="text-sm text-text-muted">{message}</p>
      </Card>
    );
  }

  const tabular = files.filter((f) => f.ext === "csv" || f.ext === "tsv");
  const binary = files.filter((f) => f.ext !== "csv" && f.ext !== "tsv");

  return (
    <div className="space-y-4">
      <p className="font-mono text-xs text-text-muted">
        {files.length} artifact{files.length !== 1 ? "s" : ""} in {evalDir}
      </p>

      {tabular.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium uppercase tracking-wider text-text-muted">
            Tabular ({tabular.length})
          </h4>
          {tabular.map((f) => (
            <EvalTable key={f.name} experimentId={experimentId} file={f} />
          ))}
        </div>
      )}

      {binary.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium uppercase tracking-wider text-text-muted">
            Binary ({binary.length})
          </h4>
          {binary.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-2.5 px-3 py-2.5 border border-border-subtle rounded-md bg-bg-elevated"
            >
              <Database className="h-4 w-4 text-text-muted shrink-0" />
              <FileSpreadsheet className="h-4 w-4 text-text-muted shrink-0" />
              <span className="font-mono text-sm text-text-primary truncate">{f.name}</span>
              <span className="ml-auto font-mono text-xs text-text-muted">
                {f.ext.toUpperCase()} &middot; {formatSize(f.size)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
