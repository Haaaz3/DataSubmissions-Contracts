"use client";

import { useState } from "react";
import type { ScorecardDomain } from "@/types/agreementScorecard";
import AgreementMetricTable from "@/components/contracts/AgreementMetricTable";
import ScorecardInfoPopover from "@/components/contracts/ScorecardInfoPopover";
import type { ScorecardScopeRef } from "@/types/scorecardScope";

interface AgreementDomainTableSectionProps {
  domain: ScorecardDomain;
  defaultExpanded?: boolean;
  contractId?: string;
  scorecardScope?: ScorecardScopeRef;
  showPopulationColumn?: boolean;
  totalAchievedDollars?: number;
  totalPotentialDollars?: number;
  totalRemainingOpportunityDollars?: number;
  dollarShareScopeLabel?: "contract" | "portfolio";
  showRemainingOpportunityCard?: boolean;
}

function formatMoney(amount?: number) {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function sharePercent(value: number | undefined, total: number | undefined) {
  if (!value || !total || total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export default function AgreementDomainTableSection({
  domain,
  defaultExpanded = true,
  contractId,
  scorecardScope,
  showPopulationColumn = false,
  totalAchievedDollars,
  totalPotentialDollars,
  totalRemainingOpportunityDollars,
  dollarShareScopeLabel = "contract",
  showRemainingOpportunityCard = false,
}: AgreementDomainTableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const currentScoreRows = domain.metrics.map((metric) => {
    const metricWeight = Math.max(1, Math.round(metric.weight ?? 1));
    const metricPercent = Math.round(metric.currentStars * 20);
    const weightedContribution = Number((metricPercent * metricWeight).toFixed(2));
    return {
      label: metric.label,
      value: weightedContribution,
      displayValue: `${metricPercent}% × ${metricWeight} = ${weightedContribution.toFixed(2)}`,
    };
  });
  const currentScoreNumerator = Number(
    currentScoreRows.reduce((sum, row) => sum + row.value, 0).toFixed(2)
  );
  const currentScoreDenominator = domain.metrics.reduce(
    (sum, metric) => sum + Math.max(1, Math.round(metric.weight ?? 1)),
    0
  );
  const computedCurrentScorePercent =
    currentScoreDenominator > 0 ? Math.round(currentScoreNumerator / currentScoreDenominator) : domain.score;
  const displayedCurrentScorePercent = Math.round(domain.score ?? computedCurrentScorePercent);
  const achievedShare = sharePercent(domain.achievedDollars, totalAchievedDollars);
  const potentialShare = sharePercent(domain.potentialDollars, totalPotentialDollars);
  const remainingOpportunity = Math.max(0, domain.potentialDollars - domain.achievedDollars);
  const remainingOpportunityShare = sharePercent(remainingOpportunity, totalRemainingOpportunityDollars);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h3 className="text-base font-semibold text-slate-900">{domain.label}</h3>
          <p className="mt-1 text-sm text-slate-600">{domain.description}</p>
          <p className="mt-1 text-xs text-slate-500">{domain.executiveInsight}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-[11px] font-semibold text-indigo-600 hover:underline"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      <div className={`mt-3 grid grid-cols-1 gap-3 ${showRemainingOpportunityCard ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"}`}>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Domain Score</p>
            <ScorecardInfoPopover
              title="Current score calculation"
              description="Current domain score = Σ(KPI performance percentage × KPI weight) / Σ(KPI weights)"
              components={currentScoreRows}
              notes={[
                `Weighted KPI percentage sum = ${currentScoreNumerator.toFixed(2)}`,
                `Total KPI weight = ${currentScoreDenominator}`,
                `Current domain score = ${currentScoreNumerator.toFixed(2)} / ${currentScoreDenominator} = ${computedCurrentScorePercent}%`,
                "Raw KPI values are normalized into percentage values before weighted rollup.",
              ]}
            />
          </div>
          <div className="mt-2 space-y-1 text-xs text-slate-700">
            <div className="flex items-center justify-between gap-2"><span>Current</span><span className="text-lg font-bold tabular-nums text-slate-900">{displayedCurrentScorePercent}%</span></div>
          </div>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Currently Achieved</p>
            <ScorecardInfoPopover
              title="Currently achieved calculation"
              description="Domain achieved dollars are the sum of achieved contributions from domain metrics."
              components={domain.achievedDollarComponents}
            />
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums text-emerald-700">{formatMoney(domain.achievedDollars)}</p>
          <p className="mt-1 text-[11px] font-medium text-emerald-700/80">{achievedShare}% of {dollarShareScopeLabel} achieved value</p>
        </div>

        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">Budgeted Dollars</p>
            <ScorecardInfoPopover
              title="Budgeted calculation"
              description="Domain budgeted dollars are the sum of metric-level budgeted value."
              components={domain.potentialDollarComponents}
            />
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums text-indigo-700">{formatMoney(domain.potentialDollars)}</p>
          <p className="mt-1 text-[11px] font-medium text-indigo-700/80">{potentialShare}% of {dollarShareScopeLabel} budgeted value</p>
        </div>

        {showRemainingOpportunityCard ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Remaining Opportunity</p>
              <ScorecardInfoPopover
                title="Remaining opportunity calculation"
                description="Domain remaining opportunity is budgeted dollars minus currently achieved dollars."
                components={[
                  {
                    label: "Budgeted dollars",
                    value: domain.potentialDollars,
                    displayValue: formatMoney(domain.potentialDollars),
                  },
                  {
                    label: "Currently achieved",
                    value: domain.achievedDollars,
                    displayValue: formatMoney(domain.achievedDollars),
                  },
                ]}
                notes={[
                  `Remaining opportunity = ${formatMoney(domain.potentialDollars)} - ${formatMoney(domain.achievedDollars)} = ${formatMoney(remainingOpportunity)}`,
                  "Negative remaining opportunity is displayed as $0.",
                ]}
              />
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-amber-700">{formatMoney(remainingOpportunity)}</p>
            <p className="mt-1 text-[11px] font-medium text-amber-700/80">{remainingOpportunityShare}% of {dollarShareScopeLabel} remaining opportunity</p>
          </div>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-4">
          <AgreementMetricTable
            metrics={domain.metrics}
            compact
            showNextUnlockColumn
            contractId={contractId}
            scorecardScope={scorecardScope}
            domainKey={domain.key}
            showPopulationColumn={showPopulationColumn}
          />
        </div>
      ) : null}
    </section>
  );
}
