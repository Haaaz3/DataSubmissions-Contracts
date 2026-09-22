import Link from "next/link";
import KpiCard from "@/components/KpiCard";
import { getPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { ScorecardRollup } from "@/types/scorecardRollup";

function formatMoneyCompact(amount: number) {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

export default function ScorecardKpiStrip({ rollup }: { rollup: ScorecardRollup }) {
  const populationInsightsHref = getPopulationInsightsHref({
    scopeType: rollup.scope.type,
    scopeId: rollup.scope.id,
    scopeLabel: rollup.scope.label,
    lives: rollup.totalAttributedLives,
    source: "scorecard-kpi-strip-lives",
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      <Link href={populationInsightsHref} className="block transition-transform hover:-translate-y-0.5">
        <KpiCard label="Total lives" value={rollup.totalAttributedLives.toLocaleString()} subtext={`${rollup.contractsCount} contracts · View insights`} />
      </Link>
      <KpiCard label="Composite quality" value={`${Math.round(rollup.qualityRollup)}%`} subtext={rollup.status} highlight={rollup.status === "Off Track" ? "danger" : rollup.status === "At Risk" ? "warning" : "default"} />
      <KpiCard label="Net settlement estimate" value={formatMoneyCompact(rollup.netSettlementEstimate)} subtext="Portfolio rollup" highlight={rollup.netSettlementEstimate < 0 ? "danger" : "default"} />
      <KpiCard label="Downside exposure" value={formatMoneyCompact(-rollup.downsideExposure)} subtext="Contracts below target" highlight={rollup.downsideExposure > 0 ? "warning" : "default"} />
      <KpiCard label="Quality blocked upside" value={formatMoneyCompact(rollup.qualityBlockedUpside)} subtext="Value gated by quality" highlight={rollup.qualityBlockedUpside > 0 ? "warning" : "default"} />
      <Link href={populationInsightsHref} className="block transition-transform hover:-translate-y-0.5">
        <KpiCard label="At-risk lives" value={rollup.atRiskLives.toLocaleString()} subtext={`${((rollup.atRiskLives / Math.max(rollup.totalAttributedLives, 1)) * 100).toFixed(1)}% of lives · View insights`} highlight={rollup.atRiskLives > 0 ? "warning" : "default"} />
      </Link>
    </div>
  );
}
