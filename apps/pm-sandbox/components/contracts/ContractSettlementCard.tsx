"use client";

import type { Contract } from "@/types/contract";
import { calculateEstimatedSettlement } from "@/lib/contracts/settlement";
import ScorecardIcon from "@/components/contracts/ScorecardIcon";

function formatMoney(amount: number) {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function ContractSettlementCard({ contract }: { contract: Contract }) {
  const settlement = calculateEstimatedSettlement(contract);

  const statusConfig = {
    shared_savings: {
      badge: "Shared Savings",
      amountClass: "text-emerald-700",
      badgeClass: "bg-emerald-100 text-emerald-700",
    },
    shared_risk: {
      badge: "Shared Risk",
      amountClass: "text-red-700",
      badgeClass: "bg-red-100 text-red-700",
    },
    quality_blocked: {
      badge: "Quality Gate Blocked",
      amountClass: "text-amber-700",
      badgeClass: "bg-amber-100 text-amber-700",
    },
    below_threshold: {
      badge: "Below Threshold",
      amountClass: "text-slate-700",
      badgeClass: "bg-slate-100 text-slate-700",
    },
    neutral: {
      badge: "Neutral",
      amountClass: "text-slate-700",
      badgeClass: "bg-slate-100 text-slate-700",
    },
  } as const;

  const config = statusConfig[settlement.status];
  const heading = settlement.estimatedAmount >= 0 ? "Estimated Shared Savings" : "Estimated Shared Risk";
  const statusSummary =
    settlement.status === "shared_savings"
      ? `Threshold met and quality gate passed. ${settlement.terms.sharedSavingsRate}% shared-savings rate applied.`
      : settlement.status === "shared_risk"
      ? `Loss threshold met. ${settlement.terms.sharedRiskRate}% shared-risk rate applied (capped by downside terms).`
      : settlement.status === "quality_blocked"
      ? "Gross savings detected, but payout is blocked because quality gate was not met."
      : settlement.status === "below_threshold"
      ? "Performance is within contract corridor and has not crossed payout/risk trigger thresholds."
      : "No material settlement signal detected at current performance levels.";

  const grossDeltaWidth = Math.min(Math.abs(settlement.grossDeltaPercent), 100);

  return (
    <>
      <details className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md open:shadow-md">
        <summary className="list-none cursor-pointer">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-indigo-700">
                <span className="mr-1 inline-flex align-middle">
                  <ScorecardIcon name="calculator" className="h-3.5 w-3.5" />
                </span>
                VBC Settlement Estimate
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">{heading}</p>
              <p className={`mt-1 text-3xl font-bold tabular-nums ${config.amountClass}`}>{formatMoney(settlement.estimatedAmount)}</p>
              <p className="mt-1 text-xs text-slate-600">
                Based on benchmark vs actual PMPM, lives, quality gate, and sharing terms.
              </p>

              <div className="mt-2 flex items-center gap-2 text-[11px]">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${settlement.grossDeltaAmount >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  <span className="mr-1 inline-flex align-middle">
                    <ScorecardIcon name={settlement.grossDeltaAmount >= 0 ? "trendingUp" : "trendingDown"} className="h-3 w-3" />
                  </span>
                  Gross delta {settlement.grossDeltaAmount >= 0 ? "upside" : "downside"}
                </span>
                <span className="text-slate-500">
                  {settlement.grossDeltaPercent >= 0 ? "+" : ""}
                  {settlement.grossDeltaPercent.toFixed(2)}%
                </span>
              </div>

              <div className="mt-2 h-1.5 w-52 rounded-full bg-slate-200">
                <div
                  className={`h-1.5 rounded-full transition-all duration-700 ease-out ${settlement.grossDeltaAmount >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${grossDeltaWidth}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.badgeClass}`}>{config.badge}</span>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {settlement.assumptionsSource === "contract_terms" ? "Contract terms" : "Modeled defaults"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
                View calculation
                <span className="transition-transform duration-200 group-open:rotate-180">
                  <ScorecardIcon name="chevronDown" className="h-3 w-3" />
                </span>
              </span>
            </div>
          </div>
        </summary>

        <div className="mt-4 border-t border-indigo-100 pt-4">
          <div className="mb-3 rounded-lg border border-indigo-100 bg-white px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-700">Qualification status</p>
            <p className="mt-1 text-sm text-slate-700">{statusSummary}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${settlement.thresholdMet ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                <span className="mr-1 inline-flex align-middle">
                  <ScorecardIcon name={settlement.thresholdMet ? "checkCircle" : "clock"} className="h-3 w-3" />
                </span>
                Threshold: {settlement.thresholdMet ? "Met" : "Not met"}
              </span>
              <span className={`rounded-full px-2 py-0.5 font-semibold ${settlement.qualityPassed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                <span className="mr-1 inline-flex align-middle">
                  <ScorecardIcon name={settlement.qualityPassed ? "shieldCheck" : "alertTriangle"} className="h-3 w-3" />
                </span>
                Quality gate: {settlement.qualityPassed ? "Passed" : "Not met"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {settlement.breakdown.map((row) => (
              <div key={row.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{row.label}</p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    row.emphasis === "positive"
                      ? "text-emerald-700"
                      : row.emphasis === "negative"
                      ? "text-red-700"
                      : row.emphasis === "warning"
                      ? "text-amber-700"
                      : "text-slate-800"
                  }`}
                >
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </details>
    </>
  );
}
