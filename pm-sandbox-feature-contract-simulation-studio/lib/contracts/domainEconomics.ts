import type { ContractDomainEconomicRule, ContractDomainEconomicSummary, DomainEconomicImpact, DomainEconomicTier } from "@/types/contractDomainEconomics";
import type { ContractScorecard } from "@/types/agreementScorecard";

function clamp(value: number, floor?: number, cap?: number) {
  const withFloor = floor !== undefined ? Math.max(value, floor) : value;
  return cap !== undefined ? Math.min(withFloor, cap) : withFloor;
}

function achievementPercent(score: number, thresholdScore?: number) {
  if (!thresholdScore || thresholdScore <= 0) return undefined;
  return (score / thresholdScore) * 100;
}

function tierMatches(tier: DomainEconomicTier, score: number, achievement?: number) {
  const scoreMinOk = tier.minScore === undefined || score >= tier.minScore;
  const scoreMaxOk = tier.maxScore === undefined || score <= tier.maxScore;
  const achMinOk = tier.minAchievementPercent === undefined || (achievement ?? -Infinity) >= tier.minAchievementPercent;
  const achMaxOk = tier.maxAchievementPercent === undefined || (achievement ?? Infinity) <= tier.maxAchievementPercent;
  return scoreMinOk && scoreMaxOk && achMinOk && achMaxOk;
}

function findTriggeredTier(tiers: DomainEconomicTier[] | undefined, score: number, achievement?: number) {
  if (!tiers?.length) return undefined;
  return tiers.find((tier) => tierMatches(tier, score, achievement));
}

function evaluateRuleImpact(params: {
  rule: ContractDomainEconomicRule;
  domainLabel: string;
  score: number;
  baselineSavingsAmount: number;
  benchmarkRevenueAmount: number;
}): DomainEconomicImpact {
  const { rule, domainLabel, score, baselineSavingsAmount, benchmarkRevenueAmount } = params;
  const achievement = achievementPercent(score, rule.thresholdScore);
  const tier = findTriggeredTier(rule.tiers, score, achievement);

  const thresholdTriggered = rule.thresholdScore !== undefined ? score >= rule.thresholdScore : true;
  const gateBlocked = rule.mechanism === "gate" && !thresholdTriggered && Boolean(rule.gateBlocksSettlement || rule.gateBlocksSavingsOnly);

  let bonus = 0;
  let penalty = 0;

  if (rule.mechanism === "bonus") {
    bonus = thresholdTriggered
      ? (tier?.payoutAmount ?? rule.payoutAmount ?? 0)
      : 0;
  }

  if (rule.mechanism === "penalty") {
    const triggerPenalty = rule.thresholdScore !== undefined ? score < rule.thresholdScore : true;
    penalty = triggerPenalty
      ? (tier?.penaltyAmount ?? rule.penaltyAmount ?? 0)
      : 0;
  }

  if (rule.mechanism === "tiered_multiplier" || rule.mechanism === "savings_modifier") {
    const multiplier = tier?.multiplier ?? 1;
    const delta = baselineSavingsAmount * (multiplier - 1);
    if (delta >= 0) bonus += delta;
    else penalty += Math.abs(delta);
  }

  if (rule.mechanism === "risk_adjustment_uplift") {
    const uplift = rule.payoutAmount ?? ((benchmarkRevenueAmount * (rule.payoutRate ?? 0)) / 100);
    bonus += uplift;
  }

  if (rule.mechanism === "withhold") {
    const withholdAmount = rule.payoutAmount ?? ((benchmarkRevenueAmount * (rule.withholdPercent ?? 0)) / 100);
    if (thresholdTriggered) bonus += withholdAmount;
    else penalty += withholdAmount;
  }

  bonus = clamp(bonus, 0, rule.capAmount);
  penalty = clamp(penalty, 0, rule.capAmount);

  const net = bonus - penalty;

  const rationale = gateBlocked
    ? `${domainLabel} score ${score.toFixed(1)} is below gate threshold ${rule.thresholdScore}, blocking settlement eligibility.`
    : tier
      ? `${domainLabel} triggered tier "${tier.label}" for ${rule.mechanism} mechanism.`
      : `${domainLabel} evaluated for ${rule.mechanism} mechanism.`;

  return {
    domainKey: rule.domainKey,
    domainLabel,
    score,
    achievementPercent: achievement ? Number(achievement.toFixed(1)) : undefined,
    mechanism: rule.mechanism,
    direction: rule.direction,
    estimatedBonusAmount: bonus > 0 ? Number(bonus.toFixed(2)) : undefined,
    estimatedPenaltyAmount: penalty > 0 ? Number(penalty.toFixed(2)) : undefined,
    estimatedNetImpactAmount: Number(net.toFixed(2)),
    settlementBlocked: gateBlocked,
    settlementModified: net !== 0,
    triggeredTierLabel: tier?.label,
    rationale,
  };
}

export function evaluateContractDomainEconomics(params: {
  contractId: string;
  scorecard: ContractScorecard;
  rules: ContractDomainEconomicRule[];
  baselineSavingsAmount?: number;
  benchmarkRevenueAmount?: number;
}): ContractDomainEconomicSummary {
  const { contractId, scorecard, rules, baselineSavingsAmount = 0, benchmarkRevenueAmount = 0 } = params;
  const relevantRules = rules.filter((rule) => rule.contractId === contractId);

  const impacts = relevantRules
    .map((rule) => {
      const domain = scorecard.domains.find((item) => item.key === rule.domainKey);
      if (!domain) return undefined;
      return evaluateRuleImpact({
        rule,
        domainLabel: domain.label,
        score: domain.score,
        baselineSavingsAmount,
        benchmarkRevenueAmount,
      });
    })
    .filter((impact): impact is DomainEconomicImpact => Boolean(impact));

  const totalDomainBonusAmount = impacts.reduce((sum, impact) => sum + (impact.estimatedBonusAmount ?? 0), 0);
  const totalDomainPenaltyAmount = impacts.reduce((sum, impact) => sum + (impact.estimatedPenaltyAmount ?? 0), 0);
  const totalDomainNetImpactAmount = impacts.reduce((sum, impact) => sum + impact.estimatedNetImpactAmount, 0);

  const blockedByDomains = Array.from(
    new Set(impacts.filter((impact) => impact.settlementBlocked).map((impact) => impact.domainKey))
  );

  return {
    contractId,
    totalDomainBonusAmount: Number(totalDomainBonusAmount.toFixed(2)),
    totalDomainPenaltyAmount: Number(totalDomainPenaltyAmount.toFixed(2)),
    totalDomainNetImpactAmount: Number(totalDomainNetImpactAmount.toFixed(2)),
    blockedByDomains,
    domainImpacts: impacts,
  };
}
