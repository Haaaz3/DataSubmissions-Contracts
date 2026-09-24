import Link from "next/link";
import type { ScorecardRollup } from "@/types/scorecardRollup";
import StatusDonutChart from "@/components/charts/StatusDonutChart";
import { getPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";

function formatMoneyCompact(amount: number) {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

function scoreTone(status: ScorecardRollup["status"]) {
  if (status === "On Track") return "text-emerald-700";
  if (status === "At Risk") return "text-amber-700";
  return "text-red-700";
}

function StatTile({
  label,
  value,
  subtext,
  toneClass = "text-slate-900",
  href,
  ariaLabel,
}: {
  label: string;
  value: string;
  subtext?: string;
  toneClass?: string;
  href?: string;
  ariaLabel?: string;
}) {
  const tile = (
    <article className="rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-200/70">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${toneClass}`}>{value}</p>
      {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
    </article>
  );

  return href ? (
    <Link href={href} aria-label={ariaLabel} className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2">
      {tile}
    </Link>
  ) : (
    tile
  );
}

export default function ScorecardCompactSummary({ rollup }: { rollup: ScorecardRollup }) {
  const atRiskPercent = ((rollup.atRiskLives / Math.max(rollup.totalAttributedLives, 1)) * 100).toFixed(1);
  const populationInsightsHref = getPopulationInsightsHref({
    scopeType: rollup.scope.type,
    scopeId: rollup.scope.id,
    scopeLabel: rollup.scope.label,
    lives: rollup.totalAttributedLives,
    source: "scorecard-compact-summary-lives",
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile
          label="Attributed lives"
          value={rollup.totalAttributedLives.toLocaleString()}
          subtext={`${rollup.contractsCount.toLocaleString()} contracts · View insights`}
          href={populationInsightsHref}
          ariaLabel={`View population insights for ${rollup.scope.label} lives`}
        />
        <StatTile
          label="Composite quality"
          value={`${Math.round(rollup.qualityRollup)}%`}
          subtext={rollup.status}
          toneClass={scoreTone(rollup.status)}
        />
        <StatTile
          label="Net settlement"
          value={formatMoneyCompact(rollup.netSettlementEstimate)}
          subtext="Estimated"
          toneClass={rollup.netSettlementEstimate >= 0 ? "text-emerald-700" : "text-red-700"}
        />
        <StatTile
          label="At-risk lives"
          value={rollup.atRiskLives.toLocaleString()}
          subtext={`${atRiskPercent}% of lives · View insights`}
          toneClass="text-amber-700"
          href={populationInsightsHref}
          ariaLabel={`View population insights for ${rollup.scope.label} at-risk lives`}
        />

        <article className="rounded-lg bg-slate-50 px-4 py-3 ring-1 ring-slate-200/70">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Status mix</p>
          <div className="mt-2 flex items-center gap-2.5">
            <StatusDonutChart
              size="sm"
              counts={{
                "On Track": rollup.statusMix.onTrack,
                "At Risk": rollup.statusMix.atRisk,
                "Off Track": rollup.statusMix.offTrack,
              }}
            />
            <div className="min-w-0 flex-1 space-y-1.5 text-[11px]">
              {([
                ["On Track", rollup.statusMix.onTrack, "bg-emerald-500"],
                ["At Risk", rollup.statusMix.atRisk, "bg-amber-500"],
                ["Off Track", rollup.statusMix.offTrack, "bg-red-500"],
              ] as const).map(([label, count, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="truncate text-slate-600">{label}</span>
                  <span className="ml-auto font-semibold text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800 ring-1 ring-amber-200">
          Downside exposure {formatMoneyCompact(rollup.downsideExposure)}
        </span>
        <span className="rounded-full bg-yellow-100 px-2.5 py-1 font-semibold text-yellow-800 ring-1 ring-yellow-200">
          Quality-blocked upside {formatMoneyCompact(rollup.qualityBlockedUpside)}
        </span>
        <span className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-800 ring-1 ring-rose-200">
          {rollup.statusMix.offTrack} off-track contracts
        </span>
      </div>
    </section>
  );
}
