import { StatusBadge } from "@/components/ui/badge";
import { formatMetric, formatDelta, formatDuration, relativeTime, metricFormatOpts, deltaColorClass } from "@/lib/utils";
import type { Experiment, MetricHint } from "@/lib/types";

interface MetricHeaderProps {
  experiment: Experiment;
  baseline: { experiment_id: string; metrics: Record<string, number | null> } | null;
  metricColumns: string[];
  metricHints: Record<string, MetricHint>;
}

export function MetricHeader({ experiment, baseline, metricColumns, metricHints }: MetricHeaderProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="font-mono text-2xl font-bold text-text-primary">
          {experiment.experiment_id}
        </h1>
        <StatusBadge status={experiment.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm text-text-secondary">
        {experiment.timestamp && (
          <span title={experiment.timestamp}>{relativeTime(experiment.timestamp)}</span>
        )}
        {experiment.duration_seconds != null && (
          <span>{formatDuration(experiment.duration_seconds)}</span>
        )}
        {experiment.commit && (
          <span className="font-mono text-sm text-text-muted">
            commit {experiment.commit.slice(0, 7)}
          </span>
        )}
        {experiment.branch && (
          <span className="font-mono text-sm text-text-muted">
            branch {experiment.branch}
          </span>
        )}
      </div>

      {experiment.description && (
        <p className="text-[15px] leading-relaxed text-text-secondary">{experiment.description}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {metricColumns.map((col) => {
          const value = experiment.metrics[col];
          const baseVal = baseline?.metrics[col];
          const delta = value != null && baseVal != null ? value - baseVal : null;
          const opts = metricFormatOpts(metricHints, col);

          return (
            <div
              key={col}
              className="rounded-lg border border-border-subtle bg-bg-surface p-4"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
                {col}
              </p>
              <p className="mt-1.5 font-mono text-xl font-semibold text-text-primary">
                {formatMetric(value, opts)}
              </p>
              {delta !== null && (
                <p
                  className={`mt-1 font-mono text-sm ${
                    deltaColorClass(delta, metricFormatOpts(metricHints, col).direction)
                  }`}
                >
                  {formatDelta(delta, { pct: opts.pct })} vs baseline
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
