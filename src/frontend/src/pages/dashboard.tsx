import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          Experiment progress overview
        </p>
      </div>
      <SummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
