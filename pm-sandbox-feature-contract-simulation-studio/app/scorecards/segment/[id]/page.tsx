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
import { getPortfolioContracts, groupContractsByInsuranceSegment, inferInsuranceSegment } from "@/lib/scorecards/selectors";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InsuranceSegmentScorecardPage({ params }: PageProps) {
  const { id } = await params;
  const segmentId = decodeURIComponent(id);

  const allContracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const segmentContracts = allContracts.filter((contract) => inferInsuranceSegment(contract) === segmentId);

  if (!segmentContracts.length) {
    return (
      <FeatureGuard page="scorecards">
        <ScorecardScopeShell
          backHref="/scorecards"
          backLabel="Back to Scorecards"
          breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Insurance Segment" }, { label: segmentId }]}
          hero={
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold text-slate-900">Insurance Segment Scorecard not available</h1>
              <p className="mt-1 text-sm text-slate-600">No contracts were found for this insurance segment.</p>
            </div>
          }
        >
          <div />
        </ScorecardScopeShell>
      </FeatureGuard>
    );
  }

  const rollup = buildScorecardRollup({
    scopeType: "insuranceSegment",
    scopeId: segmentId,
    scopeLabel: segmentId,
    contracts: segmentContracts,
  });

  const segmentGroups = groupContractsByInsuranceSegment(allContracts);
  const achievedValueShareContext = buildScorecardShareContext({
    currentId: segmentId,
    groups: segmentGroups,
    valueFromDomains: achievedValueFromDomains,
  });
  const budgetedValueShareContext = buildScorecardShareContext({
    currentId: segmentId,
    groups: segmentGroups,
    valueFromDomains: budgetedValueFromDomains,
  });
  const remainingOpportunityContext = buildRemainingOpportunityContext({
    currentId: segmentId,
    lensLabelPlural: "segments",
    groups: segmentGroups,
  });

  return (
    <FeatureGuard page="scorecards">
      <ScorecardScopeShell
        backHref="/scorecards"
        backLabel="Back to Scorecards"
        breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Insurance Segment" }, { label: segmentId }]}
        hero={
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{segmentId}</h1>
            <p className="mt-1 text-sm text-slate-500">Contract performance for this insurance segment.</p>
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
          title="Insurance Segment Domain Performance"
          subtitle="Summary and analyst views for domain performance and dollar opportunity across this insurance segment."
          scorecardScope={rollup.scope}
          showPopulationColumn
          showRemainingOpportunityCard
        />
        <ContributingContractsCard contracts={segmentContracts} />
      </ScorecardScopeShell>
    </FeatureGuard>
  );
}

export function generateStaticParams() {
  const contracts = getPortfolioContracts({ agreements: mockContractAgreements });
  const segments = Array.from(new Set(contracts.map((contract) => inferInsuranceSegment(contract))));
  return segments.map((segment) => ({ id: encodeURIComponent(segment) }));
}
