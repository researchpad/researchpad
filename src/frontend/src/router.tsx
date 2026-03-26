import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { Sidebar } from "./components/layout/sidebar";
import { Header } from "./components/layout/header";
import { ShortcutsHelp } from "./components/ui/shortcuts-help";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { DashboardPage } from "./pages/dashboard";
import { ExperimentsPage } from "./pages/experiments";
import { ExperimentDetailPage } from "./pages/experiment-detail";
import { ExperimentComparePage } from "./pages/experiment-compare";
import { ResearchPage } from "./pages/research";
import { ResearchDetailPage } from "./pages/research-detail";
import { DebugPage } from "./pages/debug";
import { DebugDetailPage } from "./pages/debug-detail";
import { InsightsPage } from "./pages/insights";

function RootLayout() {
  const { showHelp, closeHelp } = useKeyboardShortcuts();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto px-4 py-5 md:px-8 md:py-7">
          <Outlet />
        </main>
      </div>
      {showHelp && <ShortcutsHelp onClose={closeHelp} />}
    </div>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const experimentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiments",
  component: ExperimentsPage,
});

const experimentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiments/$experimentId",
  component: ExperimentDetailPage,
});

const experimentCompareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experiments/compare",
  component: ExperimentComparePage,
});

const researchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/research",
  component: ResearchPage,
});

const researchDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/research/$slug",
  component: ResearchDetailPage,
});

const debugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/debug",
  component: DebugPage,
});

const debugDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/debug/$slug",
  component: DebugDetailPage,
});

const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/insights",
  component: InsightsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  experimentsRoute,
  experimentCompareRoute,
  experimentDetailRoute,
  researchRoute,
  researchDetailRoute,
  debugRoute,
  debugDetailRoute,
  insightsRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
