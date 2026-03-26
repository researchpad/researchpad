import { FlaskConical } from "lucide-react";
import { ExperimentsTable } from "@/components/experiments/experiments-table";
import { CommandHint } from "@/components/ui/command-hint";

export function ExperimentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Experiments</h1>
        <p className="mt-1 text-[15px] text-text-secondary">
          All experiment runs with auto-discovered metrics
        </p>
      </div>
      <CommandHint
        icon={FlaskConical}
        command="/experiment"
        description="run a new experiment"
      />
      <ExperimentsTable />
    </div>
  );
}
