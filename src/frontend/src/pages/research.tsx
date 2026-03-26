import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Search,
  ExternalLink,
  GraduationCap,
  Trophy,
  Newspaper,
  Github,
  Globe,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { CommandHint } from "@/components/ui/command-hint";
import { useResearchList } from "@/hooks/use-research";
import { cn } from "@/lib/utils";
import type { ResearchArtifact } from "@/lib/types";

const SOURCE_ICONS: Record<string, typeof BookOpen> = {
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

const SOURCE_TYPES = ["all", "paper", "kaggle", "blog", "github", "general"];

function ResearchCard({ artifact }: { artifact: ResearchArtifact }) {
  const Icon = SOURCE_ICONS[artifact.source_type] ?? Globe;
  const colorClass = SOURCE_COLORS[artifact.source_type] ?? SOURCE_COLORS.general;

  return (
    <Link to="/research/$slug" params={{ slug: artifact.slug }}>
      <Card className="group h-full p-0 transition-colors hover:border-accent-cyan/30">
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-xs font-medium",
                colorClass
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {artifact.source_type}
            </span>
            {artifact.date_retrieved && (
              <span className="text-xs text-text-muted whitespace-nowrap">
                {artifact.date_retrieved}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-[15px] font-medium text-text-primary group-hover:text-accent-cyan transition-colors line-clamp-2 leading-snug">
              {artifact.title}
            </h3>
            {artifact.summary && (
              <p className="mt-2 text-sm text-text-secondary line-clamp-3 leading-relaxed">
                {artifact.summary}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {artifact.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded bg-bg-hover px-2 py-0.5 font-mono text-xs text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          {artifact.source_url && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="truncate">{new URL(artifact.source_url).hostname}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

export function ResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (searchQuery) f.search = searchQuery;
    if (sourceFilter !== "all") f.source_type = sourceFilter;
    return f;
  }, [searchQuery, sourceFilter]);

  const { data, isLoading } = useResearchList(
    Object.keys(filters).length > 0 ? filters : undefined
  );

  const artifacts = data?.artifacts ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Research</h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          Research artifacts from academic papers, Kaggle, blogs, and more
        </p>
      </div>

      <CommandHint
        icon={BookOpen}
        command="/research"
        description="research a new topic"
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search research..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border-subtle bg-bg-elevated py-2 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          {SOURCE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSourceFilter(type)}
              className={cn(
                "rounded-md px-2.5 py-1.5 font-mono text-xs font-medium transition-colors",
                sourceFilter === type
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-bg-elevated" />
          ))}
        </div>
      ) : artifacts.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-text-muted mb-3" />
          <p className="text-sm text-text-muted">No research artifacts found</p>
          <p className="mt-1 text-xs text-text-muted">
            Use the <code className="font-mono text-accent-cyan">/research</code> command to create one
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artifacts.map((artifact) => (
            <ResearchCard key={artifact.slug} artifact={artifact} />
          ))}
        </div>
      )}
    </div>
  );
}
