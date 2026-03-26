import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bug, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CommandHint } from "@/components/ui/command-hint";
import { useDebugList } from "@/hooks/use-debug";
import { cn } from "@/lib/utils";
import type { DebugAnalysis } from "@/lib/types";

const STATUS_OPTIONS = ["all", "active", "resolved"];

function DebugStatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-xs font-medium",
        isActive
          ? "bg-accent-amber/15 text-accent-amber border-accent-amber/30"
          : "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30"
      )}
    >
      {status}
    </span>
  );
}

function DebugRow({ analysis }: { analysis: DebugAnalysis }) {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate({ to: "/debug/$slug", params: { slug: analysis.slug } })}
      className="group border-b border-border-subtle hover:bg-bg-hover/50 transition-colors cursor-pointer"
    >
      <td className="px-4 py-3.5">
        <p className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
          {analysis.title}
        </p>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="text-sm text-text-muted">{analysis.date ?? "—"}</span>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        {analysis.analyzed_experiment ? (
          <span className="font-mono text-sm text-accent-cyan">
            {analysis.analyzed_experiment}
          </span>
        ) : (
          <span className="text-sm text-text-muted">—</span>
        )}
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <DebugStatusBadge status={analysis.status} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {analysis.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-bg-hover px-2 py-0.5 font-mono text-xs text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}

export function DebugPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (searchQuery) f.search = searchQuery;
    if (statusFilter !== "all") f.status = statusFilter;
    return f;
  }, [searchQuery, statusFilter]);

  const { data, isLoading } = useDebugList(
    Object.keys(filters).length > 0 ? filters : undefined
  );

  const analyses = data?.analyses ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Debug</h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          Outlier and error analyses from evaluation artifacts
        </p>
      </div>

      <CommandHint
        icon={Bug}
        command="/debug"
        description="run a new debug analysis"
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border-subtle bg-bg-elevated py-2 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors",
                statusFilter === status
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-bg-elevated" />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <Card className="p-8 text-center">
          <Bug className="mx-auto h-8 w-8 text-text-muted mb-3" />
          <p className="text-sm text-text-muted">No debug analyses found</p>
          <p className="mt-1 text-xs text-text-muted">
            Use the <code className="font-mono text-accent-cyan">/debug</code> command to create one
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-elevated/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Experiment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((analysis) => (
                <DebugRow key={analysis.slug} analysis={analysis} />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
