import { useState } from "react";
import {
  LayoutDashboard,
  FlaskConical,
  BookOpen,
  Bug,
  Lightbulb,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const navItems: {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  enabled: boolean;
}[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { to: "/experiments", label: "Experiments", icon: FlaskConical, enabled: true },
  { to: "/research", label: "Research", icon: BookOpen, enabled: true },
  { to: "/debug", label: "Debug", icon: Bug, enabled: true },
  { to: "/insights", label: "Insights", icon: Lightbulb, enabled: true },
];

export function Sidebar() {
  const { location } = useRouterState();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border-subtle bg-bg-surface transition-[width] duration-200",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div className="flex h-14 items-center gap-3 border-b border-border-subtle px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/15">
          <FlaskConical className="h-4.5 w-4.5 text-accent-cyan" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-mono text-[15px] font-semibold tracking-tight text-text-primary">
              researchpad
            </span>
            <span className="font-mono text-[15px] font-normal text-text-muted">/ui</span>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <span
                key={item.to}
                className={cn(
                  "group flex cursor-not-allowed items-center rounded-lg text-sm font-medium text-text-muted/50",
                  collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && (
                  <>
                    <span>{item.label}</span>
                    <span className="ml-auto rounded bg-bg-hover px-1.5 py-0.5 font-mono text-xs text-text-muted">
                      soon
                    </span>
                  </>
                )}
              </span>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-bg-elevated text-text-primary"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle px-2 py-2">
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="flex w-full items-center justify-center rounded-md py-1.5 text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
        {!collapsed && (
          <p className="mt-1 text-center font-mono text-xs text-text-muted">v0.4.0</p>
        )}
      </div>
    </aside>
  );
}
