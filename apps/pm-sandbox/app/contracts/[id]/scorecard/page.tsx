import Link from "next/link";
import FeatureGuard from "@/components/FeatureGuard";
import AgreementScorecardSummary from "@/components/contracts/AgreementScorecardSummary";
import ScorecardDomainViews from "@/components/contracts/ScorecardDomainViews";
import QualityBlockedSavingsPanel from "@/components/contracts/QualityBlockedSavingsPanel";
import ScorecardScopeShell from "@/components/scorecards/ScorecardScopeShell";
import { mockContracts } from "@/lib/mockData";
import { getContractScorecardForContract } from "@/lib/agreementScorecardData";
import { getQualityBlockedSavingsForContract } from "@/lib/contracts/financialPriorities";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractAgreementScorecardPage({ params }: PageProps) {
  const { id } = await params;
  const contract = mockContracts.find((item) => item.id === id);
  const scorecard = getContractScorecardForContract(id);

  if (!contract || !scorecard) {
    return (
      <FeatureGuard page="contracts">
        <ScorecardScopeShell
          backHref="/contracts"
          backLabel="Back to Contracts"
          breadcrumbs={[{ label: "Scorecards", href: "/scorecards" }, { label: "Contract" }, { label: id }]}
          hero={
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-lg font-semibold text-slate-900">Contract Scorecard not available</h1>
              <p className="mt-1 text-sm text-slate-600">
                This scorecard currently supports seeded mock contracts. Draft contracts will be supported in a future phase.
              </p>
            </div>
          }
        >
          <div />
        </ScorecardScopeShell>
      </FeatureGuard>
    );
  }

  const qualityBlockedInsight = getQualityBlockedSavingsForContract(contract);
  const portfolioScorecards = mockContracts
    .map((item) => getContractScorecardForContract(item.id))
    .filter((item): item is NonNullable<ReturnType<typeof getContractScorecardForContract>> => Boolean(item));
  const portfolioAchievedDollars = portfolioScorecards.reduce((sum, item) => sum + (item.achievedDollars ?? 0), 0);
  const portfolioPotentialDollars = portfolioScorecards.reduce((sum, item) => sum + (item.potentialDollars ?? 0), 0);

  return (
    <FeatureGuard page="contracts">
      <ScorecardScopeShell
        backHref={`/contracts/${id}`}
        backLabel="Back to Contract Detail"
        breadcrumbs={[
          { label: "Scorecards", href: "/scorecards" },
          { label: "Contract" },
          { label: scorecard.contractName },
        ]}
        hero={
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{scorecard.contractName}</h1>
              <Link href="/contracts" className="text-sm font-medium text-indigo-600 hover:underline">
                View all contracts →
              </Link>
            </div>
            <AgreementScorecardSummary scorecard={scorecard} />
          </div>
        }
      >
        {qualityBlockedInsight && (
          <QualityBlockedSavingsPanel mode="contract" insight={qualityBlockedInsight} />
        )}

        <ScorecardDomainViews
          domains={scorecard.domains}
          title="Contract Domain Performance"
          subtitle="Summary and analyst views for MA-stars-aligned domain performance and dollar opportunity."
          contractId={id}
          showPopulationColumn
          portfolioAchievedDollars={portfolioAchievedDollars}
          portfolioPotentialDollars={portfolioPotentialDollars}
          showRemainingOpportunityCard
        />
      </ScorecardScopeShell>
    </FeatureGuard>
  );
}

export function generateStaticParams() {
  return mockContracts.map((contract) => ({ id: contract.id }));
}
