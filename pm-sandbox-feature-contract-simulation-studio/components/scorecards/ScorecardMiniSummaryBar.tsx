import Link from "next/link";
import { getPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { ScorecardRollup } from "@/types/scorecardRollup";

function formatMoneyCompact(amount: number) {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

export default function ScorecardMiniSummaryBar({ rollup }: { rollup: ScorecardRollup }) {
  const atRiskPercent = ((rollup.atRiskLives / Math.max(rollup.totalAttributedLives, 1)) * 100).toFixed(1);
  const populationInsightsHref = getPopulationInsightsHref({
    scopeType: rollup.scope.type,
    scopeId: rollup.scope.id,
    scopeLabel: rollup.scope.label,
    lives: rollup.totalAttributedLives,
    source: "scorecard-mini-summary-lives",
  });

  return (
    <div className="sticky top-2 z-20 rounded-xl border border-slate-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
        <div>
          <Link href={populationInsightsHref} className="font-semibold text-indigo-700 hover:underline">
            {rollup.totalAttributedLives.toLocaleString()}
          </Link>
          <span className="ml-1 text-slate-500">lives</span>
        </div>
        <div>
          <span className="font-semibold text-slate-900">Composite quality {Math.round(rollup.qualityRollup)}%</span>
          <span className="ml-1 text-slate-500">({rollup.status})</span>
        </div>
        <div>
          <span className={`font-semibold ${rollup.netSettlementEstimate >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {formatMoneyCompact(rollup.netSettlementEstimate)}
          </span>
          <span className="ml-1 text-slate-500">net settlement</span>
        </div>
        <div>
          <Link href={populationInsightsHref} className="font-semibold text-indigo-700 hover:underline">
            {rollup.atRiskLives.toLocaleString()} at-risk lives
          </Link>
          <span className="ml-1 text-slate-500">({atRiskPercent}%)</span>
        </div>
      </div>
    </div>
  );
}
