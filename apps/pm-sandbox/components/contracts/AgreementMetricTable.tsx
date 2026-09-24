import Link from "next/link";
import { buildPopulationInsightsHref } from "@/lib/navigation/populationHref";
import { getContractPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { AgreementDomainKey, ScorecardMetric } from "@/types/agreementScorecard";
import type { ContractPopulationView } from "@/types/contractPopulation";
import type { ScorecardScopeRef } from "@/types/scorecardScope";

interface AgreementMetricTableProps {
  metrics: ScorecardMetric[];
  compact?: boolean;
  showDomainColumn?: boolean;
  domainLabel?: string;
  showNextUnlockColumn?: boolean;
  contractId?: string;
  scorecardScope?: ScorecardScopeRef;
  domainKey?: AgreementDomainKey;
  showPopulationColumn?: boolean;
}

function formatCurrency(amount?: number) {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function nextUnlockDollars(metric: ScorecardMetric) {
  return Math.max((metric.potentialDollars ?? 0) - (metric.achievedDollars ?? 0), 0);
}

function metricPercent(metric: ScorecardMetric) {
  return Math.round(Math.max(0, Math.min(100, metric.currentStars * 20)));
}

function isLowerBetter(metric: ScorecardMetric) {
  return metric.unit === "rate_per_1000" || metric.unit === "currency_pmpm" || metric.unit === "days";
}

function patientsToEngage(metric: ScorecardMetric) {
  const population = metric.populationCount ?? 0;
  if (population <= 0) return 1;
  const demoFallback = Math.max(1, Math.ceil(population * 0.03));
  if (metric.status === "on_track") return demoFallback;

  const improvementGap = isLowerBetter(metric)
    ? Math.max(0, metric.currentValue - metric.targetValue) / Math.max(metric.currentValue, 1)
    : Math.max(0, metric.targetValue - metric.currentValue) / Math.max(metric.targetValue, 1);

  return Math.max(demoFallback, Math.min(population, Math.ceil(population * improvementGap)));
}

function populationInsightsHighCostHref(contractId: string, domainKey: AgreementDomainKey, metricId: string, engageCount: number) {
  return getContractPopulationInsightsHref({
    contractId,
    domain: domainKey,
    metric: metricId,
    view: "high_cost",
    costTier: "top_5",
    engageCount,
    source: "agreement-metric-patients-to-engage",
  });
}

function metricPopulationHref({
  contractId,
  scorecardScope,
  domainKey,
  metricId,
  source,
  view,
}: {
  contractId?: string;
  scorecardScope?: ScorecardScopeRef;
  domainKey: AgreementDomainKey;
  metricId: string;
  source: string;
  view?: ContractPopulationView;
}) {
  if (contractId) {
    return getContractPopulationInsightsHref({
      contractId,
      domain: domainKey,
      metric: metricId,
      view,
      source,
    });
  }

  if (scorecardScope) {
    return buildPopulationInsightsHref({
      scope: scorecardScope.type,
      id: scorecardScope.id,
      label: scorecardScope.label,
      domain: domainKey,
      metric: metricId,
      view,
      source,
    });
  }

  return "#";
}

function primaryTarget(metric: ScorecardMetric) {
  if (!metric.thresholds?.length) return metric.targetStars;
  const matched = metric.primaryTargetThresholdId
    ? metric.thresholds.find((threshold) => threshold.id === metric.primaryTargetThresholdId)
    : metric.thresholds.find((threshold) => threshold.kind === "target") ?? metric.thresholds[0];
  return matched?.stars ?? metric.targetStars;
}

function benchmarkTarget(metric: ScorecardMetric) {
  if (!metric.thresholds?.length) return metric.benchmarkStars;
  const matched = metric.benchmarkThresholdId
    ? metric.thresholds.find((threshold) => threshold.id === metric.benchmarkThresholdId)
    : metric.thresholds.find((threshold) => threshold.kind === "benchmark");
  return matched?.stars ?? metric.benchmarkStars;
}

export default function AgreementMetricTable({
  metrics,
  compact = false,
  showDomainColumn = false,
  domainLabel,
  showNextUnlockColumn = false,
  contractId,
  scorecardScope,
  domainKey,
  showPopulationColumn = false,
}: AgreementMetricTableProps) {
  const width = {
    domain: "w-56",
    metric: "w-80",
    weight: "w-20",
    current: "w-64",
    patientsToEngage: "w-44",
    target: "w-28",
    benchmark: "w-36",
    nextUnlock: "w-44",
    population: "w-40",
    achieved: "w-64",
    potential: "w-56",
  } as const;
  const canShowPopulationColumn = showPopulationColumn && Boolean(domainKey) && Boolean(contractId || scorecardScope);

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-slate-100 ${showDomainColumn ? "table-fixed" : ""}`}>
        <thead>
          <tr className="bg-slate-50">
            {showDomainColumn ? <th className={`${width.domain} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Domain</th> : null}
            <th className={`${width.metric} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Metric</th>
            <th className={`${width.weight} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Weight</th>
            <th className={`${width.current} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Current</th>
            {canShowPopulationColumn ? (
              <th className={`${width.population} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Patients</th>
            ) : null}
            <th className={`${width.patientsToEngage} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Patients to Engage</th>
            {showNextUnlockColumn ? (
              <th className={`${width.nextUnlock} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Next Unlock</th>
            ) : (
              <>
                <th className={`${width.target} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Target</th>
                <th className={`${width.benchmark} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Benchmark</th>
              </>
            )}
            <th className={`${width.achieved} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Currently Achieved</th>
            <th className={`${width.potential} px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>Budgeted $</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {metrics.map((metric) => {
            const denominatorHref = domainKey
              ? metricPopulationHref({
                  contractId,
                  scorecardScope,
                  domainKey,
                  metricId: metric.id,
                  source: "agreement-metric-denominator-patients",
                })
              : "#";
            const gapHref = domainKey
              ? metricPopulationHref({
                  contractId,
                  scorecardScope,
                  domainKey,
                  metricId: metric.id,
                  view: "gaps",
                  source: "agreement-metric-gap-patients",
                })
              : "#";

            return (
              <tr key={metric.id} className="hover:bg-slate-50/70">
                {showDomainColumn ? <td className={`${width.domain} px-3 py-2 text-xs text-slate-600`}>{domainLabel}</td> : null}
                <td className={`${width.metric} px-3 py-2`}>
                  <p className={`font-semibold text-slate-900 ${compact ? "text-xs" : "text-sm"}`}>{metric.label}</p>
                  {!compact ? <p className="text-[11px] text-slate-500">{metric.description}</p> : null}
                </td>
                <td className={`${width.weight} px-3 py-2 text-xs font-semibold tabular-nums text-slate-700`}>{Math.max(1, Math.round(metric.weight ?? 1))}</td>
                <td className={`${width.current} px-3 py-2 text-xs font-semibold tabular-nums text-slate-900`}>{metricPercent(metric)}%</td>
                {canShowPopulationColumn ? (
                  <td className={`${width.population} px-3 py-2 text-xs tabular-nums`}>
                    <Link href={denominatorHref} className="font-semibold text-indigo-600 hover:underline">
                      {(metric.populationCount ?? 0).toLocaleString()}
                    </Link>
                    <Link href={gapHref} className="mt-0.5 block text-[11px] font-medium text-amber-600 hover:underline">
                      gap view
                    </Link>
                  </td>
                ) : null}
                <td className={`${width.patientsToEngage} px-3 py-2 text-xs font-semibold tabular-nums text-slate-800`}>
                  {contractId && domainKey ? (
                    <Link
                      href={populationInsightsHighCostHref(contractId, domainKey, metric.id, patientsToEngage(metric))}
                      className="text-indigo-600 hover:underline"
                      aria-label={`View high-expense population insights for ${patientsToEngage(metric).toLocaleString()} patients to engage for ${metric.label}`}
                    >
                      {patientsToEngage(metric).toLocaleString()}
                    </Link>
                  ) : (
                    patientsToEngage(metric).toLocaleString()
                  )}
                </td>
                {showNextUnlockColumn ? (
                  <td className={`${width.nextUnlock} px-3 py-2 text-xs font-semibold tabular-nums text-amber-700`}>{formatCurrency(nextUnlockDollars(metric))}</td>
                ) : (
                  <>
                    <td className={`${width.target} px-3 py-2`}>
                      <span className="text-xs font-semibold tabular-nums text-slate-800">{primaryTarget(metric).toFixed(1)}</span>
                    </td>
                    <td className={`${width.benchmark} px-3 py-2`}>
                      {benchmarkTarget(metric) !== undefined ? (
                        <span className="text-xs font-semibold tabular-nums text-slate-700">{benchmarkTarget(metric)?.toFixed(1)}</span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </>
                )}
                <td className={`${width.achieved} px-3 py-2 text-xs tabular-nums text-slate-700`}>
                  <p className="font-semibold text-emerald-700">{formatCurrency(metric.achievedDollars)}</p>
                </td>
                <td className={`${width.potential} px-3 py-2 text-xs font-semibold tabular-nums text-indigo-700`}>{formatCurrency(metric.potentialDollars)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
