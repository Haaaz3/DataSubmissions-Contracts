import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import KpiCard from "@/components/KpiCard";
import StatusBadge from "@/components/StatusBadge";
import PmpmTrendChart from "@/components/charts/PmpmTrendChart";
import QualityGauge from "@/components/charts/QualityGauge";
import ConditionList from "@/components/ConditionList";
import InsightCard from "@/components/InsightCard";
import PopulationMetricCard from "@/components/PopulationMetricCard";
import ActionCard from "@/components/ActionCard";
import CohortCard from "@/components/CohortCard";
import DraftContractDetail from "@/components/DraftContractDetail";
import ContractSettlementCard from "@/components/contracts/ContractSettlementCard";
import ContractScenarioStudioLauncher from "@/components/contracts/ContractScenarioStudioLauncher";
import ContractedCohortInsightsPanel from "@/components/contracts/ContractedCohortInsightsPanel";
import TopFinancialPrioritiesPanel from "@/components/contracts/TopFinancialPrioritiesPanel";
import QualityBlockedSavingsPanel from "@/components/contracts/QualityBlockedSavingsPanel";
import FeatureGuard from "@/components/FeatureGuard";
import { getContractDerivedSnapshot } from "@/lib/contracts/derivedSnapshot";
import { mockContracts } from "@/lib/mockData";
import { getContractPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { Contract } from "@/types/contract";

const ContractOpportunityFlow = dynamic(
  () => import("@/components/contracts/ContractOpportunityFlow"),
  {
    loading: () => (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-3 w-64 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 space-y-2">
          <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    ),
  }
);

const contractById = new Map(mockContracts.map((contract) => [contract.id, contract] as const));

// Allow on-demand rendering for user-created draft contract IDs
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contract = contractById.get(id);

  // Unknown ID — may be a user-created draft contract stored in localStorage
  if (!contract) {
    return (
      <FeatureGuard page="contracts">
        <DraftContractDetail contractId={id} />
      </FeatureGuard>
    );
  }

  const overTarget = contract.currentPmpm > contract.targetPmpm;
  const pmpmDelta  = contract.currentPmpm - contract.targetPmpm;
  const pmpmSubtext = overTarget
    ? `$${Math.abs(pmpmDelta)} over $${contract.targetPmpm} target`
    : `$${Math.abs(pmpmDelta)} under $${contract.targetPmpm} target`;

  // Trend direction label from first → last month
  const firstPmpm  = contract.trend[0]?.pmpm ?? contract.currentPmpm;
  const trendDelta = contract.currentPmpm - firstPmpm;
  const trendLabel =
    trendDelta > 0  ? `↑ $${trendDelta} over 6 months`
    : trendDelta < 0 ? `↓ $${Math.abs(trendDelta)} over 6 months`
    : "Flat over 6 months";
  const populationInsightsHref = getContractPopulationInsightsHref({
    contractId: contract.id,
    source: "contract-detail-lives",
  });

  return (
    <FeatureGuard page="contracts">
      <div className="space-y-10">
      {/* Back link */}
      <Link href="/contracts" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
        ← Back to Contracts
      </Link>

      {/* Contract header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{contract.name}</h1>
            <StatusBadge status={contract.status} />
          </div>
          <p className="text-sm text-slate-500">
            {contract.payor}
            <span className="mx-2 text-slate-300">·</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
              {contract.contractType}
            </span>
            <span className="mx-2 text-slate-300">·</span>
            <Link
              href={populationInsightsHref}
              className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-700"
            >
              {contract.attributedLives.toLocaleString()} lives
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/contracts/${contract.id}/configure`}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Configure Contract
          </Link>
          <Link
            href={`/contracts/${contract.id}/scorecard`}
            className="inline-flex items-center rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
          >
            Contract Scorecard
          </Link>
          <ContractScenarioStudioLauncher contract={contract} />
        </div>
      </div>

      <ContractSettlementCard contract={contract} />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={populationInsightsHref} className="block transition-transform hover:-translate-y-0.5">
          <KpiCard label="Lives" value={contract.attributedLives.toLocaleString()} subtext="Click to view contracted population" />
        </Link>
        <KpiCard label="Current PMPM"     value={`$${contract.currentPmpm.toLocaleString()}`} subtext={pmpmSubtext} highlight={overTarget ? "danger" : "default"} />
        <KpiCard label="Quality Score"    value={`${contract.qualityScore} / 100`} subtext="Composite quality measure" highlight={contract.qualityScore < 75 ? "warning" : "default"} />
        <KpiCard label="ED Visits / 1,000" value={contract.edVisitsPer1000} subtext="Emergency department utilization" highlight={contract.edVisitsPer1000 > 300 ? "warning" : "default"} />
      </div>

      {/* Trend chart + quality gauge */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="col-span-1 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-3">
          <div className="mb-1 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Monthly Performance Trend</h2>
              <p className="text-xs text-slate-400">PMPM spend (indigo) and quality score (green) · dashed line = target PMPM</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${trendDelta > 0 ? "bg-red-50 text-red-600" : trendDelta < 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {trendLabel}
            </span>
          </div>
          <div className="mt-4">
            <PmpmTrendChart data={contract.trend} targetPmpm={contract.targetPmpm} />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-1 text-base font-semibold text-slate-900">Quality Score</h2>
          <p className="mb-4 text-xs text-slate-400">Composite measure (0–100)</p>
          <div className="flex justify-center">
            <QualityGauge score={contract.qualityScore} />
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            {[
              { label: "Excellent", range: "≥ 85", color: "bg-emerald-400" },
              { label: "Good",      range: "75–84", color: "bg-indigo-400" },
              { label: "Fair",      range: "65–74", color: "bg-amber-400" },
              { label: "Poor",      range: "< 65",  color: "bg-red-400" },
            ].map((tier) => (
              <div key={tier.label} className="flex items-center gap-2 text-slate-500">
                <span className={`h-2 w-2 shrink-0 rounded-full ${tier.color}`} />
                <span>{tier.label}</span>
                <span className="ml-auto text-slate-400">{tier.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Suspense fallback={<ContractDetailLowerSectionSkeleton />}>
        <ContractDetailLowerSections contract={contract} />
      </Suspense>
      </div>
    </FeatureGuard>
  );
}

async function ContractDetailLowerSections({ contract }: { contract: Contract }) {
  await Promise.resolve();

  const snapshot = getContractDerivedSnapshot(contract.id);
  if (!snapshot) return null;

  const pop = snapshot.populationProfile;
  const actions = snapshot.actions;
  const sortedPopInsights = snapshot.populationInsights;
  const relatedCohorts = snapshot.relatedCohorts;
  const contractTopPriorities = snapshot.topFinancialPriorities;
  const qualityBlockedInsight = snapshot.qualityBlockedInsight;
  const populationInsightsHref = getContractPopulationInsightsHref({
    contractId: contract.id,
    source: "contract-detail-population-profile",
  });
  const highExpensePopulationHref = getContractPopulationInsightsHref({
    contractId: contract.id,
    view: "high_cost",
    costTier: "top_5",
    source: "contract-detail-high-expense-members",
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <TopFinancialPrioritiesPanel
          items={contractTopPriorities}
          title="Top Financial Priorities for This Contract"
          subtitle="Ranked opportunities, domains, and contract-level economics to guide near-term intervention focus."
          maxItems={5}
        />
        <QualityBlockedSavingsPanel mode="contract" insight={qualityBlockedInsight} />
      </div>

      <ContractedCohortInsightsPanel
        contract={contract}
        populationProfile={pop}
        populationInsights={sortedPopInsights}
        relatedCohorts={relatedCohorts}
        actions={actions}
      />

      {pop && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Population Profile</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                <Link
                  href={populationInsightsHref}
                  className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-700"
                >
                  {pop.totalMembers.toLocaleString()} members
                </Link>{" "}
                · risk stratification and clinical characteristics
              </p>
            </div>
            <Link href={populationInsightsHref} className="text-sm font-medium text-indigo-600 hover:underline">
              Contract population insights →
            </Link>
          </div>

          <div className="mb-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Risk Stratification</p>
            {(() => {
              const total = pop.riskDistribution.lowRisk + pop.riskDistribution.risingRisk + pop.riskDistribution.highRisk;
              const lowPct = +((pop.riskDistribution.lowRisk / total) * 100).toFixed(1);
              const risingPct = +((pop.riskDistribution.risingRisk / total) * 100).toFixed(1);
              const highPct = +((pop.riskDistribution.highRisk / total) * 100).toFixed(1);
              return (
                <div className="space-y-3">
                  <div className="flex h-4 w-full overflow-hidden rounded-full">
                    <div className="bg-emerald-400" style={{ width: `${lowPct}%` }} />
                    <div className="bg-amber-400" style={{ width: `${risingPct}%` }} />
                    <div className="bg-red-400" style={{ width: `${highPct}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {([
                      { label: "Low Risk", pct: lowPct, count: pop.riskDistribution.lowRisk, color: "bg-emerald-400" },
                      { label: "Rising Risk", pct: risingPct, count: pop.riskDistribution.risingRisk, color: "bg-amber-400" },
                      { label: "High Risk", pct: highPct, count: pop.riskDistribution.highRisk, color: "bg-red-400" },
                    ] as const).map((tier) => (
                      <div key={tier.label} className="flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${tier.color}`} />
                        <span className="text-slate-600">{tier.label}</span>
                        <span className="font-semibold text-slate-900">{tier.count.toLocaleString()}</span>
                        <span className="text-slate-400">({tier.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Top Chronic Conditions</p>
              <ConditionList conditions={pop.topChronicConditions} maxPrevalence={100} />
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Utilization &amp; Membership</p>
              <div className="grid grid-cols-2 gap-3">
                <PopulationMetricCard label="ED Visits / 1,000" value={pop.utilizationMetrics.edVisitsPer1000} accent={pop.utilizationMetrics.edVisitsPer1000 > 300 ? "warning" : "positive"} />
                <PopulationMetricCard label="Admissions / 1,000" value={pop.utilizationMetrics.admissionsPer1000} accent={pop.utilizationMetrics.admissionsPer1000 > 180 ? "warning" : "default"} />
                <PopulationMetricCard label="Readmission Rate" value={`${pop.utilizationMetrics.readmissionsRate}%`} accent={pop.utilizationMetrics.readmissionsRate > 10 ? "danger" : "default"} />
                <Link href={highExpensePopulationHref} className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2">
                  <PopulationMetricCard label="High Expense Members" value={pop.highCostMembers.toLocaleString()} subtext="Top 5% expense tier · View insights" accent={pop.highCostMembers > 300 ? "warning" : "default"} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <ContractOpportunityFlow contract={contract} />

      {actions.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Action Intelligence</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Performance gaps linked to population drivers with recommended interventions
              </p>
            </div>
            <Link href="/actions" className="text-sm font-medium text-indigo-600 hover:underline">
              View all actions →
            </Link>
          </div>
          <div className="space-y-4">
            {actions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>
      )}

      {relatedCohorts.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Related Cohorts</h2>
              <p className="mt-0.5 text-xs text-slate-400">Population segments associated with this contract</p>
            </div>
            <Link href="/cohorts" className="text-sm font-medium text-indigo-600 hover:underline">
              Explore all cohorts →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {relatedCohorts.map((cohort) => (
              <CohortCard key={cohort.id} cohort={cohort} />
            ))}
          </div>
        </div>
      )}

      {sortedPopInsights.length > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Population Opportunities</h2>
            <p className="mt-0.5 text-xs text-slate-400">Actionable insights derived from population health data for this contract</p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sortedPopInsights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function ContractDetailLowerSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
      <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
      <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

// Statically pre-render all known contract detail pages at build time
export function generateStaticParams() {
  return mockContracts.map((c) => ({ id: c.id }));
}
