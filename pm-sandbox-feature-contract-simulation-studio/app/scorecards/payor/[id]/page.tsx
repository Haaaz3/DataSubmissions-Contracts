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
import { getPortfolioContracts, groupContractsByAgreement, groupContractsByPayor } from "@/lib/scorecards/selectors";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PayorScorecardPage({ params }: PageProps) {
  const { id } = await params;
  const payorId = decodeURIComponent(id);

  const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const payorContracts = allContracts.filter((contract) => contract.payor === payorId);

  if (!payorContracts.length) {
    return (
      <FeatureGuard page="scorecards">
        <ScorecardScopeShell
          backHref="/scorecards"
          backLabel="Back to Scorecards"
          breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Payor" }, { label: payorId }]}
          hero={
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold text-slate-900">Payor Scorecard not available</h1>
              <p className="mt-1 text-sm text-slate-600">No contracts were found for this payor.</p>
            </div>
          }
        >
          <div />
        </ScorecardScopeShell>
      </FeatureGuard>
    );
  }

  const agreementGroups = groupContractsByAgreement(mockContractAgreements)
    .map((group) => ({
      ...group,
      contracts: group.contracts.filter((contract) => contract.payor === payorId),
      scopeType: "agreement" as const,
    }))
    .filter((group) => group.contracts.length > 0);

  const rollup = buildScorecardRollup({
    scopeType: "payor",
    scopeId: payorId,
    scopeLabel: payorId,
    contracts: payorContracts,
    childGroups: agreementGroups,
  });

  const sortedChildren = [...rollup.children].sort((a, b) => a.settlementEstimate - b.settlementEstimate);
  const payorGroups = groupContractsByPayor(allContracts);
  const achievedValueShareContext = buildScorecardShareContext({
    currentId: payorId,
    groups: payorGroups,
    valueFromDomains: achievedValueFromDomains,
  });
  const budgetedValueShareContext = buildScorecardShareContext({
    currentId: payorId,
    groups: payorGroups,
    valueFromDomains: budgetedValueFromDomains,
  });
  const remainingOpportunityContext = buildRemainingOpportunityContext({
    currentId: payorId,
    lensLabelPlural: "payors",
    groups: payorGroups,
  });

  return (
    <FeatureGuard page="scorecards">
      <ScorecardScopeShell
        backHref="/scorecards"
        backLabel="Back to Scorecards"
        breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Payor" }, { label: payorId }]}
        hero={
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{payorId}</h1>
            <p className="mt-1 text-sm text-slate-500">Agreement and contract performance for this payor slice.</p>
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
          title="Payor Domain Performance"
          subtitle="Summary and analyst views for domain performance and dollar opportunity across this payor."
          scorecardScope={rollup.scope}
          showPopulationColumn
          showRemainingOpportunityCard
        />

        <ScorecardChildTable items={sortedChildren} title="Agreement contributors" />

        <ContributingContractsCard contracts={payorContracts} />
      </ScorecardScopeShell>
    </FeatureGuard>
  );
}

export function generateStaticParams() {
  const contracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const payors = Array.from(new Set(contracts.map((contract) => contract.payor)));
  return payors.map((payor) => ({ id: encodeURIComponent(payor) }));
}
