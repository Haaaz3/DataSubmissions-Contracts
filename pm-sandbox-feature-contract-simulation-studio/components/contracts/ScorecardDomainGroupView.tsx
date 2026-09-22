"use client";

import { useState } from "react";
import AgreementDomainTableSection from "@/components/contracts/AgreementDomainTableSection";
import { buildScorecardDomainGroups } from "@/components/contracts/domainGroups";
import type { ScorecardDomain } from "@/types/agreementScorecard";
import type { ScorecardScopeRef } from "@/types/scorecardScope";

interface ScorecardDomainGroupViewProps {
  domains: ScorecardDomain[];
  contractId?: string;
  scorecardScope?: ScorecardScopeRef;
  showPopulationColumn?: boolean;
  totalAchievedDollars: number;
  totalPotentialDollars: number;
  totalRemainingOpportunityDollars: number;
  dollarShareScopeLabel: "contract" | "portfolio";
  showRemainingOpportunityCard?: boolean;
}

function formatMoney(amount?: number) {
  if (amount === undefined) return "-";
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

export default function ScorecardDomainGroupView({
  domains,
  contractId,
  scorecardScope,
  showPopulationColumn = false,
  totalAchievedDollars,
  totalPotentialDollars,
  totalRemainingOpportunityDollars,
  dollarShareScopeLabel,
  showRemainingOpportunityCard = false,
}: ScorecardDomainGroupViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const domainGroups = buildScorecardDomainGroups(domains);

  if (!domainGroups.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        No domain groups are available for this scorecard.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {domainGroups.map((group) => {
        const achievedShare = sharePercent(group.achievedDollars, totalAchievedDollars);
        const potentialShare = sharePercent(group.potentialDollars, totalPotentialDollars);
        const remainingOpportunityShare = sharePercent(group.remainingOpportunity, totalRemainingOpportunityDollars);
        const domainLabels = group.domains.map((domain) => domain.label).join(", ");
        const expanded = expandedGroups[group.key] ?? false;

        return (
          <section key={group.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <h3 className="text-base font-semibold text-slate-900">{group.label}</h3>
                <p className="mt-1 text-sm text-slate-600">{domainLabels}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {group.domainCount} domains · {group.metricCount} metrics
                  {group.populationCount > 0 ? ` · ${group.populationCount.toLocaleString()} qualifying patients` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.key]: !expanded }))}
                className="text-[11px] font-semibold text-indigo-600 hover:underline"
              >
                {expanded ? "Collapse" : "Expand"}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Domain Group Score</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{group.domainGroupScore}%</p>
                <p className="mt-1 text-[11px] font-medium text-slate-500">Metric-weighted domain score</p>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Currently Achieved</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-emerald-700">{formatMoney(group.achievedDollars)}</p>
                <p className="mt-1 text-[11px] font-medium text-emerald-700/80">
                  {achievedShare}% of {dollarShareScopeLabel} achieved value
                </p>
              </div>

              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">Budgeted</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-indigo-700">{formatMoney(group.potentialDollars)}</p>
                <p className="mt-1 text-[11px] font-medium text-indigo-700/80">
                  {potentialShare}% of {dollarShareScopeLabel} budgeted value
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Remaining Opportunity</p>
                <p className="mt-1 text-xl font-bold tabular-nums text-amber-700">{formatMoney(group.remainingOpportunity)}</p>
                <p className="mt-1 text-[11px] font-medium text-amber-700/80">
                  {remainingOpportunityShare}% of {dollarShareScopeLabel} remaining opportunity
                </p>
              </div>
            </div>

            {expanded ? (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                {group.domains.map((domain) => (
                  <AgreementDomainTableSection
                    key={domain.key}
                    domain={domain}
                    defaultExpanded
                    contractId={contractId}
                    scorecardScope={scorecardScope}
                    showPopulationColumn={showPopulationColumn}
                    totalAchievedDollars={totalAchievedDollars}
                    totalPotentialDollars={totalPotentialDollars}
                    totalRemainingOpportunityDollars={totalRemainingOpportunityDollars}
                    dollarShareScopeLabel={dollarShareScopeLabel}
                    showRemainingOpportunityCard={showRemainingOpportunityCard}
                  />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
