import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, GitCompare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/badge";
import { useExperiments } from "@/hooks/use-experiments";
import { formatMetric, formatDuration, metricFormatOpts, cn } from "@/lib/utils";
import type { Experiment, MetricHint } from "@/lib/types";

type SortDir = "asc" | "desc";
interface SortSpec {
  col: string;
  dir: SortDir;
}

function extractNumericId(id: string): number {
  const match = id.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : -1;
}

function getSortValue(
  exp: Experiment,
  column: string,
  metricColumns: string[]
): string | number | null {
  switch (column) {
    case "experiment_id":
      return extractNumericId(exp.experiment_id);
    case "status":
      return exp.status;
    case "description":
      return exp.description.toLowerCase();
    case "duration_seconds":
      return exp.duration_seconds;
    case "commit":
      return exp.commit ?? null;
    default:
      if (metricColumns.includes(column)) {
        return exp.metrics[column] ?? null;
      }
      return null;
  }
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 text-text-muted" />;
  if (dir === "asc") return <ArrowUp className="h-3 w-3 text-accent-cyan" />;
  return <ArrowDown className="h-3 w-3 text-accent-cyan" />;
}

export function ExperimentsTable() {
  const { data, isLoading } = useExperiments();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortSpec>({ col: "experiment_id", dir: "desc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const metricColumns = data?.metric_columns ?? [];
  const metricHints: Record<string, MetricHint> = data?.metric_hints ?? {};

  const allStatuses = data
    ? Array.from(new Set(data.experiments.map((e) => e.status)))
    : [];

  function handleSort(column: string) {
    setSort((prev) => {
      return prev.col === column
        ? { col: column, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col: column, dir: "asc" };
    });
  }

  function toggleStatus(status: string) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCompare() {
    const ids = Array.from(selected);
    if (ids.length >= 2) {
      navigate({ to: "/experiments/compare", search: { ids: ids.join(",") } });
    }
  }

  let filtered: Experiment[] = [];
  if (data) {
    filtered = [...data.experiments];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.experiment_id.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.status.toLowerCase().includes(q) ||
          (e.commit && e.commit.toLowerCase().includes(q))
      );
    }

    if (statusFilter.size > 0) {
      filtered = filtered.filter((e) => statusFilter.has(e.status));
    }

    const { col, dir } = sort;
    filtered.sort((a, b) => {
      const va = getSortValue(a, col, metricColumns);
      const vb = getSortValue(b, col, metricColumns);

      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;

      let cmp: number;
      if (typeof va === "number" && typeof vb === "number") {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb), undefined, {
          numeric: true,
        });
      }

      return dir === "asc" ? cmp : -cmp;
    });
  }

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="h-64" />
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="flex items-center gap-3 border-b border-border-subtle p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search experiments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border-default bg-bg-elevated py-2 pl-10 pr-3 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-cyan/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {allStatuses.map((status) => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={cn(
                "rounded border px-2.5 py-1 font-mono text-xs transition-colors",
                statusFilter.has(status)
                  ? "border-accent-cyan/40 bg-accent-cyan/15 text-accent-cyan"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              )}
            >
              {status}
            </button>
          ))}
          {statusFilter.size > 0 && (
            <button
              onClick={() => setStatusFilter(new Set())}
              className="rounded px-1.5 py-1 font-mono text-xs text-text-muted hover:text-text-secondary"
            >
              clear
            </button>
          )}
        </div>
        {selected.size >= 2 && (
          <button
            onClick={handleCompare}
            className="inline-flex items-center gap-1.5 rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1.5 text-sm font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20"
          >
            <GitCompare className="h-4 w-4" />
            Compare ({selected.size})
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="w-8 px-2 py-2.5">
                <span className="sr-only">Select</span>
              </th>
              <SortableHeader
                column="experiment_id"
                label="#"
                sort={sort}
                onClick={handleSort}
              />
              <SortableHeader
                column="status"
                label="Status"
                sort={sort}
                onClick={handleSort}
              />
              <SortableHeader
                column="description"
                label="Description"
                sort={sort}
                onClick={handleSort}
              />
              {metricColumns.map((col) => (
                <SortableHeader
                  key={col}
                  column={col}
                  label={col}
                  sort={sort}
                  onClick={handleSort}
                  align="right"
                />
              ))}
              <SortableHeader
                column="duration_seconds"
                label="Duration"
                sort={sort}
                onClick={handleSort}
                align="right"
              />
              <th className="px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider text-text-muted">
                Commit
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exp, idx) => (
              <tr
                key={`${exp.experiment_id}-${idx}`}
                className="border-b border-border-subtle transition-colors hover:bg-bg-hover"
              >
                <td className="w-8 px-2 py-3 text-center">
                  <Checkbox
                    checked={selected.has(exp.experiment_id)}
                    onChange={() => toggleSelect(exp.experiment_id)}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm">
                  <Link
                    to="/experiments/$experimentId"
                    params={{ experimentId: exp.experiment_id }}
                    className="text-accent-cyan hover:underline"
                  >
                    {exp.experiment_id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={exp.status} />
                </td>
                <td className="max-w-[340px] truncate px-4 py-3 text-sm text-text-secondary">
                  {exp.description || "—"}
                </td>
                {metricColumns.map((col) => (
                  <td
                    key={col}
                    className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm text-text-primary"
                  >
                    {formatMetric(
                      exp.metrics[col],
                      metricFormatOpts(metricHints, col)
                    )}
                  </td>
                ))}
                <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm text-text-muted">
                  {formatDuration(exp.duration_seconds)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-text-muted">
                  {exp.commit ? exp.commit.slice(0, 7) : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={metricColumns.length + 6}
                  className="px-4 py-8 text-center text-sm text-text-muted"
                >
                  {search || statusFilter.size > 0
                    ? "No experiments match your filters"
                    : "No experiments yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2.5">
        <p className="font-mono text-xs text-text-muted">
          {filtered.length} of {data?.experiments.length ?? 0} experiments
          {selected.size > 0 && ` · ${selected.size} selected`}
        </p>
        <p className="font-mono text-xs text-text-muted">
          sorted by {sort.col} {sort.dir}
        </p>
      </div>
    </Card>
  );
}

function SortableHeader({
  column,
  label,
  sort,
  onClick,
  align,
}: {
  column: string;
  label: string;
  sort: SortSpec;
  onClick: (col: string) => void;
  align?: "left" | "right";
}) {
  const isActive = column === sort.col;
  return (
    <th
      className={cn(
        "cursor-pointer select-none px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider transition-colors",
        isActive ? "text-accent-cyan" : "text-text-muted hover:text-text-secondary",
        align === "right" ? "text-right" : "text-left"
      )}
      onClick={() => onClick(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIndicator active={isActive} dir={sort.dir} />
      </span>
    </th>
  );
}
