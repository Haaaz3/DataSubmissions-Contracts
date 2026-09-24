import Link from "next/link";
import { ActionItem } from "@/types/action";
import { Contract } from "@/types/contract";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

// ── helpers ─────────────────────────────────────────────────────────────────

const impactPills: Record<string, string> = {
  "Cost":             "bg-indigo-50 text-indigo-700",
  "Quality":          "bg-emerald-50 text-emerald-700",
  "Utilization":      "bg-sky-50 text-sky-700",
  "Patient Outcomes": "bg-violet-50 text-violet-700",
};

const gapColors = {
  critical: "border-red-200 bg-red-50",
  moderate: "border-amber-200 bg-amber-50",
  minor:    "border-slate-200 bg-slate-50",
};

const gapLabelColors = {
  critical: "text-red-600",
  moderate: "text-amber-600",
  minor:    "text-slate-500",
};

const effortColors: Record<string, string> = {
  Low:    "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High:   "bg-red-100 text-red-700",
};

// ── component ────────────────────────────────────────────────────────────────

interface ActionCardProps {
  action: ActionItem;
  /** When provided, shows contract name + status in the header */
  contract?: Contract;
}

export default function ActionCard({ action, contract }: ActionCardProps) {
  const gap = action.performanceGap;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={action.priority} />
          {action.impactTypes.map((t) => (
            <span key={t} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${impactPills[t] ?? "bg-slate-100 text-slate-600"}`}>
              {t}
            </span>
          ))}
        </div>
        {contract && (
          <Link
            href={`/contracts/${contract.id}`}
            className="flex items-center gap-1.5 text-right hover:opacity-80"
          >
            <span className="text-xs text-slate-500 hidden sm:inline">{contract.name.split(" — ")[0]}</span>
            <StatusBadge status={contract.status} />
          </Link>
        )}
      </div>

      {/* Title */}
      <p className="px-5 pb-3 text-sm font-bold leading-snug text-slate-900">{action.title}</p>

      {/* ── Chain: Gap → Driver → Action ─────────────────────────────────── */}
      <div className="px-5 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">

          {/* 1 — Performance Gap */}
          <div className={`rounded-xl border p-3 sm:flex-1 ${gapColors[gap.severity]}`}>
            <p className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${gapLabelColors[gap.severity]}`}>
              Performance Gap
            </p>
            <p className="text-xs font-semibold text-slate-900">{gap.metric}</p>
            <p className="text-sm font-bold text-slate-900 leading-tight mt-0.5">{gap.current}</p>
            <p className="text-xs text-slate-500 mt-0.5">{gap.delta} · {gap.target}</p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center text-slate-300 sm:px-2 sm:text-lg">
            <span className="hidden sm:inline">→</span>
            <span className="sm:hidden text-xs text-slate-300">↓</span>
          </div>

          {/* 2 — Population Driver */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 sm:flex-1">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-indigo-500">
              Population Driver
            </p>
            <p className="text-xs font-semibold text-indigo-900 leading-snug">{action.populationDriver.summary}</p>
            <p className="text-xs text-indigo-700 mt-0.5 leading-snug">{action.populationDriver.detail}</p>
            {action.populationDriver.memberCount && (
              <p className="mt-1 text-[10px] font-semibold text-indigo-500">
                {action.populationDriver.memberCount.toLocaleString()} members affected
              </p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center text-slate-300 sm:px-2 sm:text-lg">
            <span className="hidden sm:inline">→</span>
            <span className="sm:hidden text-xs text-slate-300">↓</span>
          </div>

          {/* 3 — Recommended Action */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:flex-1">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
              Recommended Action
            </p>
            <p className="text-xs leading-relaxed text-emerald-900">{action.recommendedAction}</p>
          </div>
        </div>
      </div>

      {/* Footer: impact / effort / time */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
        <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
          <span className="text-slate-400">Impact:</span>
          <span className="font-semibold text-indigo-700">{action.estimatedImpact}</span>
        </div>
        <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${effortColors[action.effort]}`}>
          {action.effort} effort
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-slate-500 ring-1 ring-slate-200">
          ⏱ {action.timeToImpact}
        </div>
      </div>
    </div>
  );
}
