import { useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { useProgress } from "@/hooks/use-experiments";
import { formatMetric, metricFormatOpts, cn, cssVar } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import type { MetricHint } from "@/lib/types";

const METRIC_COLORS: string[] = [
  "#00d4ff",
  "#ffb020",
  "#10b981",
  "#a78bfa",
  "#3b82f6",
  "#ef4444",
];

const STATUS_FILL: Record<string, string> = {
  keep: "#10b981",
  "keep*": "#10b981",
  baseline: "#00d4ff",
  discard: "#55556a",
  crash: "#ef4444",
  timeout: "#ef4444",
};

const KEPT_STATUSES = new Set(["keep", "keep*", "baseline"]);

interface ChartPoint {
  index: number;
  experiment_id: string;
  status: string;
  description: string;
  metrics: Record<string, number | null>;
  [key: string]: unknown;
}

function CustomTooltip({
  active,
  payload,
  metricHints,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  metricHints?: Record<string, MetricHint>;
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-default bg-bg-elevated p-3.5 shadow-lg">
      <p className="font-mono text-sm font-semibold text-text-primary">
        #{d.experiment_id}
      </p>
      <p className="mt-1 text-xs text-text-secondary">
        {String(d.description ?? "")}
      </p>
      <div className="mt-2 space-y-0.5">
        {d.metrics &&
          Object.entries(d.metrics).map(([key, val]) => {
            const opts = metricFormatOpts(metricHints, key);
            return (
              <p key={key} className="font-mono text-xs text-text-muted">
                {key}:{" "}
                <span className="text-text-primary">{formatMetric(val, opts)}</span>
              </p>
            );
          })}
      </div>
    </div>
  );
}

export function ProgressChart() {
  const { data, isLoading } = useProgress();
  const { resolved } = useTheme();
  const [enabledMetrics, setEnabledMetrics] = useState<Set<string> | null>(null);
  const gridColor = cssVar("--color-border-subtle") || (resolved === "dark" ? "#1e1e2e" : "#e8e9ec");
  const axisColor = cssVar("--color-text-muted") || (resolved === "dark" ? "#6e6e88" : "#8c909a");

  const { metricColumns, chartData, metricHints } = useMemo(() => {
    if (!data)
      return {
        metricColumns: [] as string[],
        chartData: [] as ChartPoint[],
        metricHints: {} as Record<string, MetricHint>,
      };

    const mc = data.metric_columns;
    const mh = data.metric_hints ?? {};

    const keptTrajectory: Record<string, number | null> = {};
    for (const col of mc) keptTrajectory[col] = null;

    const cd: ChartPoint[] = data.points.map((p) => {
      const isKept = KEPT_STATUSES.has(p.status);
      if (isKept) {
        for (const col of mc) {
          if (p.metrics[col] != null) keptTrajectory[col] = p.metrics[col];
        }
      }

      const point: ChartPoint = {
        index: p.index,
        experiment_id: p.experiment_id,
        status: p.status,
        description: p.description,
        metrics: p.metrics,
      };

      for (const col of mc) {
        point[`scatter_${col}`] = p.metrics[col];
        point[`line_${col}`] = isKept ? keptTrajectory[col] : null;
      }

      return point;
    });

    return { metricColumns: mc, chartData: cd, metricHints: mh };
  }, [data]);

  const activeMetrics = useMemo(() => {
    if (enabledMetrics === null && metricColumns.length > 0) {
      return metricColumns.slice(0, 2);
    }
    return metricColumns.filter((m) => enabledMetrics?.has(m));
  }, [metricColumns, enabledMetrics]);

  if (isLoading || !data) {
    return (
      <Card className="h-[400px] animate-pulse">
        <div className="h-full" />
      </Card>
    );
  }

  const toggleMetric = (metric: string) => {
    setEnabledMetrics((prev) => {
      const current = prev ?? new Set(metricColumns.slice(0, 2));
      const next = new Set(current);
      if (next.has(metric)) next.delete(metric);
      else next.add(metric);
      return next;
    });
  };

  const isEnabled = (m: string) =>
    enabledMetrics === null ? metricColumns.indexOf(m) < 2 : enabledMetrics.has(m);

  const pctFormatter = (metric: string) => {
    const opts = metricFormatOpts(metricHints, metric);
    return (value: number) => {
      if (opts.pct) return `${(value * 100).toFixed(1)}%`;
      if (opts.count) return Math.round(value).toLocaleString();
      return value.toFixed(2);
    };
  };

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-4">
        <CardTitle className="shrink-0 pt-1">Progress</CardTitle>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {metricColumns.map((metric, i) => (
            <button
              key={metric}
              onClick={() => toggleMetric(metric)}
              className={cn(
                "flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-xs transition-colors",
                isEnabled(metric)
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: isEnabled(metric)
                    ? METRIC_COLORS[i % METRIC_COLORS.length]
                    : "#6e6e88",
                }}
              />
              {metric}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            horizontal
            vertical={false}
          />
          <XAxis
            dataKey="index"
            type="number"
            domain={[1, chartData.length]}
            tick={{ fontSize: 12, fill: axisColor, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
            label={{
              value: "Experiment #",
              position: "insideBottom",
              offset: -2,
              style: { fontSize: 12, fill: axisColor, fontFamily: "JetBrains Mono" },
            }}
          />
          {activeMetrics.map((metric, i) => (
            <YAxis
              key={metric}
              yAxisId={metric}
              orientation={i === 0 ? "left" : "right"}
              tickFormatter={pctFormatter(metric)}
              tick={{ fontSize: 12, fill: axisColor, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
          ))}
          <Tooltip
            content={
              <CustomTooltip metricHints={metricHints} />
            }
          />

          {activeMetrics.map((metric, i) => (
            <Line
              key={`line-${metric}`}
              yAxisId={metric}
              dataKey={`line_${metric}`}
              type="stepAfter"
              stroke={METRIC_COLORS[i % METRIC_COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}

          {activeMetrics.map((metric, i) => (
            <Scatter
              key={`scatter-${metric}`}
              yAxisId={metric}
              dataKey={`scatter_${metric}`}
              isAnimationActive={false}
            >
              {chartData.map((entry, idx) => {
                const status = entry.status;
                const fill = STATUS_FILL[status] ?? "#55556a";
                const isKept = KEPT_STATUSES.has(status);
                return (
                  <Cell
                    key={idx}
                    fill={fill}
                    fillOpacity={isKept ? 0.9 : 0.35}
                    r={isKept ? 4 : 2}
                    stroke={isKept ? fill : "none"}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                  />
                );
              })}
            </Scatter>
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
