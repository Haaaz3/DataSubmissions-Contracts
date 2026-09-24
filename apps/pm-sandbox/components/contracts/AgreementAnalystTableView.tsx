import type { ScorecardDomain } from "@/types/agreementScorecard";
import AgreementMetricTable from "@/components/contracts/AgreementMetricTable";
import { buildScorecardDomainGroups } from "@/components/contracts/domainGroups";
import type { ScorecardScopeRef } from "@/types/scorecardScope";

interface AgreementAnalystTableViewProps {
  domains: ScorecardDomain[];
  contractId?: string;
  scorecardScope?: ScorecardScopeRef;
  showPopulationColumn?: boolean;
  totalAchievedDollars: number;
  totalPotentialDollars: number;
  totalRemainingOpportunityDollars: number;
  dollarShareScopeLabel: "contract" | "portfolio";
}

export default function AgreementAnalystTableView({
  domains,
  contractId,
  scorecardScope,
  showPopulationColumn = false,
  totalAchievedDollars,
  totalPotentialDollars,
  totalRemainingOpportunityDollars,
  dollarShareScopeLabel,
}: AgreementAnalystTableViewProps) {
  const domainGroups = buildScorecardDomainGroups(domains);

  return (
    <div className="space-y-3">
      {domainGroups.map((group) => {
        const achievedShare = sharePercent(group.achievedDollars, totalAchievedDollars);
        const potentialShare = sharePercent(group.potentialDollars, totalPotentialDollars);
        const remainingOpportunityShare = sharePercent(group.remainingOpportunity, totalRemainingOpportunityDollars);
        const domainLabels = group.domains.map((domain) => domain.label).join(", ");

        return (
          <section key={group.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <h3 className="text-base font-semibold text-slate-900">{group.label}</h3>
                <p className="mt-1 text-xs text-slate-600">{domainLabels}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {group.domainCount} domains · {group.metricCount} metrics
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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

            <div className="space-y-4">
              {group.domains.map((domain) => (
                <div key={domain.key}>
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">{domain.label}</h4>
                    <p className="text-xs font-semibold text-indigo-700">Budgeted {formatMoney(domain.potentialDollars)}</p>
                  </div>
                  <AgreementMetricTable
                    metrics={domain.metrics}
                    compact
                    contractId={contractId}
                    scorecardScope={scorecardScope}
                    domainKey={domain.key}
                    showPopulationColumn={showPopulationColumn}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function sharePercent(value: number | undefined, total: number | undefined) {
  if (!value || !total || total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatMoney(amount?: number) {
  if (amount === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
