"use client";

import { useState } from "react";
import type { ScorecardDomain } from "@/types/agreementScorecard";
import ScorecardViewToggle, { type ScorecardViewMode } from "@/components/contracts/ScorecardViewToggle";
import AgreementAnalystTableView from "@/components/contracts/AgreementAnalystTableView";
import ScorecardDomainGroupView from "@/components/contracts/ScorecardDomainGroupView";
import type { ScorecardScopeRef } from "@/types/scorecardScope";

interface ScorecardDomainViewsProps {
  domains: ScorecardDomain[];
  title: string;
  subtitle?: string;
  badgeText?: string;
  contractId?: string;
  scorecardScope?: ScorecardScopeRef;
  showPopulationColumn?: boolean;
  portfolioAchievedDollars?: number;
  portfolioPotentialDollars?: number;
  showRemainingOpportunityCard?: boolean;
}

export default function ScorecardDomainViews({
  domains,
  title,
  subtitle,
  badgeText,
  contractId,
  scorecardScope,
  showPopulationColumn = false,
  portfolioAchievedDollars,
  portfolioPotentialDollars,
  showRemainingOpportunityCard = false,
}: ScorecardDomainViewsProps) {
  const [viewMode, setViewMode] = useState<ScorecardViewMode>("group");
  const totalAchievedDollars = portfolioAchievedDollars ?? domains.reduce((sum, domain) => sum + domain.achievedDollars, 0);
  const totalPotentialDollars = portfolioPotentialDollars ?? domains.reduce((sum, domain) => sum + domain.potentialDollars, 0);
  const totalRemainingOpportunityDollars = Math.max(0, totalPotentialDollars - totalAchievedDollars);
  const dollarShareScopeLabel = portfolioAchievedDollars !== undefined || portfolioPotentialDollars !== undefined ? "portfolio" : "contract";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {badgeText ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{badgeText}</span> : null}
          <ScorecardViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {viewMode === "group" ? (
        <ScorecardDomainGroupView
          domains={domains}
          contractId={contractId}
          scorecardScope={scorecardScope}
          showPopulationColumn={showPopulationColumn}
          totalAchievedDollars={totalAchievedDollars}
          totalPotentialDollars={totalPotentialDollars}
          totalRemainingOpportunityDollars={totalRemainingOpportunityDollars}
          dollarShareScopeLabel={dollarShareScopeLabel}
          showRemainingOpportunityCard={showRemainingOpportunityCard}
        />
      ) : null}

      {viewMode === "analyst" ? (
        <AgreementAnalystTableView
          domains={domains}
          contractId={contractId}
          scorecardScope={scorecardScope}
          showPopulationColumn={showPopulationColumn}
          totalAchievedDollars={totalAchievedDollars}
          totalPotentialDollars={totalPotentialDollars}
          totalRemainingOpportunityDollars={totalRemainingOpportunityDollars}
          dollarShareScopeLabel={dollarShareScopeLabel}
        />
      ) : null}
    </section>
  );
}
