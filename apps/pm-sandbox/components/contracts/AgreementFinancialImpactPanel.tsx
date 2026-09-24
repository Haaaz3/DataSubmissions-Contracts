import { calculateEstimatedSettlement } from "@/lib/contracts/settlement";
import type { Contract } from "@/types/contract";
import KpiCard from "@/components/KpiCard";
import ScorecardIcon from "@/components/contracts/ScorecardIcon";

function formatMoney(amount: number) {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function AgreementFinancialImpactPanel({ contract }: { contract: Contract }) {
  const settlement = calculateEstimatedSettlement(contract);
  const settlementStatusText =
    settlement.status === "shared_savings"
      ? "Eligible shared savings"
      : settlement.status === "shared_risk"
      ? "Downside exposure active"
      : settlement.status === "quality_blocked"
      ? "Quality gate blocked"
      : settlement.status === "below_threshold"
      ? "Below financial threshold"
      : "Neutral";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white via-white to-indigo-50/40 p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">Financial posture</p>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            <span className="mr-1 inline-flex align-middle text-indigo-600">
              <ScorecardIcon name="banknote" className="h-4 w-4" />
            </span>
            Financial Context
          </h3>
          <p className="text-xs text-slate-500">
            Phase 1 tie-in to agreement economics based on current contract settlement estimate.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
          {settlementStatusText}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard
          label="Net Settlement Estimate"
          value={formatMoney(settlement.estimatedAmount)}
          subtext="Current modeled year-end impact"
          highlight={settlement.estimatedAmount < 0 ? "danger" : "default"}
        />
        <KpiCard
          label="Gross Savings / Loss"
          value={formatMoney(settlement.grossDeltaAmount)}
          subtext="Benchmark spend vs actual spend"
          highlight={settlement.grossDeltaAmount < 0 ? "warning" : "default"}
        />
        <KpiCard
          label="Quality Gate"
          value={settlement.qualityPassed ? "Passed" : "Not Met"}
          subtext={`Threshold ${settlement.thresholdMet ? "met" : "not met"}`}
          highlight={settlement.qualityPassed ? "default" : "warning"}
        />
      </div>
    </div>
  );
}
