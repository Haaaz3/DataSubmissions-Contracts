import Link from "next/link";
import ActionCard from "@/components/ActionCard";
import FeatureGuard from "@/components/FeatureGuard";
import { mockActionItems, actionSummary } from "@/lib/actionData";
import { mockContracts } from "@/lib/mockData";
import { InsightPriority } from "@/types/population";

// Build a contract lookup map once
const contractMap = Object.fromEntries(mockContracts.map((c) => [c.id, c]));

// Sort: High first, then by gap severity (critical → moderate → minor)
const priorityOrder  = { High: 0, Medium: 1, Low: 2 };
const severityOrder  = { critical: 0, moderate: 1, minor: 2 };
const sortedActions  = [...mockActionItems].sort((a, b) => {
  const p = priorityOrder[a.priority] - priorityOrder[b.priority];
  if (p !== 0) return p;
  return severityOrder[a.performanceGap.severity] - severityOrder[b.performanceGap.severity];
});

// Group by priority tier for section headers
const groups: Record<InsightPriority, typeof sortedActions> = {
  High:   sortedActions.filter((a) => a.priority === "High"),
  Medium: sortedActions.filter((a) => a.priority === "Medium"),
  Low:    sortedActions.filter((a) => a.priority === "Low"),
};

const priorityMeta: Record<InsightPriority, { label: string; dot: string; description: string }> = {
  High:   { label: "High Priority",   dot: "bg-red-400",    description: "Address within 30 days — these gaps are compounding costs or quality failures now." },
  Medium: { label: "Medium Priority", dot: "bg-amber-400",  description: "Plan within 60 days — measurable impact on performance or risk of deterioration." },
  Low:    { label: "Low Priority",    dot: "bg-slate-300",  description: "Opportunistic improvements with lower urgency." },
};

export default function ActionsPage() {
  return (
    <FeatureGuard page="actions">
      <div className="space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Action Intelligence</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Every action item traces a direct chain from a measurable contract performance gap
          to the population health driver behind it — and a recommended intervention with
          estimated impact.
        </p>
      </div>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: "Total Actions",       value: actionSummary.total,               accent: "text-slate-900" },
          { label: "High Priority",       value: actionSummary.high,                accent: "text-red-600" },
          { label: "Medium Priority",     value: actionSummary.medium,              accent: "text-amber-600" },
          { label: "Contracts Covered",   value: actionSummary.contractsWithActions, accent: "text-indigo-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200 min-w-[130px]">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Action groups by priority */}
      {(["High", "Medium"] as InsightPriority[]).map((tier) => {
        const items = groups[tier];
        if (!items.length) return null;
        const meta  = priorityMeta[tier];

        return (
          <div key={tier}>
            {/* Section header */}
            <div className="mb-4 flex items-start gap-3">
              <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${meta.dot}`} />
              <div>
                <h2 className="text-base font-semibold text-slate-900">{meta.label}</h2>
                <p className="text-xs text-slate-400">{meta.description}</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              {items.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  contract={contractMap[action.contractId]}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Footer CTA */}
      <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-6">
        <Link href="/contracts" className="text-sm font-medium text-indigo-600 hover:underline">
          ← View all contracts
        </Link>
        <Link href="/population" className="text-sm font-medium text-indigo-600 hover:underline">
          View population overview →
        </Link>
      </div>
      </div>
    </FeatureGuard>
  );
}
