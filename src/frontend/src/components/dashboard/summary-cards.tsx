import {
  Target,
  TrendingDown,
  ArrowDownRight,
  Zap,
  Activity,
} from "lucide-react";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { useSummary } from "@/hooks/use-experiments";
import { formatMetric, formatDelta, formatDuration, metricFormatOpts, deltaColorClass, cn } from "@/lib/utils";

export function SummaryCards() {
  const { data, isLoading } = useSummary();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-16" />
          </Card>
        ))}
      </div>
    );
  }

  const { baseline, best, improvement, most_impactful, stats, metric_columns, metric_hints } = data;
  const primaryMetric = metric_columns[0] ?? null;
  const pmOpts = primaryMetric ? metricFormatOpts(metric_hints, primaryMetric) : { pct: false, count: false, direction: "minimize" as const };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <Card className="animate-fade-in-up stagger-1">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10">
            <Target className="h-4 w-4 text-accent-cyan" />
          </div>
          <CardTitle>Baseline</CardTitle>
        </div>
        <CardContent>
          {primaryMetric && baseline ? (
            <div>
              <p className="font-mono text-3xl font-semibold text-text-primary">
                {formatMetric(baseline.metrics[primaryMetric], pmOpts)}
              </p>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {primaryMetric} — #{baseline.experiment_id}
              </p>
            </div>
          ) : (
            <p className="font-mono text-sm text-text-muted">No baseline</p>
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-2">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-emerald/10">
            <TrendingDown className="h-4 w-4 text-accent-emerald" />
          </div>
          <CardTitle>Best</CardTitle>
        </div>
        <CardContent>
          {primaryMetric && best[primaryMetric] ? (
            <div>
              <p className="font-mono text-3xl font-semibold text-accent-emerald">
                {formatMetric(best[primaryMetric].value, pmOpts)}
              </p>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {primaryMetric} — #{best[primaryMetric].experiment_id}
              </p>
            </div>
          ) : (
            <p className="font-mono text-sm text-text-muted">No results</p>
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-3">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10">
            <ArrowDownRight className="h-4 w-4 text-accent-blue" />
          </div>
          <CardTitle>Improvement</CardTitle>
        </div>
        <CardContent>
          {primaryMetric && improvement[primaryMetric] != null ? (
            <div>
              <p
                className={cn(
                  "font-mono text-3xl font-semibold",
                  deltaColorClass(improvement[primaryMetric] ?? 0, pmOpts.direction)
                )}
              >
                {formatDelta(improvement[primaryMetric], pmOpts)}
              </p>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {primaryMetric} delta from baseline
              </p>
            </div>
          ) : (
            <p className="font-mono text-sm text-text-muted">No data</p>
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-amber/10">
            <Zap className="h-4 w-4 text-accent-amber" />
          </div>
          <CardTitle>Most Impactful</CardTitle>
        </div>
        <CardContent>
          {most_impactful ? (
            <div>
              <p className="font-mono text-3xl font-semibold text-accent-amber">
                #{most_impactful.experiment_id}
              </p>
              <p className="mt-1 font-mono text-xs text-text-muted">
                {formatDelta(most_impactful.delta, metricFormatOpts(metric_hints, most_impactful.metric))} {most_impactful.metric}
              </p>
            </div>
          ) : (
            <p className="font-mono text-sm text-text-muted">Not enough data</p>
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-5">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/10">
            <Activity className="h-4 w-4 text-accent-purple" />
          </div>
          <CardTitle>Session</CardTitle>
        </div>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <p className="font-mono text-3xl font-semibold text-text-primary">
              {stats.total}
            </p>
            <p className="font-mono text-xs text-text-muted">experiments</p>
          </div>
          <div className="mt-1.5 flex gap-3 font-mono text-xs">
            <span className="text-accent-emerald">{stats.kept} kept</span>
            <span className="text-text-muted">{stats.discarded} disc.</span>
            {stats.crashed > 0 && (
              <span className="text-accent-red">{stats.crashed} crash</span>
            )}
          </div>
          <p className="mt-1 font-mono text-xs text-text-muted">
            avg {formatDuration(stats.avg_duration)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
