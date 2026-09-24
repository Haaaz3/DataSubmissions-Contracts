import Link from "next/link";
import { getContractPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { ActionItem } from "@/types/action";
import type { Cohort } from "@/types/cohort";
import type { Contract } from "@/types/contract";
import type {
  ContractPopulationCostTierFilter,
  ContractPopulationView,
} from "@/types/contractPopulation";
import type { MemberPopulationProfile, PopulationInsight } from "@/types/population";

type ContractedCohortInsightsPanelProps = {
  contract: Contract;
  populationProfile?: MemberPopulationProfile;
  populationInsights: PopulationInsight[];
  relatedCohorts: Cohort[];
  actions: ActionItem[];
};

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function populationHref(
  contract: Contract,
  extraParams?: {
    view?: ContractPopulationView;
    costTier?: ContractPopulationCostTierFilter;
    source?: string;
  }
) {
  return getContractPopulationInsightsHref({
    contractId: contract.id,
    source: "contracted-cohort-insights",
    ...extraParams,
  });
}

function formatPriorityText(items: Array<{ priority: "High" | "Medium" | "Low" }>) {
  const high = items.filter((item) => item.priority === "High").length;
  const medium = items.filter((item) => item.priority === "Medium").length;
  return `${high} high / ${medium} medium`;
}

export default function ContractedCohortInsightsPanel({
  contract,
  populationProfile,
  populationInsights,
  relatedCohorts,
  actions,
}: ContractedCohortInsightsPanelProps) {
  if (!populationProfile) return null;

  const riskTotal =
    populationProfile.riskDistribution.lowRisk +
    populationProfile.riskDistribution.risingRisk +
    populationProfile.riskDistribution.highRisk;
  const highRiskPct = pct(populationProfile.riskDistribution.highRisk, riskTotal);
  const risingRiskPct = pct(populationProfile.riskDistribution.risingRisk, riskTotal);
  const highCostPct = pct(populationProfile.highCostMembers, populationProfile.totalMembers);
  const topCondition = populationProfile.topChronicConditions[0];
  const mostActionableInsight = populationInsights[0];
  const topCohort = relatedCohorts[0];
  const topAction = actions[0];
  const qualityGapCohorts = relatedCohorts.filter((cohort) => cohort.category === "Quality Gap");
  const utilizationCohorts = relatedCohorts.filter((cohort) => cohort.category === "Utilization" || cohort.category === "Rising Risk");

  const contractedCohortSummary: Array<{
    label: string;
    value: string | number;
    detail: string;
    href?: string;
    detailHref?: string;
  }> = [
    {
      label: "Contracted cohort",
      value: populationProfile.totalMembers.toLocaleString(),
      detail: `${contract.payor} · ${contract.contractType}`,
      href: populationHref(contract, { source: "contracted-cohort-total-members" }),
    },
    {
      label: "High + rising risk",
      value: `${highRiskPct + risingRiskPct}%`,
      detail: `${populationProfile.riskDistribution.highRisk.toLocaleString()} high risk members`,
    },
    {
      label: "High-expense concentration",
      value: `${highCostPct}%`,
      detail: `${populationProfile.highCostMembers.toLocaleString()} top-expense members`,
      href: populationHref(contract, {
        view: "high_cost",
        costTier: "top_5",
        source: "contracted-cohort-high-expense-members",
      }),
      detailHref: populationHref(contract, {
        view: "high_cost",
        costTier: "top_5",
        source: "contracted-cohort-high-expense-member-count",
      }),
    },
    {
      label: "Actionable insights",
      value: populationInsights.length,
      detail: formatPriorityText(populationInsights),
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm">
      <div className="border-b border-indigo-100 bg-indigo-50/60 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-700">Contracted cohort intelligence</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Population insights for this contract cohort</h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              A contract-scoped view of risk, utilization, quality gaps, and actions for members attributed to {contract.name}.
            </p>
          </div>
          <Link
            href={populationHref(contract)}
            className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Open contract population →
          </Link>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {contractedCohortSummary.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              {item.href ? (
                <Link
                  href={item.href}
                  className="mt-1 inline-flex text-2xl font-black text-indigo-700 hover:underline"
                >
                  {item.value}
                </Link>
              ) : (
                <p className="mt-1 text-2xl font-black text-slate-900">{item.value}</p>
              )}
              {item.detailHref ? (
                <Link href={item.detailHref} className="mt-1 block text-xs text-slate-500 hover:text-indigo-700 hover:underline">
                  {item.detail}
                </Link>
              ) : (
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Cohort risk story</p>
                <p className="mt-0.5 text-xs text-slate-500">Members to prioritize across quality, utilization, and expense.</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                {highRiskPct}% high risk
              </span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="inline-block h-full bg-emerald-400" style={{ width: `${pct(populationProfile.riskDistribution.lowRisk, riskTotal)}%` }} />
              <div className="inline-block h-full bg-amber-400" style={{ width: `${risingRiskPct}%` }} />
              <div className="inline-block h-full bg-red-400" style={{ width: `${highRiskPct}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <Link href={populationHref(contract)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-white">
                <span className="block font-semibold text-slate-900">{populationProfile.riskDistribution.lowRisk.toLocaleString()}</span>
                <span className="text-slate-500">Low risk</span>
              </Link>
              <Link href={populationHref(contract)} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 hover:bg-white">
                <span className="block font-semibold text-slate-900">{populationProfile.riskDistribution.risingRisk.toLocaleString()}</span>
                <span className="text-slate-500">Rising risk</span>
              </Link>
              <Link href={populationHref(contract)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 hover:bg-white">
                <span className="block font-semibold text-slate-900">{populationProfile.riskDistribution.highRisk.toLocaleString()}</span>
                <span className="text-slate-500">High risk</span>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">What is driving the cohort?</p>
            <div className="mt-3 space-y-2 text-sm">
              {topCondition ? (
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top condition</p>
                  <p className="mt-0.5 font-semibold text-slate-900">{topCondition.condition} · {topCondition.prevalencePercent}% prevalence</p>
                </div>
              ) : null}
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Utilization signal</p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {populationProfile.utilizationMetrics.edVisitsPer1000} ED visits / 1,000 · {populationProfile.utilizationMetrics.admissionsPer1000} admissions / 1,000
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Social barriers</p>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {populationProfile.socialRiskIndicators.transportationBarrierPercent}% transportation · {populationProfile.socialRiskIndicators.foodInsecurityPercent}% food insecurity
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 lg:col-span-2">
            <p className="text-sm font-semibold text-slate-900">Priority insight</p>
            {mostActionableInsight ? (
              <div className="mt-2">
                <p className="font-semibold text-indigo-950">{mostActionableInsight.title}</p>
                <p className="mt-1 text-sm text-slate-700">{mostActionableInsight.description}</p>
                <p className="mt-2 text-xs text-slate-600"><span className="font-semibold">Recommended action:</span> {mostActionableInsight.recommendedAction}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">No population insights are currently scoped to this contract.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Cohort + workflow links</p>
            <div className="mt-3 space-y-2 text-xs">
              <p className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-900">{relatedCohorts.length}</span> related cohorts · {qualityGapCohorts.length} quality gap · {utilizationCohorts.length} utilization/risk
              </p>
              {topCohort ? (
                <Link href={`/cohorts/${topCohort.id}`} className="block rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-indigo-700 hover:bg-indigo-50">
                  Open top cohort: {topCohort.name} →
                </Link>
              ) : null}
              {topAction ? (
                <Link href="/actions" className="block rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-indigo-700 hover:bg-indigo-50">
                  Review action: {topAction.title} →
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
