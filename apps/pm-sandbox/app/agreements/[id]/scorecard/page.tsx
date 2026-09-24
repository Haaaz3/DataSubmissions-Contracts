import Link from "next/link";
import FeatureGuard from "@/components/FeatureGuard";
import AgreementScorecardSummary from "@/components/contracts/AgreementScorecardSummary";
import ScorecardDomainViews from "@/components/contracts/ScorecardDomainViews";
import AgreementFinancialInsightCards from "@/components/contracts/AgreementFinancialInsightCards";
import AgreementFinancialContributionTable from "@/components/contracts/AgreementFinancialContributionTable";
import ScorecardIcon from "@/components/contracts/ScorecardIcon";
import ScorecardScopeShell from "@/components/scorecards/ScorecardScopeShell";
import StatusBadge from "@/components/StatusBadge";
import { mockContractAgreements } from "@/lib/mockData";
import { getAgreementScorecardForAgreement } from "@/lib/agreementScorecardData";
import { getAgreementFinancialContribution } from "@/lib/contracts/agreementEconomics";
import { getContractPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AgreementScorecardPage({ params }: PageProps) {
  const { id } = await params;
  const scorecard = getAgreementScorecardForAgreement(id);

  if (!scorecard) {
    return (
      <FeatureGuard page="contracts">
        <ScorecardScopeShell
          backHref="/contracts"
          backLabel="Back to Contracts"
          breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Agreement" }, { label: id }]}
          hero={
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold text-slate-900">Agreement Scorecard not available</h1>
              <p className="mt-1 text-sm text-slate-600">
                This agreement may be a draft-only grouping. Agreement-level scorecards currently support seeded agreements.
              </p>
            </div>
          }
        >
          <div />
        </ScorecardScopeShell>
      </FeatureGuard>
    );
  }

  const topContributor = scorecard.contributors.reduce<(typeof scorecard.contributors)[number] | null>(
    (current, contributor) => {
      if (!current) return contributor;
      return contributor.qualityContributionPercent > current.qualityContributionPercent ? contributor : current;
    },
    null
  );

  const agreement = mockContractAgreements.find((item) => item.id === id);
  const financialContributionSummary = agreement ? getAgreementFinancialContribution(agreement) : null;

  return (
    <FeatureGuard page="contracts">
      <ScorecardScopeShell
        backHref="/contracts"
        backLabel="Back to Contracts"
        breadcrumbs={[
          { label: "Scorecards", href: "/scorecards" },
          { label: "Agreement" },
          { label: scorecard.agreementName },
        ]}
        hero={
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{scorecard.agreementName}</h1>
              <span className="text-sm text-slate-500">{scorecard.contractsCount} contracts included</span>
            </div>
            <AgreementScorecardSummary scorecard={scorecard} />
          </div>
        }
      >
        <ScorecardDomainViews
          domains={scorecard.domains}
          title="Agreement Domain Performance"
          subtitle="Summary and analyst views preserve MA Stars orientation and show domain dollar impact."
          scorecardScope={{ type: "agreement", id, label: scorecard.agreementName }}
          showPopulationColumn
          showRemainingOpportunityCard
        />

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Supporting evidence</p>
              <h2 className="text-base font-semibold text-slate-800">
                <span className="mr-1 inline-flex align-middle text-slate-500">
                  <ScorecardIcon name="users" className="h-4 w-4" />
                </span>
                Contract Contributors
              </h2>
              <p className="text-xs text-slate-500">Use contributor mix to explain why certain domains are over- or under-performing.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              Quality rollup {scorecard.qualityRollup}% · {topContributor?.contractName ?? "N/A"} leads
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50">
                  {["Contract", "Lives", "Quality", "Lives Share", "Quality Contribution", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {scorecard.contributors.map((contributor) => (
                  <tr key={contributor.contractId} className="transition-all duration-200 hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      <Link href={`/contracts/${contributor.contractId}`} className="hover:text-indigo-700 hover:underline">
                        {contributor.contractName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-slate-700">
                      <Link
                        href={getContractPopulationInsightsHref({
                          contractId: contributor.contractId,
                          source: "agreement-scorecard-contributor-lives",
                        })}
                        className="font-semibold text-indigo-700 hover:underline"
                        aria-label={`View population insights for ${contributor.contractName} lives`}
                      >
                        {contributor.attributedLives.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold tabular-nums text-slate-900">{contributor.qualityScore}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <p className="tabular-nums">{contributor.livesSharePercent.toFixed(1)}%</p>
                      <div className="mt-1 h-1.5 w-28 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-indigo-400 transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(contributor.livesSharePercent, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <p className="tabular-nums">{contributor.qualityContributionPercent.toFixed(1)}%</p>
                      <div className="mt-1 h-1.5 w-28 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-emerald-400 transition-all duration-700 ease-out"
                          style={{ width: `${Math.min(contributor.qualityContributionPercent, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={contributor.contractStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {financialContributionSummary && (
          <section className="space-y-4">
            <AgreementFinancialInsightCards insights={financialContributionSummary.summaryInsights} />
            <AgreementFinancialContributionTable summary={financialContributionSummary} />
          </section>
        )}

      </ScorecardScopeShell>
    </FeatureGuard>
  );
}

export function generateStaticParams() {
  return mockContractAgreements.map((agreement) => ({ id: agreement.id }));
}
