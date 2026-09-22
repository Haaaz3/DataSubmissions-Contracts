import { getContractScorecardForContract } from "@/lib/agreementScorecardData";
import { calculateEstimatedSettlement } from "@/lib/contracts/settlement";
import { getMeasuresForContract } from "@/lib/qualityData";
import type { Contract } from "@/types/contract";
import type {
  FinancialPriorityCategory,
  FinancialPriorityItem,
  PriorityConfidence,
  QualityBlockedMeasureInsight,
  QualityBlockedSavingsInsight,
} from "@/types/contractInsights";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function moneyScore(amount: number) {
  if (amount <= 0) return 0;
  return Math.min(100, Math.log10(amount + 1) * 18);
}

function formatMoneyCompact(amount: number) {
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000) return `${sign}$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `${sign}$${(absolute / 1_000).toFixed(1)}K`;
  return `${sign}$${absolute.toFixed(0)}`;
}

function statusSeverity(status: Contract["status"]) {
  if (status === "Off Track") return 20;
  if (status === "At Risk") return 12;
  return 4;
}

function confidenceWeight(confidence: PriorityConfidence) {
  if (confidence === "High") return 1;
  if (confidence === "Medium") return 0.75;
  if (confidence === "Low") return 0.45;
  return 0.55;
}

function mapConfidence(value?: "High" | "Medium" | "Low"): PriorityConfidence {
  return value ?? "Modeled";
}

function estimatedBlockedSavings(contract: Contract) {
  const settlement = calculateEstimatedSettlement(contract);
  if (settlement.status !== "quality_blocked" || settlement.grossDeltaAmount <= 0) return 0;
  const savingsCapAmount = settlement.benchmarkSpend * (settlement.terms.sharedSavingsCap / 100);
  return Math.min(
    settlement.grossDeltaAmount * (settlement.terms.sharedSavingsRate / 100),
    savingsCapAmount
  );
}

function primaryCategory(item: FinancialPriorityItem): FinancialPriorityCategory {
  return item.category;
}

export function getContractPriorityItems(contracts: Contract[]): FinancialPriorityItem[] {
  return contracts.map((contract) => {
    const settlement = calculateEstimatedSettlement(contract);
    const downsideExposure = Math.max(0, -settlement.estimatedAmount);
    const upsideOpportunity = Math.max(0, settlement.estimatedAmount);
    const blockedSavings = estimatedBlockedSavings(contract);
    const pmpmVariance = Math.abs(contract.currentPmpm - contract.targetPmpm);

    const score = clampScore(
      moneyScore(downsideExposure) * 0.35 +
        moneyScore(upsideOpportunity) * 0.25 +
        moneyScore(blockedSavings) * 0.25 +
        Math.min(15, pmpmVariance / 2) +
        statusSeverity(contract.status)
    );

    const category: FinancialPriorityCategory =
      blockedSavings > 0
        ? "quality_salvage"
        : downsideExposure > upsideOpportunity
        ? "downside"
        : "upside";

    const valueAmount =
      category === "quality_salvage"
        ? blockedSavings
        : category === "downside"
        ? downsideExposure
        : upsideOpportunity;

    const reasonCodes: string[] = [];
    if (blockedSavings > 0) reasonCodes.push("Quality gate blocking savings");
    if (downsideExposure > 0) reasonCodes.push("High downside exposure");
    if (upsideOpportunity > 0) reasonCodes.push("Strong upside opportunity");
    if (pmpmVariance >= 20) reasonCodes.push("PMPM variance requires intervention");
    if (reasonCodes.length === 0) reasonCodes.push("Financial posture requires monitoring");

    return {
      id: `contract:${contract.id}`,
      type: "contract",
      label: contract.name,
      contractId: contract.id,
      category,
      priorityScore: score,
      valueAmount,
      displayValue: formatMoneyCompact(valueAmount),
      confidence: "Modeled",
      reasonCodes,
      supportingDetail: `${contract.status} · ${contract.attributedLives.toLocaleString()} lives`,
      ctaLabel: "View contract",
      ctaHref: `/contracts/${contract.id}`,
    } satisfies FinancialPriorityItem;
  });
}

export function getOpportunityPriorityItems(contracts: Contract[]): FinancialPriorityItem[] {
  return contracts.flatMap((contract) =>
    contract.opportunities.map((opportunity, index) => {
      const impact = opportunity.impactEstimate;
      const pmpmDeltaMagnitude = Math.abs(impact?.pmpmDelta ?? 0);
      const revenueLiftPmpm = impact?.revenueLiftPmpm ?? 0;
      const qualityLift = impact?.qualityLiftPoints ?? 0;
      const timelineDays = impact?.timelineDays;
      const timelineScore = timelineDays ? Math.max(0, 20 - timelineDays / 10) : 8;
      const confidence = mapConfidence(opportunity.confidence);

      const baselineValue =
        pmpmDeltaMagnitude > 0
          ? pmpmDeltaMagnitude * contract.attributedLives * 12
          : revenueLiftPmpm > 0
          ? revenueLiftPmpm * contract.attributedLives * 12
          : qualityLift * contract.attributedLives * 6;
      const weightedValue = baselineValue * confidenceWeight(confidence);

      const score = clampScore(
        moneyScore(weightedValue) * 0.55 +
          Math.min(20, qualityLift * 4) +
          timelineScore +
          (confidence === "High" ? 20 : confidence === "Medium" ? 12 : 6)
      );

      const isRiskAdjustment =
        /raf|hcc|coding|risk adjustment/i.test(opportunity.title) ||
        /raf|hcc|coding|risk adjustment/i.test(opportunity.description);

      const category: FinancialPriorityCategory = isRiskAdjustment
        ? "risk_adjustment"
        : timelineDays && timelineDays <= 120 && (confidence === "High" || confidence === "Medium")
        ? "quick_win"
        : pmpmDeltaMagnitude > 0 || revenueLiftPmpm > 0
        ? "upside"
        : "quick_win";

      const reasonCodes = [
        confidence === "High" ? "High-confidence intervention" : "Modeled intervention opportunity",
      ];
      if (timelineDays && timelineDays <= 120) reasonCodes.push("Fast time to impact");
      if (isRiskAdjustment) reasonCodes.push("Risk adjustment opportunity");
      if (revenueLiftPmpm > 0) reasonCodes.push("Revenue lift opportunity");
      if (qualityLift > 0) reasonCodes.push("Potential quality-linked financial lift");

      return {
        id: `opportunity:${contract.id}:${index}`,
        type: "opportunity",
        label: opportunity.title,
        contractId: contract.id,
        category,
        priorityScore: score,
        valueAmount: weightedValue,
        displayValue: formatMoneyCompact(weightedValue),
        confidence,
        timeToImpactDays: timelineDays,
        reasonCodes,
        supportingDetail: contract.name,
        ctaLabel: "Open contract",
        ctaHref: `/contracts/${contract.id}`,
      } satisfies FinancialPriorityItem;
    })
  );
}

export function getDomainPriorityItems(contracts: Contract[]): FinancialPriorityItem[] {
  return contracts.flatMap((contract) => {
    const scorecard = getContractScorecardForContract(contract.id);
    if (!scorecard) return [];
    const settlement = calculateEstimatedSettlement(contract);
    const settlementMagnitude = Math.abs(settlement.estimatedAmount) || Math.abs(settlement.grossDeltaAmount) * 0.4;

    return scorecard.domains.map((domain) => {
      const statusPenalty = domain.status === "at_risk" ? 35 : domain.status === "watch" ? 18 : 4;
      const averageMetricWeight =
        domain.metrics.length > 0
          ? domain.metrics.reduce((sum, metric) => sum + Math.max(1, Math.round(metric.weight ?? 1)), 0) /
            domain.metrics.length
          : 1;
      const domainWeightFactor = averageMetricWeight / 5;
      const materiality = moneyScore(settlementMagnitude * domainWeightFactor);
      const score = clampScore(statusPenalty + materiality * 0.6 + averageMetricWeight * 0.6);

      const category: FinancialPriorityCategory =
        domain.key === "risk_adjustment"
          ? "risk_adjustment"
          : domain.status === "at_risk"
          ? "downside"
          : "upside";

      const reasonCodes = [
        domain.status === "at_risk" ? "At-risk high-weight domain" : "Domain-level financial lever",
      ];
      if (domain.key === "risk_adjustment") reasonCodes.push("Risk adjustment opportunity");

      return {
        id: `domain:${contract.id}:${domain.key}`,
        type: "domain",
        label: `${domain.label} · ${contract.name}`,
        contractId: contract.id,
        domainKey: domain.key,
        category,
        priorityScore: score,
        valueAmount: settlementMagnitude * domainWeightFactor,
        displayValue: formatMoneyCompact(settlementMagnitude * domainWeightFactor),
        confidence: "Modeled",
        reasonCodes,
        supportingDetail: `Domain score ${domain.score} · Avg KPI weight ${averageMetricWeight.toFixed(1)}`,
        ctaLabel: "View scorecard",
        ctaHref: `/contracts/${contract.id}/scorecard`,
      } satisfies FinancialPriorityItem;
    });
  });
}

export function getTopFinancialPriorityItems(
  contracts: Contract[],
  options?: {
    category?: FinancialPriorityCategory;
    contractId?: string;
    limit?: number;
  }
) {
  const allItems = [
    ...getContractPriorityItems(contracts),
    ...getOpportunityPriorityItems(contracts),
    ...getDomainPriorityItems(contracts),
  ];

  const filtered = allItems.filter((item) => {
    if (options?.contractId && item.contractId !== options.contractId) return false;
    if (options?.category && primaryCategory(item) !== options.category) return false;
    return true;
  });

  const sorted = filtered.sort((a, b) => b.priorityScore - a.priorityScore);
  return options?.limit ? sorted.slice(0, options.limit) : sorted;
}

export function getTopFinancialPrioritiesForContract(contract: Contract, limit = 5) {
  return getTopFinancialPriorityItems([contract], { contractId: contract.id, limit });
}

function measureContributionLabel(gap: number, totalGap: number) {
  if (totalGap <= 0) return "Monitor for sustained closure";
  const share = Math.round((gap / totalGap) * 100);
  return `${share}% of measured quality gap`;
}

function mapMeasureInsights(contract: Contract): QualityBlockedMeasureInsight[] {
  const measures = getMeasuresForContract(contract.id)
    .map((measure) => ({
      measure,
      gap: Math.max(0, measure.targetPercent - measure.performance.ratePercent),
    }))
    .filter((entry) => entry.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const totalGap = measures.reduce((sum, entry) => sum + entry.gap, 0);

  return measures.map(({ measure, gap }) => ({
    measureId: measure.id,
    measureName: measure.name,
    domain: measure.domain,
    currentRate: measure.performance.ratePercent,
    targetRate: measure.targetPercent,
    gap,
    estimatedContribution: measureContributionLabel(gap, totalGap),
  }));
}

export function getQualityBlockedSavingsForContract(contract: Contract): QualityBlockedSavingsInsight | null {
  const settlement = calculateEstimatedSettlement(contract);
  if (settlement.status !== "quality_blocked") return null;

  const blockedSavingsAmount = estimatedBlockedSavings(contract);
  const pointsToThreshold = Math.max(0, settlement.terms.qualityGate - contract.qualityScore);

  const topMeasures = mapMeasureInsights(contract);

  return {
    contractId: contract.id,
    contractName: contract.name,
    blockedSavingsAmount,
    qualityScore: contract.qualityScore,
    qualityGate: settlement.terms.qualityGate,
    pointsToThreshold,
    topMeasures,
    suggestedActions: [
      "Launch targeted quality outreach for the largest measure gaps.",
      "Prioritize high-risk members tied to low-performing measures.",
      "Track weekly measure closure to recover settlement eligibility.",
    ],
    ctaLinks: [
      { label: "Contract scorecard", href: `/contracts/${contract.id}/scorecard` },
      { label: "Quality measures", href: "/quality" },
      { label: "Launch workflows", href: "/actions" },
    ],
  };
}

export function getQualityBlockedSavingsInsights(contracts: Contract[]) {
  return contracts
    .map((contract) => getQualityBlockedSavingsForContract(contract))
    .filter((insight): insight is QualityBlockedSavingsInsight => Boolean(insight))
    .sort((a, b) => b.blockedSavingsAmount - a.blockedSavingsAmount);
}
