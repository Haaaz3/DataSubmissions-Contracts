import Link from "next/link";
import ScorecardIcon, { type ScorecardIconName } from "@/components/contracts/ScorecardIcon";
import { getPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { RemainingOpportunityContext, ScorecardShareContext, ScorecardRollup } from "@/types/scorecardRollup";

function formatMoney(amount?: number) {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-700";
  if (score >= 70) return "text-amber-700";
  return "text-red-700";
}

function remainingOpportunityDescription(context?: RemainingOpportunityContext) {
  if (!context) return "Budgeted value not yet captured";
  return `#${context.rank} of ${context.total} ${context.lensLabelPlural} · ${context.sharePercent}% of total remaining opportunity`;
}

function shareDescription(context: ScorecardShareContext | undefined, metric: "achieved value" | "budgeted value", fallback: string) {
  if (!context) return fallback;
  return `${context.sharePercent}% of ${context.scopeLabel} ${metric}`;
}

export default function ScorecardRollupExecutiveSummary({
  rollup,
  achievedValueShareContext,
  budgetedValueShareContext,
  remainingOpportunityContext,
}: {
  rollup: ScorecardRollup;
  achievedValueShareContext?: ScorecardShareContext;
  budgetedValueShareContext?: ScorecardShareContext;
  remainingOpportunityContext?: RemainingOpportunityContext;
}) {
  const currentlyAchieved = rollup.domains.reduce((sum, domain) => sum + domain.achievedDollars, 0);
  const totalPotential = rollup.domains.reduce((sum, domain) => sum + domain.potentialDollars, 0);
  const remainingOpportunity = Math.max(0, totalPotential - currentlyAchieved);

  const cards: Array<{
    label: string;
    icon: ScorecardIconName;
    value: string;
    description?: string;
    accent: string;
    href?: string;
  }> = [
    {
      label: "Lives",
      icon: "users",
      value: rollup.totalAttributedLives.toLocaleString(),
      description: `${rollup.contractsCount} contracts in scope · View population insights →`,
      accent: "text-slate-900",
      href: getPopulationInsightsHref({
        scopeType: rollup.scope.type,
        scopeId: rollup.scope.id,
        scopeLabel: rollup.scope.label,
        lives: rollup.totalAttributedLives,
        source: "scorecard-summary-lives",
      }),
    },
    {
      label: "Overall Quality Rating",
      icon: "shieldCheck",
      value: `${Math.round(rollup.qualityRollup)}%`,
      accent: scoreTone(rollup.qualityRollup),
    },
    {
      label: "Currently Achieved",
      icon: "sparkles",
      value: formatMoney(currentlyAchieved),
      description: shareDescription(
        achievedValueShareContext,
        "achieved value",
        `${rollup.statusMix.onTrack} on track · ${rollup.statusMix.atRisk} at risk`
      ),
      accent: "text-emerald-700",
    },
    {
      label: "Budgeted",
      icon: "banknote",
      value: formatMoney(totalPotential),
      description: shareDescription(
        budgetedValueShareContext,
        "budgeted value",
        `Upside opportunity ${formatMoney(rollup.upsideOpportunity)}`
      ),
      accent: "text-indigo-700",
    },
    {
      label: "Remaining Opportunity",
      icon: "trendingUp",
      value: formatMoney(remainingOpportunity),
      description: remainingOpportunityDescription(remainingOpportunityContext),
      accent: "text-amber-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const cardContent = (
          <article className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
              <span className="mr-1 inline-flex align-middle text-indigo-600">
                <ScorecardIcon name={card.icon} className="h-3.5 w-3.5" />
              </span>
              {card.label}
            </p>
            <p className={`mt-2 text-2xl font-bold tabular-nums ${card.accent}`}>{card.value}</p>
            {card.description ? <p className="mt-1 text-xs text-slate-500">{card.description}</p> : null}
          </article>
        );

        return card.href ? (
          <Link key={card.label} href={card.href} className="block focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2" aria-label={`View population insights for ${rollup.scope.label} lives`}>
            {cardContent}
          </Link>
        ) : (
          <div key={card.label}>{cardContent}</div>
        );
      })}
    </div>
  );
}
