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
import { getPortfolioContracts, groupContractsByContractType, resolveVbcContractModel } from "@/lib/scorecards/selectors";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractTypeScorecardPage({ params }: PageProps) {
  const { id } = await params;
  const contractTypeId = decodeURIComponent(id);

  const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const contractTypeContracts = allContracts.filter((contract) => resolveVbcContractModel(contract) === contractTypeId);

  if (!contractTypeContracts.length) {
    return (
      <FeatureGuard page="scorecards">
        <ScorecardScopeShell
          backHref="/scorecards"
          backLabel="Back to Scorecards"
          breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Contract Type" }, { label: contractTypeId }]}
          hero={
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold text-slate-900">Contract Type Scorecard not available</h1>
              <p className="mt-1 text-sm text-slate-600">No contracts were found for this contract type.</p>
            </div>
          }
        >
          <div />
        </ScorecardScopeShell>
      </FeatureGuard>
    );
  }

  const rollup = buildScorecardRollup({
    scopeType: "contractType",
    scopeId: contractTypeId,
    scopeLabel: contractTypeId,
    contracts: contractTypeContracts,
  });

  const contractTypeGroups = groupContractsByContractType(allContracts);
  const achievedValueShareContext = buildScorecardShareContext({
    currentId: contractTypeId,
    groups: contractTypeGroups,
    valueFromDomains: achievedValueFromDomains,
  });
  const budgetedValueShareContext = buildScorecardShareContext({
    currentId: contractTypeId,
    groups: contractTypeGroups,
    valueFromDomains: budgetedValueFromDomains,
  });
  const remainingOpportunityContext = buildRemainingOpportunityContext({
    currentId: contractTypeId,
    lensLabelPlural: "contract types",
    groups: contractTypeGroups,
  });

  return (
    <FeatureGuard page="scorecards">
      <ScorecardScopeShell
        backHref="/scorecards"
        backLabel="Back to Scorecards"
        breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Contract Type" }, { label: contractTypeId }]}
        hero={
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{contractTypeId}</h1>
            <p className="mt-1 text-sm text-slate-500">Contract performance for this VBC contract type.</p>
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
          title="Contract Type Domain Performance"
          subtitle="Summary and analyst views for domain performance and dollar opportunity across this VBC contract type."
          scorecardScope={rollup.scope}
          showPopulationColumn
          showRemainingOpportunityCard
        />
        <ContributingContractsCard contracts={contractTypeContracts} />
      </ScorecardScopeShell>
    </FeatureGuard>
  );
}

export function generateStaticParams() {
  const contracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const contractTypes = Array.from(new Set(contracts.map((contract) => resolveVbcContractModel(contract))));
  return contractTypes.map((contractType) => ({ id: encodeURIComponent(contractType) }));
}
