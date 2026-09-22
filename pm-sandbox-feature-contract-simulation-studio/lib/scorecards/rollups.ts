import { buildContractScorecard } from "@/lib/agreementScorecardData";
import { calculateEstimatedSettlement } from "@/lib/contracts/settlement";
import { getScorecardHref } from "@/lib/scorecards/navigation";
import type {
  AgreementMetricUnit,
  ScorecardDomain,
  ScorecardMetric,
  ScorecardMetricStatus,
} from "@/types/agreementScorecard";
import type { Contract, ContractStatus } from "@/types/contract";
import type {
  RemainingOpportunityContext,
  ScorecardChildSummary,
  ScorecardShareContext,
  ScorecardRollup,
} from "@/types/scorecardRollup";
import type { ScorecardScopeType } from "@/types/scorecardScope";

function weightedAverage(values: Array<{ value: number; weight: number }>) {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;
  return values.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
}

export function remainingOpportunityFromDomains(domains: ScorecardDomain[]) {
  const achievedDollars = domains.reduce((sum, domain) => sum + domain.achievedDollars, 0);
  const potentialDollars = domains.reduce((sum, domain) => sum + domain.potentialDollars, 0);
  return Math.max(0, potentialDollars - achievedDollars);
}

export function achievedValueFromDomains(domains: ScorecardDomain[]) {
  return domains.reduce((sum, domain) => sum + domain.achievedDollars, 0);
}

export function budgetedValueFromDomains(domains: ScorecardDomain[]) {
  return domains.reduce((sum, domain) => sum + domain.potentialDollars, 0);
}

export function rankDescending(value: number, peers: number[]) {
  if (!peers.length) return { rank: 1, total: 1 };
  return {
    rank: peers.filter((peer) => peer > value).length + 1,
    total: peers.length,
  };
}

export function buildScorecardShareContext(params: {
  currentId: string;
  groups: Array<{
    id: string;
    contracts: Contract[];
  }>;
  valueFromDomains: (domains: ScorecardDomain[]) => number;
}): ScorecardShareContext | undefined {
  const valuedGroups = params.groups.map((group) => ({
    id: group.id,
    value: params.valueFromDomains(aggregateDomains(group.contracts)),
  }));
  const current = valuedGroups.find((group) => group.id === params.currentId);

  if (!current) return undefined;

  const portfolioTotal = valuedGroups.reduce((sum, group) => sum + group.value, 0);

  return {
    sharePercent: portfolioTotal > 0 ? Math.round((current.value / portfolioTotal) * 100) : 0,
    scopeLabel: "portfolio",
  };
}

export function buildRemainingOpportunityContext(params: {
  currentId: string;
  lensLabelPlural: string;
  groups: Array<{
    id: string;
    contracts: Contract[];
  }>;
}): RemainingOpportunityContext | undefined {
  const rankedGroups = params.groups.map((group) => ({
    id: group.id,
    remainingOpportunity: remainingOpportunityFromDomains(aggregateDomains(group.contracts)),
  }));
  const current = rankedGroups.find((group) => group.id === params.currentId);

  if (!current) return undefined;

  const peerValues = rankedGroups.map((group) => group.remainingOpportunity);
  const totalRemainingOpportunity = peerValues.reduce((sum, value) => sum + value, 0);
  const rank = rankDescending(current.remainingOpportunity, peerValues);

  return {
    rank: rank.rank,
    total: rank.total,
    sharePercent: totalRemainingOpportunity > 0 ? Math.round((current.remainingOpportunity / totalRemainingOpportunity) * 100) : 0,
    lensLabelPlural: params.lensLabelPlural,
  };
}

function domainStatusFromScore(score: number): ScorecardMetricStatus {
  if (score >= 80) return "on_track";
  if (score >= 70) return "watch";
  return "at_risk";
}

function unitLowerIsBetter(unit: AgreementMetricUnit) {
  return unit === "rate_per_1000" || unit === "currency_pmpm" || unit === "days";
}

function metricStatus(currentValue: number, targetValue: number, unit: AgreementMetricUnit): ScorecardMetricStatus {
  const attainment = unitLowerIsBetter(unit)
    ? targetValue / Math.max(currentValue, 1)
    : currentValue / Math.max(targetValue, 1);

  if (attainment >= 1) return "on_track";
  if (attainment >= 0.9) return "watch";
  return "at_risk";
}

function metricTrendDirection(currentValue: number, targetValue: number, unit: AgreementMetricUnit): "up" | "down" {
  if (unitLowerIsBetter(unit)) return currentValue <= targetValue ? "down" : "up";
  return currentValue >= targetValue ? "down" : "up";
}

function aggregateDomains(contracts: Contract[]): ScorecardDomain[] {
  if (!contracts.length) return [];

  const contractScorecards = contracts.map((contract) => ({
    contract,
    scorecard: buildContractScorecard(contract),
  }));

  const domainKeys = contractScorecards[0].scorecard.domains.map((domain) => domain.key);

  return domainKeys.map((key) => {
    const sourceDomains = contractScorecards.map(({ contract, scorecard }) => ({
      contract,
      domain: scorecard.domains.find((item) => item.key === key),
    }));

    const populated = sourceDomains.filter(
      (item): item is { contract: Contract; domain: ScorecardDomain } => Boolean(item.domain)
    );

    const first = populated[0].domain;
    const score = Math.round(
      weightedAverage(populated.map((item) => ({ value: item.domain.score, weight: item.contract.attributedLives })))
    );

    const metricIds = Array.from(new Set(populated.flatMap((item) => item.domain.metrics.map((metric) => metric.id))));
    const metrics: ScorecardMetric[] = metricIds.map((metricId) => {
      const matching = populated
        .map((item) => ({
          contract: item.contract,
          metric: item.domain.metrics.find((metric) => metric.id === metricId),
        }))
        .filter((item): item is { contract: Contract; metric: ScorecardMetric } => Boolean(item.metric));

      const template = matching[0].metric;

      const currentValue = weightedAverage(
        matching.map((item) => ({ value: item.metric.currentValue, weight: item.contract.attributedLives }))
      );
      const targetValue = weightedAverage(
        matching.map((item) => ({ value: item.metric.targetValue, weight: item.contract.attributedLives }))
      );

      const benchmarkMetrics = matching.filter((item) => item.metric.benchmarkValue !== undefined);
      const benchmarkValue = benchmarkMetrics.length
        ? weightedAverage(
            benchmarkMetrics.map((item) => ({
              value: item.metric.benchmarkValue as number,
              weight: item.contract.attributedLives,
            }))
          )
        : undefined;

      return {
        ...template,
        currentValue: Number(currentValue.toFixed(1)),
        targetValue: Number(targetValue.toFixed(1)),
        benchmarkValue: benchmarkValue === undefined ? undefined : Number(benchmarkValue.toFixed(1)),
        trendDirection: metricTrendDirection(currentValue, targetValue, template.unit),
        trendPercent: Math.max(
          1,
          Math.round(
            weightedAverage(
              matching.map((item) => ({ value: item.metric.trendPercent, weight: item.contract.attributedLives }))
            )
          )
        ),
        status: metricStatus(currentValue, targetValue, template.unit),
        currentStars: Number(
          weightedAverage(matching.map((item) => ({ value: item.metric.currentStars, weight: item.contract.attributedLives }))).toFixed(1)
        ),
        targetStars: Number(
          weightedAverage(matching.map((item) => ({ value: item.metric.targetStars, weight: item.contract.attributedLives }))).toFixed(1)
        ),
        benchmarkStars: template.benchmarkStars !== undefined
          ? Number(
              weightedAverage(
                matching
                  .filter((item) => item.metric.benchmarkStars !== undefined)
                  .map((item) => ({ value: item.metric.benchmarkStars as number, weight: item.contract.attributedLives }))
              ).toFixed(1)
            )
          : undefined,
        currentlyAchievedLabel: template.currentlyAchievedLabel,
        achievedDollars: Math.round(matching.reduce((sum, item) => sum + (item.metric.achievedDollars ?? 0), 0)),
        potentialDollars: Math.round(matching.reduce((sum, item) => sum + (item.metric.potentialDollars ?? 0), 0)),
        blockedDollars: Math.round(matching.reduce((sum, item) => sum + (item.metric.blockedDollars ?? 0), 0)),
        populationCount: matching.reduce((sum, item) => sum + (item.metric.populationCount ?? 0), 0),
        populationLabel: template.populationLabel,
      };
    });

    const achievedDollars = Math.round(populated.reduce((sum, item) => sum + item.domain.achievedDollars, 0));
    const potentialDollars = Math.round(populated.reduce((sum, item) => sum + item.domain.potentialDollars, 0));
    const blockedDollars = Math.round(populated.reduce((sum, item) => sum + (item.domain.blockedDollars ?? 0), 0));
    const benchmarkDomains = populated.filter((item) => item.domain.benchmarkStars !== undefined);

    return {
      key: first.key,
      label: first.label,
      description: first.description,
      score,
      status: domainStatusFromScore(score),
      trendDirection: score >= 80 ? "down" : "up",
      trendPercent: Math.max(
        1,
        Math.round(
          weightedAverage(populated.map((item) => ({ value: item.domain.trendPercent, weight: item.contract.attributedLives })))
        )
      ),
      executiveInsight:
        score >= 80
          ? "Domain is broadly on track across this performance slice."
          : "Domain variance across underlying contracts is driving watch/at-risk performance.",
      metrics,
      currentStars: Number(
        weightedAverage(populated.map((item) => ({ value: item.domain.currentStars, weight: item.contract.attributedLives }))).toFixed(1)
      ),
      targetStars: Number(
        weightedAverage(populated.map((item) => ({ value: item.domain.targetStars, weight: item.contract.attributedLives }))).toFixed(1)
      ),
      benchmarkStars: benchmarkDomains.length
        ? Number(
            weightedAverage(
              benchmarkDomains.map((item) => ({ value: item.domain.benchmarkStars as number, weight: item.contract.attributedLives }))
            ).toFixed(1)
          )
        : undefined,
      achievedDollars,
      potentialDollars,
      blockedDollars: blockedDollars > 0 ? blockedDollars : undefined,
      currentlyAchievedSummary: `${metrics.filter((metric) => metric.status === "on_track").length}/${metrics.length} metrics currently on target`,
    };
  });
}

function summarizeSettlement(contracts: Contract[]) {
  const settlements = contracts.map((contract) => calculateEstimatedSettlement(contract));
  const netSettlementEstimate = settlements.reduce((sum, settlement) => sum + settlement.estimatedAmount, 0);
  const upsideOpportunity = settlements
    .filter((settlement) => settlement.estimatedAmount > 0)
    .reduce((sum, settlement) => sum + settlement.estimatedAmount, 0);
  const downsideExposure = settlements
    .filter((settlement) => settlement.estimatedAmount < 0)
    .reduce((sum, settlement) => sum + Math.abs(settlement.estimatedAmount), 0);

  const qualityBlockedUpside = settlements
    .filter((settlement) => settlement.status === "quality_blocked" && settlement.grossDeltaAmount > 0)
    .reduce((sum, settlement) => {
      const savingsCapAmount = settlement.benchmarkSpend * (settlement.terms.sharedSavingsCap / 100);
      const blocked = Math.min(
        settlement.grossDeltaAmount * (settlement.terms.sharedSavingsRate / 100),
        savingsCapAmount
      );
      return sum + blocked;
    }, 0);

  return {
    netSettlementEstimate,
    upsideOpportunity,
    downsideExposure,
    qualityBlockedUpside,
  };
}

function potentialSharedSavingsForContract(contract: Contract) {
  const settlement = calculateEstimatedSettlement(contract);
  if (!settlement.terms.sharedSavings) return 0;
  return Math.round(settlement.benchmarkSpend * (settlement.terms.sharedSavingsCap / 100));
}

function qualityBlockedSavingsForContract(contract: Contract) {
  const settlement = calculateEstimatedSettlement(contract);
  if (settlement.status !== "quality_blocked" || settlement.grossDeltaAmount <= 0) return 0;

  const savingsCapAmount = settlement.benchmarkSpend * (settlement.terms.sharedSavingsCap / 100);
  return Math.round(
    Math.min(
      settlement.grossDeltaAmount * (settlement.terms.sharedSavingsRate / 100),
      savingsCapAmount
    )
  );
}

function aggregateStatus(contracts: Contract[], downsideExposure: number, upsideOpportunity: number): ContractStatus {
  const totalLives = contracts.reduce((sum, contract) => sum + contract.attributedLives, 0);
  const offTrackLives = contracts
    .filter((contract) => contract.status === "Off Track")
    .reduce((sum, contract) => sum + contract.attributedLives, 0);
  const atRiskLives = contracts
    .filter((contract) => contract.status !== "On Track")
    .reduce((sum, contract) => sum + contract.attributedLives, 0);

  if (totalLives > 0 && offTrackLives / totalLives >= 0.25) return "Off Track";
  if (downsideExposure > upsideOpportunity * 1.2) return "Off Track";
  if (atRiskLives > 0 && atRiskLives / Math.max(totalLives, 1) >= 0.2) return "At Risk";
  if (contracts.some((contract) => contract.status !== "On Track")) return "At Risk";
  return "On Track";
}

function groupHeadline(status: ContractStatus) {
  if (status === "On Track") {
    return "Performance is broadly stable with opportunities to optimize upside value.";
  }
  if (status === "At Risk") {
    return "Performance is mixed and requires focused interventions in key domains.";
  }
  return "Performance is off track; prioritize downside mitigation and quality recovery actions.";
}

function childDomainLabels(contracts: Contract[]) {
  const domains = aggregateDomains(contracts);
  if (!domains.length) return { strongestDomain: undefined, weakestDomain: undefined };

  const strongest = [...domains].sort((a, b) => b.score - a.score)[0];
  const weakest = [...domains].sort((a, b) => a.score - b.score)[0];

  return {
    strongestDomain: strongest?.label,
    weakestDomain: weakest?.label,
  };
}

function annualizedCostAmount(contracts: Contract[]) {
  return Math.round(
    contracts.reduce((sum, contract) => sum + contract.currentPmpm * contract.attributedLives * 12, 0)
  );
}

function domainDollars(domains: ScorecardDomain[]) {
  return {
    achievedDollars: Math.round(domains.reduce((sum, domain) => sum + domain.achievedDollars, 0)),
    potentialDollars: Math.round(domains.reduce((sum, domain) => sum + domain.potentialDollars, 0)),
  };
}

function demoSafeVbcAmounts(rawEarnedDollars: number, rawPotentialDollars: number) {
  const vbcPotentialDollars = Math.max(rawPotentialDollars, 100_000);
  const opportunityFloor = Math.max(25_000, Math.round(vbcPotentialDollars * 0.03));
  const earnedFloor = Math.max(10_000, Math.round(vbcPotentialDollars * 0.05));
  const maxEarnedDollars = Math.max(earnedFloor, vbcPotentialDollars - opportunityFloor);
  const vbcEarnedDollars = Math.min(Math.max(rawEarnedDollars, earnedFloor), maxEarnedDollars);

  return {
    vbcEarnedDollars,
    vbcPotentialDollars,
    remainingVbcOpportunity: Math.max(vbcPotentialDollars - vbcEarnedDollars, opportunityFloor),
  };
}

export function buildContractChildSummary(contract: Contract): ScorecardChildSummary {
  const scorecard = buildContractScorecard(contract);
  const settlement = calculateEstimatedSettlement(contract);
  const strongestDomain = [...scorecard.domains].sort((a, b) => b.score - a.score)[0];
  const weakestDomain = [...scorecard.domains].sort((a, b) => a.score - b.score)[0];
  const dollars = domainDollars(scorecard.domains);
  const potentialSharedSavings = potentialSharedSavingsForContract(contract);
  const rawVbcEarnedDollars = settlement.estimatedAmount + dollars.achievedDollars;
  const rawVbcPotentialDollars = potentialSharedSavings + dollars.potentialDollars;
  const { remainingVbcOpportunity, vbcEarnedDollars, vbcPotentialDollars } = demoSafeVbcAmounts(rawVbcEarnedDollars, rawVbcPotentialDollars);
  const qualityBlockedSavingsAmount = qualityBlockedSavingsForContract(contract);

  return {
    id: contract.id,
    label: contract.name,
    scopeType: "contract",
    overallScore: contract.qualityScore,
    status: scorecard.status,
    attributedLives: contract.attributedLives,
    settlementEstimate: settlement.estimatedAmount,
    costAmount: annualizedCostAmount([contract]),
    vbcEarnedDollars,
    vbcPotentialDollars,
    remainingVbcOpportunity,
    qualityBlockedSavingsAmount,
    qualityScore: contract.qualityScore,
    edVisitsPer1000: contract.edVisitsPer1000,
    achievedDollars: dollars.achievedDollars,
    potentialDollars: dollars.potentialDollars,
    domains: scorecard.domains,
    strongestDomain: strongestDomain?.label,
    weakestDomain: weakestDomain?.label,
    href: getScorecardHref("contract", contract.id),
  };
}

export function buildGroupChildSummary(params: {
  id: string;
  label: string;
  scopeType: ScorecardScopeType;
  contracts: Contract[];
}) {
  const { contracts, id, label, scopeType } = params;
  const totalLives = contracts.reduce((sum, contract) => sum + contract.attributedLives, 0);

  const overallScore = Number(
    weightedAverage(
      contracts.map((contract) => ({
        value: contract.qualityScore,
        weight: contract.attributedLives,
      }))
    ).toFixed(1)
  );

  const settlementSummary = summarizeSettlement(contracts);
  const status = aggregateStatus(contracts, settlementSummary.downsideExposure, settlementSummary.upsideOpportunity);
  const domains = aggregateDomains(contracts);
  const dollars = domainDollars(domains);
  const potentialSharedSavings = contracts.reduce(
    (sum, contract) => sum + potentialSharedSavingsForContract(contract),
    0
  );
  const rawVbcEarnedDollars = settlementSummary.netSettlementEstimate + dollars.achievedDollars;
  const rawVbcPotentialDollars = potentialSharedSavings + dollars.potentialDollars;
  const { remainingVbcOpportunity, vbcEarnedDollars, vbcPotentialDollars } = demoSafeVbcAmounts(rawVbcEarnedDollars, rawVbcPotentialDollars);

  const qualityScore = weightedAverage(
    contracts.map((contract) => ({ value: contract.qualityScore, weight: contract.attributedLives }))
  );
  const edVisitsPer1000 = weightedAverage(
    contracts.map((contract) => ({ value: contract.edVisitsPer1000, weight: contract.attributedLives }))
  );

  const { strongestDomain, weakestDomain } = childDomainLabels(contracts);

  return {
    id,
    label,
    scopeType,
    overallScore,
    status,
    attributedLives: totalLives,
    settlementEstimate: settlementSummary.netSettlementEstimate,
    costAmount: annualizedCostAmount(contracts),
    vbcEarnedDollars,
    vbcPotentialDollars,
    remainingVbcOpportunity,
    qualityBlockedSavingsAmount: settlementSummary.qualityBlockedUpside,
    qualityScore: Number(qualityScore.toFixed(1)),
    edVisitsPer1000: Number(edVisitsPer1000.toFixed(1)),
    achievedDollars: dollars.achievedDollars,
    potentialDollars: dollars.potentialDollars,
    domains,
    strongestDomain,
    weakestDomain,
    href: getScorecardHref(scopeType, id),
  } satisfies ScorecardChildSummary;
}

export function buildScorecardRollup(params: {
  scopeType: ScorecardScopeType;
  scopeId: string;
  scopeLabel: string;
  contracts: Contract[];
  childGroups?: Array<{
    id: string;
    label: string;
    scopeType: ScorecardScopeType;
    contracts: Contract[];
  }>;
}): ScorecardRollup {
  const { childGroups = [], contracts, scopeId, scopeLabel, scopeType } = params;
  const totalAttributedLives = contracts.reduce((sum, contract) => sum + contract.attributedLives, 0);
  const contractsCount = contracts.length;
  const agreementsCount = new Set(contracts.map((contract) => contract.agreementId).filter(Boolean)).size;
  const payors = Array.from(new Set(contracts.map((contract) => contract.payor))).sort();

  const qualityRollup = weightedAverage(
    contracts.map((contract) => ({ value: contract.qualityScore, weight: contract.attributedLives }))
  );
  const edRollup = weightedAverage(
    contracts.map((contract) => ({ value: contract.edVisitsPer1000, weight: contract.attributedLives }))
  );

  const settlementSummary = summarizeSettlement(contracts);

  const statusMix = {
    onTrack: contracts.filter((contract) => contract.status === "On Track").length,
    atRisk: contracts.filter((contract) => contract.status === "At Risk").length,
    offTrack: contracts.filter((contract) => contract.status === "Off Track").length,
  };

  const atRiskLives = contracts
    .filter((contract) => contract.status !== "On Track")
    .reduce((sum, contract) => sum + contract.attributedLives, 0);

  const overallScore = Math.round(
    weightedAverage(
      contracts.map((contract) => ({
        value: buildContractScorecard(contract).overallScore,
        weight: contract.attributedLives,
      }))
    )
  );
  const normalizedOverallScore = Number.isFinite(overallScore)
    ? overallScore
    : Math.max(0, Math.min(100, Math.round(qualityRollup)));

  const status = aggregateStatus(contracts, settlementSummary.downsideExposure, settlementSummary.upsideOpportunity);

  const children = childGroups.length
    ? childGroups.map((group) =>
        buildGroupChildSummary({
          id: group.id,
          label: group.label,
          scopeType: group.scopeType,
          contracts: group.contracts,
        })
      )
    : contracts.map((contract) => buildContractChildSummary(contract));

  return {
    scope: {
      type: scopeType,
      id: scopeId,
      label: scopeLabel,
    },
    headline: groupHeadline(status),
    overallScore: normalizedOverallScore,
    status,
    asOfDate: "Mar 2026",
    totalAttributedLives,
    contractsCount,
    agreementsCount,
    payors,
    qualityRollup: Number(qualityRollup.toFixed(1)),
    edRollup: Number(edRollup.toFixed(1)),
    netSettlementEstimate: settlementSummary.netSettlementEstimate,
    upsideOpportunity: settlementSummary.upsideOpportunity,
    downsideExposure: settlementSummary.downsideExposure,
    qualityBlockedUpside: settlementSummary.qualityBlockedUpside,
    atRiskLives,
    statusMix,
    domains: aggregateDomains(contracts),
    children,
  };
}
