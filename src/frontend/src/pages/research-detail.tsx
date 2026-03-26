import { useState } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  GraduationCap,
  Trophy,
  Newspaper,
  Github,
  Globe,
  Tag,
  FlaskConical,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useResearchDetail, useResearchPrompt } from "@/hooks/use-research";

const SOURCE_ICONS: Record<string, typeof GraduationCap> = {
  paper: GraduationCap,
  kaggle: Trophy,
  blog: Newspaper,
  github: Github,
  general: Globe,
};

const SOURCE_COLORS: Record<string, string> = {
  paper: "bg-accent-purple/15 text-accent-purple border-accent-purple/30",
  kaggle: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  blog: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
  github: "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30",
  general: "bg-bg-hover text-text-secondary border-border-default",
};

export function ResearchDetailPage() {
  const { slug } = useParams({ from: "/research/$slug" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading } = useResearchDetail(slug);
  const { data: promptData } = useResearchPrompt(slug);
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleCopyPrompt() {
    if (!promptData?.prompt) return;
    navigator.clipboard.writeText(promptData.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteResearch(slug);
      queryClient.invalidateQueries({ queryKey: ["research"] });
      navigate({ to: "/research" });
    } catch {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
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
          to="/research"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to research
        </Link>
        <Card className="p-8 text-center">
          <p className="text-sm text-text-muted">Research artifact not found</p>
        </Card>
      </div>
    );
  }

  const Icon = SOURCE_ICONS[data.source_type] ?? Globe;
  const colorClass = SOURCE_COLORS[data.source_type] ?? SOURCE_COLORS.general;

  return (
    <div className="space-y-6">
      <Link
        to="/research"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to research
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary leading-tight">{data.title}</h1>
            {data.summary && (
              <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{data.summary}</p>
            )}
          </div>

          {promptData?.prompt && (
            <div
              onClick={handleCopyPrompt}
              className="flex items-center gap-3 cursor-pointer rounded-lg border border-border-subtle bg-bg-elevated px-4 py-2.5 transition-colors hover:border-accent-cyan/30"
            >
              <p className="font-mono text-xs text-text-muted shrink-0">Use in Prompt</p>
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
                    <blockquote className="border-l-2 border-accent-cyan/30 pl-4 italic text-text-muted my-3">
                      {children}
                    </blockquote>
                  ),
                  hr: () => <hr className="border-border-subtle my-4" />,
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
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-text-muted" />
                <span
                  className={cn(
                    "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-xs font-medium",
                    colorClass
                  )}
                >
                  {data.source_type}
                </span>
              </div>

              {data.source_url && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Source</p>
                  <a
                    href={data.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-accent-cyan hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {new URL(data.source_url).hostname}
                  </a>
                </div>
              )}

              {data.date_retrieved && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Date Retrieved</p>
                  <p className="text-sm text-text-secondary">{data.date_retrieved}</p>
                </div>
              )}

              {data.loop && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Loop</p>
                  <p className="font-mono text-sm text-text-secondary">{data.loop}</p>
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

          {data.related_experiments.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5" />
                Related Experiments
              </h3>
              <div className="space-y-2">
                {data.related_experiments.map((expId) => (
                  <Link
                    key={expId}
                    to="/experiments/$experimentId"
                    params={{ experimentId: expId }}
                    className="block font-mono text-sm text-accent-cyan hover:underline"
                  >
                    {expId}
                  </Link>
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

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent-red/30 bg-accent-red/10 px-3 py-2.5 text-sm font-medium text-accent-red transition-colors hover:bg-accent-red/20"
          >
            <Trash2 className="h-4 w-4" />
            Delete artifact
          </button>
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-lg border border-border-subtle bg-bg-surface p-6 shadow-xl">
            <h3 className="text-base font-semibold text-text-primary mb-2">Delete research artifact</h3>
            <p className="text-sm text-text-secondary mb-5 leading-relaxed">
              Are you sure you want to delete <strong>{data.title}</strong>? This will remove the file from disk and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="rounded-md px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md border border-accent-red/30 bg-accent-red/15 px-4 py-2 text-sm font-medium text-accent-red hover:bg-accent-red/25 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
