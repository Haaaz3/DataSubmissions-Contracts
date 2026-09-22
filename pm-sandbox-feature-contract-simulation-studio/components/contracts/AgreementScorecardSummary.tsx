import Link from "next/link";
import ScorecardIcon, { type ScorecardIconName } from "@/components/contracts/ScorecardIcon";
import { getAgreementScorecardForAgreement, getContractScorecardForContract } from "@/lib/agreementScorecardData";
import { mockContractAgreements, mockContracts } from "@/lib/mockData";
import { getPopulationInsightsHref } from "@/lib/scorecards/populationNavigation";
import type { AgreementScorecard, ContractScorecard } from "@/types/agreementScorecard";

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-700";
  if (score >= 70) return "text-amber-700";
  return "text-red-700";
}

function formatMoney(amount?: number) {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function rankDescending(value: number, peers: number[]) {
  if (!peers.length) return { rank: 1, total: 1 };
  return {
    rank: peers.filter((peer) => peer > value).length + 1,
    total: peers.length,
  };
}

function sharePercent(value: number, total: number) {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export default function AgreementScorecardSummary({
  scorecard,
}: {
  scorecard: AgreementScorecard | ContractScorecard;
}) {
  const isAgreement = "agreementId" in scorecard;
  const currentContract = isAgreement ? undefined : mockContracts.find((contract) => contract.id === scorecard.contractId);
  const displayOverallQualityPercent = isAgreement
    ? Math.round(scorecard.qualityRollup)
    : Math.round(currentContract?.qualityScore ?? scorecard.overallScore * 20);

  const peerContractScorecards = mockContracts
    .map((contract) => getContractScorecardForContract(contract.id))
    .filter((item): item is ContractScorecard => Boolean(item));
  const peerAgreementScorecards = mockContractAgreements
    .map((agreement) => getAgreementScorecardForAgreement(agreement.id))
    .filter((item): item is AgreementScorecard => Boolean(item));

  const currentLives = isAgreement
    ? scorecard.totalAttributedLives
    : (currentContract?.attributedLives ?? 0);
  const scopeId = isAgreement ? scorecard.agreementId : scorecard.contractId;
  const scopeLabel = isAgreement ? scorecard.agreementName : scorecard.contractName;

  const peerLives = isAgreement
    ? peerAgreementScorecards.map((item) => item.totalAttributedLives)
    : mockContracts.map((contract) => contract.attributedLives);
  const livesRank = rankDescending(currentLives, peerLives);

  const achievedValue = scorecard.achievedDollars ?? 0;
  const potentialValue = scorecard.potentialDollars ?? 0;
  const remainingOpportunity = Math.max(0, potentialValue - achievedValue);

  const achievedPeers = isAgreement
    ? peerAgreementScorecards.map((item) => item.achievedDollars ?? 0)
    : peerContractScorecards.map((item) => item.achievedDollars ?? 0);
  const potentialPeers = isAgreement
    ? peerAgreementScorecards.map((item) => item.potentialDollars ?? 0)
    : peerContractScorecards.map((item) => item.potentialDollars ?? 0);
  const remainingOpportunityPeers = isAgreement
    ? peerAgreementScorecards.map((item) => Math.max(0, (item.potentialDollars ?? 0) - (item.achievedDollars ?? 0)))
    : peerContractScorecards.map((item) => Math.max(0, (item.potentialDollars ?? 0) - (item.achievedDollars ?? 0)));

  const achievedShare = sharePercent(achievedValue, achievedPeers.reduce((sum, value) => sum + value, 0));
  const potentialShare = sharePercent(potentialValue, potentialPeers.reduce((sum, value) => sum + value, 0));
  const remainingOpportunityRank = rankDescending(remainingOpportunity, remainingOpportunityPeers);

  const executiveMetrics: Array<{
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
      value: currentLives.toLocaleString(),
      description: `#${livesRank.rank} of ${livesRank.total} by population size · View population insights →`,
      accent: "text-slate-900",
      href: getPopulationInsightsHref({
        scopeType: isAgreement ? "agreement" : "contract",
        scopeId,
        scopeLabel,
        lives: currentLives,
        source: "scorecard-summary-lives",
      }),
    },
    {
      label: "Overall Quality Rating",
      icon: "shieldCheck",
      value: `${displayOverallQualityPercent}%`,
      accent: scoreTone(displayOverallQualityPercent),
    },
    {
      label: "Currently Achieved",
      icon: "sparkles",
      value: formatMoney(achievedValue),
      description: `${achievedShare}% of portfolio achieved value`,
      accent: "text-emerald-700",
    },
    {
      label: "Budgeted",
      icon: "banknote",
      value: formatMoney(potentialValue),
      description: `${potentialShare}% of portfolio budgeted value`,
      accent: "text-indigo-700",
    },
    {
      label: "Remaining Opportunity",
      icon: "trendingUp",
      value: formatMoney(remainingOpportunity),
      description: `#${remainingOpportunityRank.rank} of ${remainingOpportunityRank.total} by remaining opportunity`,
      accent: "text-amber-700",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {executiveMetrics.map((metric) => {
          const card = (
            <article className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                <span className="mr-1 inline-flex align-middle text-indigo-600">
                  <ScorecardIcon name={metric.icon} className="h-3.5 w-3.5" />
                </span>
                {metric.label}
              </p>
              <p className={`mt-2 text-2xl font-bold tabular-nums ${metric.accent}`}>{metric.value}</p>
              {metric.description ? <p className="mt-1 text-xs text-slate-500">{metric.description}</p> : null}
            </article>
          );

          return metric.href ? (
            <Link
              key={metric.label}
              href={metric.href}
              className="block focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2"
              aria-label={`View population insights for ${scopeLabel} lives`}
            >
              {card}
            </Link>
          ) : (
            <div key={metric.label}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
