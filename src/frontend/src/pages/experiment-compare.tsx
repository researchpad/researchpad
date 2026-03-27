import { Link, useSearch } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { useCompare } from "@/hooks/use-experiment-detail";
import { formatMetric, formatDelta, formatDuration, metricFormatOpts, deltaColorClass, bestValue, cn } from "@/lib/utils";

export function ExperimentComparePage() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const ids = (search.ids ?? "").split(",").filter(Boolean);
  const { data, isLoading } = useCompare(ids);

  if (ids.length < 2) {
    return (
      <div className="space-y-4">
        <Link
          to="/experiments"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to experiments
        </Link>
        <Card className="p-8 text-center">
          <p className="text-sm text-text-muted">
            Select at least 2 experiments to compare.
          </p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-bg-elevated" />
        <div className="h-64 animate-pulse rounded bg-bg-elevated" />
      </div>
    );
  }

  if (!data || data.experiments.length === 0) {
    return (
      <div className="space-y-4">
        <Link
          to="/experiments"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to experiments
        </Link>
        <Card className="p-8 text-center">
          <p className="text-sm text-text-muted">No experiments found for the given IDs.</p>
        </Card>
      </div>
    );
  }

  const { experiments, baseline, metric_columns, metric_hints } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/experiments"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to experiments
        </Link>
        <h1 className="text-2xl font-semibold text-text-primary">
          Compare {experiments.length} Experiments
        </h1>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider text-text-muted sticky left-0 bg-bg-surface z-10">
                Property
              </th>
              {experiments.map((exp) => (
                <th
                  key={exp.experiment_id}
                  className="px-4 py-3 text-center font-mono text-sm"
                >
                  <Link
                    to="/experiments/$experimentId"
                    params={{ experimentId: exp.experiment_id }}
                    className="text-accent-cyan hover:underline"
                  >
                    {exp.experiment_id}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border-subtle">
              <td className="px-4 py-3 font-mono text-xs text-text-muted uppercase sticky left-0 bg-bg-surface z-10">
                Status
              </td>
              {experiments.map((exp) => (
                <td key={exp.experiment_id} className="px-4 py-3 text-center">
                  <StatusBadge status={exp.status} />
                </td>
              ))}
            </tr>

            <tr className="border-b border-border-subtle">
              <td className="px-4 py-3 font-mono text-xs text-text-muted uppercase sticky left-0 bg-bg-surface z-10">
                Duration
              </td>
              {experiments.map((exp) => (
                <td
                  key={exp.experiment_id}
                  className="px-4 py-3 text-center font-mono text-sm text-text-secondary"
                >
                  {formatDuration(exp.duration_seconds)}
                </td>
              ))}
            </tr>

            <tr className="border-b border-border-subtle">
              <td className="px-4 py-3 font-mono text-xs text-text-muted uppercase sticky left-0 bg-bg-surface z-10">
                Description
              </td>
              {experiments.map((exp) => (
                <td
                  key={exp.experiment_id}
                  className="px-4 py-3 text-center text-sm text-text-secondary max-w-[220px]"
                >
                  {exp.description || "—"}
                </td>
              ))}
            </tr>

            {metric_columns.map((col) => {
              const opts = metricFormatOpts(metric_hints, col);
              const values = experiments.map((e) => e.metrics[col]).filter((v): v is number => v != null);
              const direction = metricFormatOpts(metric_hints, col).direction;
              const best = bestValue(values, direction);

              return (
                <tr key={col} className="border-b border-border-subtle">
                  <td className="px-4 py-3 font-mono text-xs text-text-muted uppercase sticky left-0 bg-bg-surface z-10">
                    {col}
                  </td>
                  {experiments.map((exp) => {
                    const value = exp.metrics[col];
                    const baseVal = baseline?.metrics[col];
                    const delta = value != null && baseVal != null ? value - baseVal : null;
                    const isBest = value != null && value === best;

                    return (
                      <td
                        key={exp.experiment_id}
                        className={cn(
                          "px-4 py-3 text-center font-mono text-sm",
                          isBest ? "text-accent-emerald font-semibold" : "text-text-primary"
                        )}
                      >
                        <div>{formatMetric(value, opts)}</div>
                        {delta !== null && (
                          <div
                            className={cn(
                              "text-xs",
                              deltaColorClass(delta, direction)
                            )}
                          >
                            {formatDelta(delta, { pct: opts.pct })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            <tr className="border-b border-border-subtle">
              <td className="px-4 py-3 font-mono text-xs text-text-muted uppercase sticky left-0 bg-bg-surface z-10">
                Commit
              </td>
              {experiments.map((exp) => (
                <td
                  key={exp.experiment_id}
                  className="px-4 py-3 text-center font-mono text-sm text-text-muted"
                >
                  {exp.commit ? exp.commit.slice(0, 7) : "—"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
