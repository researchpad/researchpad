import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronRight,
  TrendingDown,
  BookOpen,
  Bug,
  FlaskConical,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { CommandHint } from "@/components/ui/command-hint";
import { useThemes, useDiminishingReturns } from "@/hooks/use-insights";
import { cn, cssVar } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import type { Theme } from "@/lib/types";

// --- Themes Section ---

function ThemeCard({ theme }: { theme: Theme }) {
  const [expanded, setExpanded] = useState(false);
  const keptCount = theme.experiments.filter(
    (e) => e.status === "keep" || e.status === "keep*"
  ).length;
  const discardedCount = theme.experiments.filter(
    (e) => e.status === "discard"
  ).length;

  return (
    <Card className="p-0 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-hover/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" />
        )}
        <span className="flex-1 font-mono text-sm font-medium text-text-primary">
          {theme.name}
        </span>
        <span className="font-mono text-xs text-text-muted">
          {theme.experiments.length} exp
        </span>
        {keptCount > 0 && (
          <span className="rounded-sm bg-accent-emerald/15 px-1.5 py-0.5 font-mono text-xs text-accent-emerald">
            {keptCount} kept
          </span>
        )}
        {discardedCount > 0 && (
          <span className="rounded-sm bg-bg-hover px-1.5 py-0.5 font-mono text-xs text-text-muted">
            {discardedCount} discard
          </span>
        )}
      </button>
      {expanded && (
        <div className="border-t border-border-subtle px-4 py-3 space-y-2">
          {theme.experiments.map((exp) => (
            <Link
              key={exp.id}
              to="/experiments/$experimentId"
              params={{ experimentId: exp.id }}
              className="flex items-center gap-3 text-sm hover:bg-bg-hover/50 -mx-2 px-2 py-0.5 rounded transition-colors"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  exp.status === "keep" || exp.status === "keep*"
                    ? "bg-accent-emerald"
                    : exp.status === "discard"
                      ? "bg-text-muted"
                      : exp.status === "crash" || exp.status === "timeout"
                        ? "bg-accent-red"
                        : "bg-accent-amber"
                )}
              />
              <span className="font-mono text-xs text-accent-cyan">{exp.id}</span>
              <span className="text-xs text-text-secondary truncate">{exp.description}</span>
            </Link>
          ))}
          {Object.entries(theme.metric_deltas).some(([, v]) => v != null) && (
            <div className="mt-2 pt-2 border-t border-border-subtle flex items-center gap-4">
              <span className="text-xs text-text-muted">Net movement:</span>
              {Object.entries(theme.metric_deltas).map(([key, val]) =>
                val != null ? (
                  <span key={key} className="font-mono text-xs text-text-secondary">
                    {key}: <span className={val < 0 ? "text-accent-emerald" : "text-accent-red"}>
                      {val >= 0 ? "+" : ""}{(val * 100).toFixed(2)}pp
                    </span>
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ThemesSection() {
  const { data, isLoading } = useThemes();
  const themes = data?.themes ?? [];

  return (
    <div className="space-y-3">
      <CardTitle>Experiment Themes</CardTitle>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-bg-elevated" />
          ))}
        </div>
      ) : themes.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-text-muted">
            Not enough experiments to discover themes yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {themes.map((theme) => (
            <ThemeCard key={theme.name} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Diminishing Returns ---

function DiminishingReturnsSection() {
  const { data, isLoading } = useDiminishingReturns();
  const { resolved } = useTheme();
  const gridColor = cssVar("--color-border-subtle") || (resolved === "dark" ? "#1e1e2e" : "#e8e9ec");
  const axisColor = cssVar("--color-text-muted") || (resolved === "dark" ? "#6e6e88" : "#8c909a");

  if (isLoading) {
    return (
      <div className="space-y-3">
        <CardTitle>Diminishing Returns</CardTitle>
        <Card className="h-[280px] animate-pulse" />
      </div>
    );
  }

  const points = data?.points ?? [];
  const metric = data?.metric ?? "";

  if (points.length < 3) {
    return (
      <div className="space-y-3">
        <CardTitle>Diminishing Returns</CardTitle>
        <Card className="p-6 text-center">
          <TrendingDown className="mx-auto h-8 w-8 text-text-muted mb-3" />
          <p className="text-sm text-text-muted">
            Need at least 3 kept experiments to analyze improvement rate.
          </p>
        </Card>
      </div>
    );
  }

  const chartData = points.map((p) => ({
    ...p,
    rolling_pct: p.rolling_avg != null ? p.rolling_avg * 100 : null,
    delta_pct: p.delta != null ? p.delta * 100 : null,
  }));

  return (
    <div className="space-y-3">
      <CardTitle>Diminishing Returns</CardTitle>
      <Card>
        <p className="mb-4 text-xs text-text-muted">
          Rolling improvement on <span className="font-mono text-text-secondary">{metric}</span> across kept experiments (5-experiment window)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal vertical={false} />
            <XAxis
              dataKey="experiment_id"
              tick={{ fontSize: 11, fill: axisColor, fontFamily: "JetBrains Mono" }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: axisColor, fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v.toFixed(2)}pp`}
              width={65}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border-default bg-bg-elevated p-3 shadow-lg">
                    <p className="font-mono text-sm font-semibold text-text-primary">{d.experiment_id}</p>
                    <p className="mt-1 font-mono text-xs text-text-muted">
                      Delta: <span className="text-text-primary">{d.delta_pct != null ? `${d.delta_pct.toFixed(2)}pp` : "—"}</span>
                    </p>
                    <p className="font-mono text-xs text-text-muted">
                      Rolling avg: <span className="text-text-primary">{d.rolling_pct != null ? `${d.rolling_pct.toFixed(2)}pp` : "—"}</span>
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine y={0} stroke={axisColor} strokeDasharray="3 3" />
            <Line
              dataKey="rolling_pct"
              type="monotone"
              stroke="#00d4ff"
              strokeWidth={2}
              dot={{ r: 3, fill: "#00d4ff" }}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              dataKey="delta_pct"
              type="monotone"
              stroke={axisColor}
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {data?.recommendation && (
        <Card className="border-accent-amber/30 bg-accent-amber/5">
          <div className="flex gap-3">
            <TrendingDown className="h-5 w-5 shrink-0 text-accent-amber mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-accent-amber">Plateau Detected</p>
              <p className="text-sm text-text-secondary">{data.recommendation}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-6">
        {data && data.untried_research > 0 && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{data.untried_research} untried research idea{data.untried_research > 1 ? "s" : ""}</span>
          </div>
        )}
        {data && data.unresolved_debug > 0 && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Bug className="h-3.5 w-3.5" />
            <span>{data.unresolved_debug} unresolved debug issue{data.unresolved_debug > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main Page ---

export function InsightsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Insights</h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          Experiment themes and improvement trends
        </p>
      </div>

      <CommandHint
        icon={FlaskConical}
        command="/experiment"
        description="run a new experiment"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <DiminishingReturnsSection />
        </div>
        <div className="lg:col-span-2">
          <ThemesSection />
        </div>
      </div>
    </div>
  );
}
