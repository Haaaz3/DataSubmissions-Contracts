import FeatureGuard from "@/components/FeatureGuard";
import ScorecardDomainViews from "@/components/contracts/ScorecardDomainViews";
import ContributingContractsCard from "@/components/scorecards/ContributingContractsCard";
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
import { getPortfolioContracts, groupContractsByMarket } from "@/lib/scorecards/selectors";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MarketScorecardPage({ params }: PageProps) {
  const { id } = await params;
  const marketId = decodeURIComponent(id);

  const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const marketContracts = allContracts.filter((contract) => contract.market === marketId);

  if (!marketContracts.length) {
    return (
      <FeatureGuard page="scorecards">
        <ScorecardScopeShell
          backHref="/scorecards"
          backLabel="Back to Scorecards"
          breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Market" }, { label: marketId }]}
          hero={
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold text-slate-900">Market Scorecard not available</h1>
              <p className="mt-1 text-sm text-slate-600">No contracts were found for this market.</p>
            </div>
          }
        >
          <div />
        </ScorecardScopeShell>
      </FeatureGuard>
    );
  }

  const rollup = buildScorecardRollup({
    scopeType: "market",
    scopeId: marketId,
    scopeLabel: marketId,
    contracts: marketContracts,
  });

  const marketGroups = groupContractsByMarket(allContracts);
  const achievedValueShareContext = buildScorecardShareContext({
    currentId: marketId,
    groups: marketGroups,
    valueFromDomains: achievedValueFromDomains,
  });
  const budgetedValueShareContext = buildScorecardShareContext({
    currentId: marketId,
    groups: marketGroups,
    valueFromDomains: budgetedValueFromDomains,
  });
  const remainingOpportunityContext = buildRemainingOpportunityContext({
    currentId: marketId,
    lensLabelPlural: "markets",
    groups: marketGroups,
  });

  return (
    <FeatureGuard page="scorecards">
      <ScorecardScopeShell
        backHref="/scorecards"
        backLabel="Back to Scorecards"
        breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Market" }, { label: marketId }]}
        hero={
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{marketId}</h1>
            <p className="mt-1 text-sm text-slate-500">Contract performance for this market slice.</p>
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
          title="Market Domain Performance"
          subtitle="Summary and analyst views for domain performance and dollar opportunity across this market."
          scorecardScope={rollup.scope}
          showPopulationColumn
          showRemainingOpportunityCard
        />
        <ContributingContractsCard contracts={marketContracts} />
      </ScorecardScopeShell>
    </FeatureGuard>
  );
}

export function generateStaticParams() {
  const contracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const markets = Array.from(new Set(contracts.map((contract) => contract.market).filter(Boolean)));
  return markets.map((market) => ({ id: encodeURIComponent(market as string) }));
}
