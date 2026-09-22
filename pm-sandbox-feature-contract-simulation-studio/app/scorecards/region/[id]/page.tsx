import FeatureGuard from "@/components/FeatureGuard";
import ScorecardDomainViews from "@/components/contracts/ScorecardDomainViews";
import ContributingContractsCard from "@/components/scorecards/ContributingContractsCard";
import ScorecardChildTable from "@/components/scorecards/ScorecardChildTable";
import ScorecardRollupExecutiveSummary from "@/components/scorecards/ScorecardRollupExecutiveSummary";
import ScorecardScopeShell from "@/components/scorecards/ScorecardScopeShell";
import { mockContractAgreements } from "@/lib/mockData";
import {
  achievedValueFromDomains,
  budgetedValueFromDomains,
  buildRemainingOpportunityContext,
  buildScorecardShareContext,
  buildScorecardRollup,
} from "@/lib/scorecards/rollups";
import { getPortfolioContracts, groupContractsByMarket, groupContractsByRegion } from "@/lib/scorecards/selectors";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RegionScorecardPage({ params }: PageProps) {
  const { id } = await params;
  const regionId = decodeURIComponent(id);

  const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const regionContracts = allContracts.filter((contract) => contract.region === regionId);

  if (!regionContracts.length) {
    return (
      <FeatureGuard page="scorecards">
        <ScorecardScopeShell
          backHref="/scorecards"
          backLabel="Back to Scorecards"
          breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Region" }, { label: regionId }]}
          hero={
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold text-slate-900">Region Scorecard not available</h1>
              <p className="mt-1 text-sm text-slate-600">No contracts were found for this region.</p>
            </div>
          }
        >
          <div />
        </ScorecardScopeShell>
      </FeatureGuard>
    );
  }

  const marketGroups = groupContractsByMarket(regionContracts).map((group) => ({
    ...group,
    scopeType: "market" as const,
  }));

  const rollup = buildScorecardRollup({
    scopeType: "region",
    scopeId: regionId,
    scopeLabel: regionId,
    contracts: regionContracts,
    childGroups: marketGroups,
  });

  const sortedChildren = [...rollup.children].sort((a, b) => a.settlementEstimate - b.settlementEstimate);
  const regionGroups = groupContractsByRegion(allContracts);
  const achievedValueShareContext = buildScorecardShareContext({
    currentId: regionId,
    groups: regionGroups,
    valueFromDomains: achievedValueFromDomains,
  });
  const budgetedValueShareContext = buildScorecardShareContext({
    currentId: regionId,
    groups: regionGroups,
    valueFromDomains: budgetedValueFromDomains,
  });
  const remainingOpportunityContext = buildRemainingOpportunityContext({
    currentId: regionId,
    lensLabelPlural: "regions",
    groups: regionGroups,
  });

  return (
    <FeatureGuard page="scorecards">
      <ScorecardScopeShell
        backHref="/scorecards"
        backLabel="Back to Scorecards"
        breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Region" }, { label: regionId }]}
        hero={
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{regionId}</h1>
            <p className="mt-1 text-sm text-slate-500">Market and contract performance for this regional slice.</p>
            <p className="mt-2 text-xs text-slate-500">{rollup.headline}</p>
          </div>
        }
      >
        <ScorecardRollupExecutiveSummary
          rollup={rollup}
          achievedValueShareContext={achievedValueShareContext}
          budgetedValueShareContext={budgetedValueShareContext}
          remainingOpportunityContext={remainingOpportunityContext}
        />

        <ScorecardDomainViews
          domains={rollup.domains}
          title="Region Domain Performance"
          subtitle="Summary and analyst views for domain performance and dollar opportunity across this region."
          scorecardScope={rollup.scope}
          showPopulationColumn
          showRemainingOpportunityCard
        />

        <ScorecardChildTable items={sortedChildren} title="Market contributors" />

        <ContributingContractsCard contracts={regionContracts} />
      </ScorecardScopeShell>
    </FeatureGuard>
  );
}

export function generateStaticParams() {
  const contracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const regions = Array.from(new Set(contracts.map((contract) => contract.region).filter(Boolean)));
  return regions.map((region) => ({ id: encodeURIComponent(region as string) }));
}
