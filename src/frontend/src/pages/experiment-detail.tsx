import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Copy, Check, GitBranch, FileBarChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MetricHeader } from "@/components/experiments/metric-header";
import { DiffViewer } from "@/components/experiments/diff-viewer";
import { EvalViewer } from "@/components/experiments/eval-viewer";
import {
  useExperimentDetail,
  useCommitInfo,
  useEvalFiles,
  useExplainCommand,
} from "@/hooks/use-experiment-detail";

type DetailTab = "diff" | "eval";

export function ExperimentDetailPage() {
  const { experimentId } = useParams({ from: "/experiments/$experimentId" });
  const { data, isLoading } = useExperimentDetail(experimentId);
  const experiment = data?.experiment;

  const { data: commitData, isLoading: diffLoading } = useCommitInfo(
    experimentId,
    !!experiment?.commit
  );
  const { data: evalData } = useEvalFiles(
    experimentId,
    !!experiment?.output_path
  );
  const { data: explainData } = useExplainCommand(experimentId);

  const [activeTab, setActiveTab] = useState<DetailTab>("diff");
  const [copied, setCopied] = useState(false);

  function handleCopyCommand() {
    if (!explainData?.command) return;
    navigator.clipboard.writeText(explainData.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-bg-elevated" />
        <div className="h-32 animate-pulse rounded bg-bg-elevated" />
      </div>
    );
  }

  if (!experiment || !data) {
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
          <p className="text-sm text-text-muted">Experiment not found</p>
        </Card>
      </div>
    );
  }

  const tabs: { id: DetailTab; label: string; icon: typeof GitBranch; count?: number }[] = [
    { id: "diff", label: "Git Diff", icon: GitBranch, count: commitData?.files.length },
    { id: "eval", label: "Eval Artifacts", icon: FileBarChart, count: evalData?.files.length },
  ];

  return (
    <div className="space-y-6">
      <Link
        to="/experiments"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to experiments
      </Link>

      <MetricHeader
        experiment={experiment}
        baseline={data.baseline}
        metricColumns={data.metric_columns}
        metricHints={data.metric_hints}
      />

      {explainData?.command && (
        <div
          onClick={handleCopyCommand}
          className="flex items-center gap-3 cursor-pointer rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 transition-colors hover:border-accent-cyan/30"
        >
          <p className="font-mono text-xs text-text-muted shrink-0">Cursor command</p>
          <code className="font-mono text-sm text-accent-cyan truncate flex-1">
            {explainData.command}
          </code>
          <span className="shrink-0 text-text-muted">
            {copied ? (
              <Check className="h-4 w-4 text-accent-emerald" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </span>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-border-subtle">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-accent-cyan text-text-primary"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count != null && (
                <span className="ml-1 rounded bg-bg-hover px-1.5 py-0.5 font-mono text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "diff" && (
        <div>
          {!experiment.commit ? (
            <Card className="p-4">
              <p className="text-sm text-text-muted">No commit hash recorded for this experiment.</p>
            </Card>
          ) : diffLoading ? (
            <div className="space-y-2">
              <div className="h-10 animate-pulse rounded bg-bg-elevated" />
              <div className="h-48 animate-pulse rounded bg-bg-elevated" />
            </div>
          ) : commitData ? (
            <DiffViewer
              files={commitData.files}
              stats={commitData.stats}
              message={commitData.message}
              author={commitData.author}
              date={commitData.date}
            />
          ) : (
            <Card className="p-4">
              <p className="text-sm text-text-muted">Failed to load diff data.</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === "eval" && (
        <EvalViewer
          experimentId={experimentId}
          files={evalData?.files ?? []}
          evalDir={evalData?.eval_dir}
          dirMissing={evalData?.dir_missing}
        />
      )}
    </div>
  );
}
