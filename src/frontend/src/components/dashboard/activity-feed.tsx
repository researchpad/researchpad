import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { useExperiments } from "@/hooks/use-experiments";
import { relativeTime, formatMetric, metricFormatOpts } from "@/lib/utils";

export function ActivityFeed() {
  const { data, isLoading } = useExperiments();

  if (isLoading || !data) {
    return (
      <Card className="animate-pulse">
        <div className="h-48" />
      </Card>
    );
  }

  const recent = [...data.experiments].reverse().slice(0, 10);
  const primaryMetric = data.metric_columns[0] ?? null;
  const pmOpts = primaryMetric ? metricFormatOpts(data.metric_hints, primaryMetric) : { pct: false, count: false };

  return (
    <Card>
      <CardTitle className="mb-4">Recent Activity</CardTitle>
      <div className="space-y-0">
        {recent.map((exp, idx) => (
          <div
            key={`${exp.experiment_id}-${idx}`}
            className="flex items-center gap-3 border-b border-border-subtle py-3 last:border-0"
          >
            <span className="shrink-0 font-mono text-sm text-text-muted">
              #{exp.experiment_id}
            </span>
            <StatusBadge status={exp.status} />
            <p className="flex-1 truncate text-sm text-text-secondary">
              {exp.description || "—"}
            </p>
            {primaryMetric && exp.metrics[primaryMetric] != null && (
              <span className="shrink-0 font-mono text-sm text-text-primary">
                {formatMetric(exp.metrics[primaryMetric], pmOpts)}
              </span>
            )}
            <span className="shrink-0 font-mono text-xs text-text-muted">
              {relativeTime(exp.timestamp)}
            </span>
          </div>
        ))}
        {recent.length === 0 && (
          <p className="py-4 text-center text-sm text-text-muted">
            No experiments yet
          </p>
        )}
      </div>
    </Card>
  );
}
