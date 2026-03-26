import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Copy,
  Check,
  FlaskConical,
  Tag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDebugDetail, useDebugPrompt } from "@/hooks/use-debug";

export function DebugDetailPage() {
  const { slug } = useParams({ from: "/debug/$slug" });
  const { data, isLoading } = useDebugDetail(slug);
  const { data: promptData } = useDebugPrompt(slug);
  const [copied, setCopied] = useState(false);

  function handleCopyPrompt() {
    if (!promptData?.prompt) return;
    navigator.clipboard.writeText(promptData.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-bg-elevated" />
        <div className="h-64 animate-pulse rounded bg-bg-elevated" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link
          to="/debug"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to debug
        </Link>
        <Card className="p-8 text-center">
          <p className="text-sm text-text-muted">Debug analysis not found</p>
        </Card>
      </div>
    );
  }

  const isActive = data.status === "active";

  return (
    <div className="space-y-6">
      <Link
        to="/debug"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to debug
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary leading-tight">{data.title}</h1>
              {data.analyzed_experiment && (
                <p className="mt-1.5 text-[15px] text-text-secondary">
                  Analyzed experiment{" "}
                  <Link
                    to="/experiments/$experimentId"
                    params={{ experimentId: data.analyzed_experiment }}
                    className="font-mono text-accent-cyan hover:underline"
                  >
                    {data.analyzed_experiment}
                  </Link>
                </p>
              )}
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-sm border px-2.5 py-1 font-mono text-sm font-medium",
                isActive
                  ? "bg-accent-amber/15 text-accent-amber border-accent-amber/30"
                  : "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30"
              )}
            >
              {data.status}
            </span>
          </div>

          {promptData?.prompt && (
            <div
              onClick={handleCopyPrompt}
              className="flex items-center gap-3 cursor-pointer rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 transition-colors hover:border-accent-cyan/30"
            >
              <p className="font-mono text-xs text-text-muted shrink-0">Targeted Experiment</p>
              <code className="font-mono text-sm text-accent-cyan truncate flex-1">
                {promptData.prompt.split("\n")[0]}
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

          <Card className="p-6">
            <div className="prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-semibold text-text-primary mt-8 mb-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold text-text-primary mt-7 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-text-primary mt-5 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-[15px] text-text-secondary leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 text-[15px] text-text-secondary space-y-1.5 mb-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 text-[15px] text-text-secondary space-y-1.5 mb-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-[15px] text-text-secondary leading-relaxed">
                      {children}
                    </li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-cyan hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) {
                      return (
                        <code className="block rounded-lg bg-bg-primary border border-border-subtle p-4 font-mono text-sm text-text-secondary overflow-x-auto my-4">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="rounded bg-bg-hover px-1.5 py-0.5 font-mono text-sm text-accent-cyan">
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => <pre className="my-0">{children}</pre>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="border-b border-border-subtle">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2.5 text-left font-medium text-text-muted">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2.5 text-text-secondary border-b border-border-subtle">
                      {children}
                    </td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-accent-cyan/30 pl-5 italic text-text-muted my-4">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="border-border-subtle my-5" />,
                }}
              >
                {data.content ?? ""}
              </ReactMarkdown>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted">
              Metadata
            </h3>

            <div className="space-y-3.5">
              {data.date && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Date</p>
                  <p className="text-sm text-text-secondary">{data.date}</p>
                </div>
              )}

              {data.analyzed_experiment && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Analyzed Experiment</p>
                  <Link
                    to="/experiments/$experimentId"
                    params={{ experimentId: data.analyzed_experiment }}
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-accent-cyan hover:underline"
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    {data.analyzed_experiment}
                  </Link>
                </div>
              )}

              {data.analyzed_run_folder && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Run Folder</p>
                  <p className="font-mono text-xs text-text-muted break-all">
                    {data.analyzed_run_folder}
                  </p>
                </div>
              )}

              {data.loop && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Loop</p>
                  <p className="font-mono text-sm text-text-secondary">{data.loop}</p>
                </div>
              )}

              {data.resolved_by && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Resolved By</p>
                  <Link
                    to="/experiments/$experimentId"
                    params={{ experimentId: data.resolved_by }}
                    className="font-mono text-sm text-accent-emerald hover:underline"
                  >
                    {data.resolved_by}
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {data.tags.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-bg-hover px-2 py-0.5 font-mono text-xs text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted">
              File
            </h3>
            <p className="font-mono text-xs text-text-muted break-all">
              {data.file_path}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
