import { mockContractAgreements, mockContracts } from "@/lib/mockData";
import type {
  AgreementDomainKey,
  AgreementScorecard,
  AgreementMetricUnit,
  ContractScorecard,
  ScorecardDomain,
  ScorecardMetric,
  ScorecardMetricStatus,
} from "@/types/agreementScorecard";
import type { Contract, ContractAgreement, ContractType } from "@/types/contract";
import { getMeasuresForContract } from "@/lib/qualityData";
import { seededContractConfigurations } from "@/data/synthetic/contractConfigurations";

const contractById = new Map(mockContracts.map((contract) => [contract.id, contract] as const));
const configurationByContractId = new Map(
  seededContractConfigurations.map((configuration) => [configuration.contractId, configuration] as const)
);
const contractScorecardCache = new Map<string, ContractScorecard>();
const agreementScorecardCache = new Map<string, AgreementScorecard>();

function hashValue(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRange(contractId: string, key: string, min: number, max: number) {
  const hash = hashValue(`${contractId}:${key}`);
  const normalized = (hash % 10_000) / 10_000;
  return min + normalized * (max - min);
}

function metricStatus(
  currentValue: number,
  targetValue: number,
  higherIsBetter: boolean
): ScorecardMetricStatus {
  const attainment = higherIsBetter
    ? currentValue / Math.max(targetValue, 1)
    : targetValue / Math.max(currentValue, 1);

  if (attainment >= 1) return "on_track";
  if (attainment >= 0.9) return "watch";
  return "at_risk";
}

function metricTrendDirection(
  currentValue: number,
  targetValue: number,
  higherIsBetter: boolean
): "up" | "down" {
  if (higherIsBetter) return currentValue >= targetValue ? "down" : "up";
  return currentValue <= targetValue ? "down" : "up";
}

function isLowerBetter(unit: AgreementMetricUnit) {
  return unit === "rate_per_1000" || unit === "currency_pmpm" || unit === "days";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function randomizeCurrentPerformance(params: {
  contractId: string;
  metricId: string;
  unit: AgreementMetricUnit;
  currentValue: number;
  targetValue: number;
}) {
  const { contractId, metricId, currentValue, targetValue, unit } = params;
  const performanceSignal = seededRange(contractId, `${metricId}:performance-spread`, 0.2, 1.45);
  const baselineInfluence = seededRange(contractId, `${metricId}:baseline-influence`, 0.15, 0.35);
  const lowerIsBetter = isLowerBetter(unit);
  const randomizedFromTarget = lowerIsBetter
    ? targetValue / Math.max(performanceSignal, 0.05)
    : targetValue * performanceSignal;
  const rawValue = currentValue * baselineInfluence + randomizedFromTarget * (1 - baselineInfluence);

  const boundedValue = (() => {
    if (unit === "percent") return clamp(rawValue, 1, 120);
    if (unit === "rate_per_1000") return clamp(rawValue, 20, 1200);
    if (unit === "currency_pmpm") return clamp(rawValue, 50, 2500);
    if (unit === "days") return clamp(rawValue, 0.5, 30);
    if (unit === "count") return clamp(rawValue, 1, 10000);
    return rawValue;
  })();

  const decimalPlaces = unit === "currency_pmpm" || unit === "count" ? 0 : 1;
  return Number(boundedValue.toFixed(decimalPlaces));
}

function toStars(
  value: number,
  unit: AgreementMetricUnit,
  target: number,
  benchmark: number | undefined,
  targetStars: number
) {
  const lowerBetter = isLowerBetter(unit);
  const attainment = lowerBetter
    ? target / Math.max(value, 0.0001)
    : value / Math.max(target, 0.0001);

  const benchmarkAttainment = benchmark === undefined
    ? undefined
    : lowerBetter
      ? benchmark / Math.max(value, 0.0001)
      : value / Math.max(benchmark, 0.0001);

  const currentStars = Number(clamp(1 + attainment * 3.2, 1, 5).toFixed(1));
  const benchmarkStars = benchmarkAttainment === undefined
    ? undefined
    : Number(clamp(1 + benchmarkAttainment * 3.2, 1, 5).toFixed(1));

  return {
    currentStars,
    targetStars,
    benchmarkStars,
  };
}

function normalizeTargetStar(stars: number) {
  const allowed = [3.5, 4, 4.5, 5] as const;
  return allowed.reduce((closest, candidate) =>
    Math.abs(candidate - stars) < Math.abs(closest - stars) ? candidate : closest
  );
}

function targetStarsForMetric(metricId: string, contractId: string) {
  const contractType = contractById.get(contractId)?.contractType;
  const byMetric: Partial<Record<string, number>> = {
    "quality-composite": 5,
    "preventive-closure": 4.5,
    "chronic-control": 4.5,
    "cahps-overall": 4,
    "pcp-access-14d": 4,
    "followup-7d": 4.5,
    "raf-capture": contractType === "Medicare Advantage" ? 5 : 4.5,
    "hcc-recapture": 4.5,
    "awv-completion": 4.5,
    "risk-tiering-coverage": 4,
    "enc-close-rate": 4,
    "dx-specificity": 4,
    "coding-tat": 3.5,
    "ed-visits": 4,
    "avoidable-admissions": 4,
    "readmit-30d": 4.5,
    "pmpm-current": 4.5,
    "rx-pmpm": 4,
    "high-cost-concentration": 3.5,
  };

  return normalizeTargetStar(byMetric[metricId] ?? 4);
}

function estimateMetricPopulationCount(contractId: string, domainKey: AgreementDomainKey, metricId: string) {
  const contract = contractById.get(contractId);
  const lives = contract?.attributedLives ?? Math.round(seededRange(contractId, "fallback-lives", 1800, 9000));
  const type = contract?.contractType;

  const metricRatio: Partial<Record<string, number>> = {
    "quality-composite": 0.82,
    "preventive-closure": type === "Commercial" ? 0.54 : 0.68,
    "chronic-control": type === "Commercial" ? 0.32 : 0.46,
    "ed-visits": 0.18,
    "avoidable-admissions": 0.12,
    "readmit-30d": 0.09,
    "pmpm-current": 1,
    "rx-pmpm": type === "Commercial" ? 0.42 : 0.62,
    "high-cost-concentration": 0.1,
    "cahps-overall": 0.58,
    "pcp-access-14d": 0.76,
    "followup-7d": 0.14,
    "raf-capture": type === "Medicare Advantage" ? 0.64 : 0.44,
    "hcc-recapture": type === "Medicare Advantage" ? 0.46 : 0.34,
    "awv-completion": type === "Commercial" ? 0.28 : 0.72,
    "risk-tiering-coverage": 0.88,
    "enc-close-rate": 0.92,
    "dx-specificity": 0.5,
    "coding-tat": 0.42,
  };

  const domainRatio: Record<AgreementDomainKey, number> = {
    quality_of_care: 0.58,
    utilization_efficiency: 0.2,
    cost_management: 0.72,
    patient_experience: 0.55,
    risk_adjustment: 0.48,
    documentation: 0.38,
  };

  const ratio = metricRatio[metricId] ?? domainRatio[domainKey];
  const variation = seededRange(contractId, `${domainKey}:${metricId}:population-count`, 0.86, 1.14);
  return Math.max(1, Math.min(lives, Math.round(lives * ratio * variation)));
}

function estimateMetricDollars(params: {
  contractId: string;
  domainKey: AgreementDomainKey;
  metricId: string;
  currentValue: number;
  targetValue: number;
  benchmarkValue?: number;
}) {
  const { contractId, domainKey, metricId, currentValue, targetValue } = params;
  const contract = contractById.get(contractId);
  const annualSpend = contract
    ? contract.currentPmpm * contract.attributedLives * 12
    : seededRange(contractId, "fallback-annual-spend", 18_000_000, 90_000_000);

  const typeBasePct: Record<ContractType, number> = {
    MSSP: 0.00135,
    "Medicare Advantage": 0.0012,
    Commercial: 0.00085,
  };

  const domainMultiplier: Record<AgreementDomainKey, number> = {
    quality_of_care: 1.25,
    utilization_efficiency: 1.15,
    cost_management: 1.35,
    patient_experience: 0.55,
    risk_adjustment: 0.95,
    documentation: 0.45,
  };

  const metricLowerIsBetter = new Set([
    "ed-visits",
    "avoidable-admissions",
    "readmit-30d",
    "pmpm-current",
    "rx-pmpm",
    "high-cost-concentration",
    "coding-tat",
  ]).has(metricId);

  const seededVariation = seededRange(contractId, `${domainKey}:${metricId}:potential-variation`, 0.82, 1.18);
  const gapRatio = Math.abs(currentValue - targetValue) / Math.max(Math.abs(targetValue), 1);
  const gapOpportunityFactor = 0.72 + Math.min(1.15, gapRatio * 4.5);
  const metricWeight = Math.max(1, Math.round(resolveMetricWeight(contractId, metricId)));
  const metricWeightFactor = 0.8 + metricWeight * 0.08;

  const rawPotential =
    annualSpend *
    (contract ? typeBasePct[contract.contractType] : 0.001) *
    domainMultiplier[domainKey] *
    gapOpportunityFactor *
    metricWeightFactor *
    seededVariation;

  const capsByType: Record<ContractType, { min: number; max: number }> = {
    MSSP: { min: 35_000, max: 450_000 },
    "Medicare Advantage": { min: 40_000, max: 520_000 },
    Commercial: { min: 18_000, max: 180_000 },
  };
  const caps = contract ? capsByType[contract.contractType] : { min: 25_000, max: 300_000 };
  const potentialDollars = Math.round(clamp(rawPotential, caps.min, caps.max));

  const attainment = metricLowerIsBetter
    ? targetValue / Math.max(currentValue, 0.0001)
    : currentValue / Math.max(targetValue, 0.0001);
  const achievedRatio = clamp(0.22 + attainment * 0.6, 0.18, 0.94);
  const achievedDollars = Math.round(potentialDollars * achievedRatio);
  const blockedDollars = Math.round(Math.max(0, potentialDollars - achievedDollars) * (attainment < 0.92 ? 0.45 : 0.18));
  return {
    achievedDollars,
    potentialDollars,
    blockedDollars,
  };
}

function formatMetricValue(value: number, unit: AgreementMetricUnit) {
  if (unit === "percent") return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
  if (unit === "rate_per_1000") return `${value.toFixed(value % 1 === 0 ? 0 : 1)} / 1,000`;
  if (unit === "currency_pmpm") return `$${Math.round(value).toLocaleString()} PMPM`;
  if (unit === "days") return `${value.toFixed(1)} days`;
  if (unit === "count") return Math.round(value).toLocaleString();
  return value.toFixed(1);
}

function buildMetricThresholds(metricId: string, targetStars: number, benchmarkStars?: number) {
  const multiThresholdMetricIds = new Set([
    "quality-composite",
    "preventive-closure",
    "chronic-control",
    "cahps-overall",
    "pcp-access-14d",
    "followup-7d",
    "raf-capture",
    "hcc-recapture",
    "awv-completion",
    "risk-tiering-coverage",
  ]);

  if (!multiThresholdMetricIds.has(metricId)) return undefined;

  const starSteps = [3.5, 4, 4.5, 5].filter((value) => value >= targetStars);

  return [
    ...starSteps.map((value, index) => {
      const kind: "target" | "stretch" = index === 0 ? "target" : "stretch";
      return {
        id: `${metricId}-star-${value.toString().replace(".", "")}`,
        label: `${value.toFixed(value % 1 === 0 ? 0 : 1)} Star`,
        value,
        stars: value,
        kind,
        description: index === 0 ? "Primary target threshold." : "Stretch threshold for bonus acceleration.",
      };
    }),
    ...(benchmarkStars !== undefined
      ? [{
          id: `${metricId}-benchmark`,
          label: "Benchmark",
          value: Number(benchmarkStars.toFixed(1)),
          stars: Number(benchmarkStars.toFixed(1)),
          kind: "benchmark" as const,
          description: "Market benchmark reference.",
        }]
      : []),
  ];
}

const metricIdToCatalogCandidates: Record<string, string[]> = {
  "quality-composite": ["kpi-quality-composite-score"],
  "ed-visits": ["kpi-ed-visits-per-1000"],
  "pmpm-current": ["kpi-total-cost-pmpm"],
  "raf-capture": ["kpi-raf-capture-rate"],
};

function defaultMetricWeight(metricId: string) {
  const maCategoryWeights: Partial<Record<string, number>> = {
    // Process-style measures (typical lower weight)
    "preventive-closure": 1,
    "enc-close-rate": 1,
    "coding-tat": 1,
    "dx-specificity": 1,
    "awv-completion": 1,
    // Experience / access style measures
    "cahps-overall": 2,
    "pcp-access-14d": 2,
    "followup-7d": 2,
    // Outcome / intermediate-outcome style measures
    "quality-composite": 3,
    "chronic-control": 3,
    "raf-capture": 3,
    "hcc-recapture": 3,
    "risk-tiering-coverage": 3,
    "ed-visits": 3,
    "avoidable-admissions": 3,
    "readmit-30d": 3,
    "pmpm-current": 3,
    "rx-pmpm": 3,
    "high-cost-concentration": 3,
  };

  return maCategoryWeights[metricId] ?? 1;
}

function randomizeMetricWeightAcrossContracts(contractId: string, metricId: string) {
  const base = defaultMetricWeight(metricId);
  const variationSignal = seededRange(contractId, `${metricId}:weight-variation`, 0, 1);

  // Deterministic contract-level variation while staying MA-like and integer-bounded.
  const delta = variationSignal >= 0.75 ? 1 : variationSignal <= 0.25 ? -1 : 0;
  return Math.max(1, Math.min(5, Math.round(base + delta)));
}

function configuredMetricWeight(contractId: string, metricId: string) {
  const configuration = configurationByContractId.get(contractId);
  if (!configuration) return undefined;
  const candidates = metricIdToCatalogCandidates[metricId];
  if (!candidates?.length) return undefined;

  for (const catalogId of candidates) {
    const selection = configuration.selectedMetrics.find((item) => item.kpiCatalogItemId === catalogId);
    if (!selection) continue;
    const target = configuration.metricTargets.find(
      (item) => item.contractMetricSelectionId === selection.id && typeof item.weight === "number"
    );
    if (typeof target?.weight === "number") {
      return Math.max(1, Math.min(5, Math.round(target.weight)));
    }
  }

  return undefined;
}

function resolveMetricWeight(contractId: string, metricId: string) {
  return configuredMetricWeight(contractId, metricId) ?? randomizeMetricWeightAcrossContracts(contractId, metricId);
}

function buildMetric({
  contractId,
  domainKey,
  id,
  label,
  description,
  unit,
  currentValue,
  targetValue,
  benchmarkValue,
  higherIsBetter,
  trendPercent,
}: {
  contractId: string;
  domainKey: AgreementDomainKey;
  id: string;
  label: string;
  description: string;
  unit: AgreementMetricUnit;
  currentValue: number;
  targetValue: number;
  benchmarkValue?: number;
  higherIsBetter: boolean;
  trendPercent: number;
}): ScorecardMetric {
  const randomizedCurrentValue = randomizeCurrentPerformance({
    contractId,
    metricId: id,
    unit,
    currentValue,
    targetValue,
  });
  const targetStars = targetStarsForMetric(id, contractId);
  const stars = toStars(randomizedCurrentValue, unit, targetValue, benchmarkValue, targetStars);
  const dollars = estimateMetricDollars({
    contractId,
    domainKey,
    metricId: id,
    currentValue: randomizedCurrentValue,
    targetValue,
    benchmarkValue,
  });
  const thresholds = buildMetricThresholds(id, stars.targetStars, stars.benchmarkStars);
  const weight = resolveMetricWeight(contractId, id);
  const populationCount = estimateMetricPopulationCount(contractId, domainKey, id);

  return {
    id,
    label,
    description,
    unit,
    currentValue: randomizedCurrentValue,
    targetValue,
    benchmarkValue,
    trendDirection: metricTrendDirection(randomizedCurrentValue, targetValue, higherIsBetter),
    trendPercent,
    status: metricStatus(randomizedCurrentValue, targetValue, higherIsBetter),
    currentStars: stars.currentStars,
    targetStars: stars.targetStars,
    benchmarkStars: stars.benchmarkStars,
    currentlyAchievedLabel: formatMetricValue(randomizedCurrentValue, unit),
    achievedDollars: dollars.achievedDollars,
    potentialDollars: dollars.potentialDollars,
    blockedDollars: dollars.blockedDollars,
    thresholds,
    primaryTargetThresholdId: thresholds?.find((threshold) => threshold.kind === "target")?.id,
    benchmarkThresholdId: thresholds?.find((threshold) => threshold.kind === "benchmark")?.id,
    calculationNotes: [
      "Target and benchmark values are normalized to MA Stars-style scale for cross-metric comparability.",
      "Dollar values are synthetic directional estimates for UX prototyping.",
    ],
    achievedDollarComponents: [
      {
        label: `${label} achieved value`,
        value: dollars.achievedDollars,
      },
    ],
    potentialDollarComponents: [
      {
        label: `${label} budgeted value`,
        value: dollars.potentialDollars,
      },
    ],
    starCalculationExplanation:
      "Current stars are calculated from attainment against target, with lower-is-better logic for utilization and cost metrics.",
    weight,
    populationCount,
    populationLabel: "Qualifying patients",
  };
}

function weightedAverage(values: Array<{ value: number; weight: number }>) {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return 0;
  return values.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
}

function domainStatus(stars: number): ScorecardMetricStatus {
  if (stars >= 4) return "on_track";
  if (stars >= 3.5) return "watch";
  return "at_risk";
}

function targetsForType(contractType: ContractType) {
  if (contractType === "MSSP") {
    return {
      quality: 78,
      edVisits: 280,
      readmission: 10.5,
      avoidableAdmissions: 160,
      pcpAccess: 74,
      followUp7d: 68,
      rafCapture: 92,
      hccRecapture: 84,
      encounterCloseRate: 87,
      codingTatDays: 4.8,
    };
  }

  if (contractType === "Medicare Advantage") {
    return {
      quality: 82,
      edVisits: 265,
      readmission: 9.2,
      avoidableAdmissions: 145,
      pcpAccess: 78,
      followUp7d: 72,
      rafCapture: 95,
      hccRecapture: 88,
      encounterCloseRate: 90,
      codingTatDays: 4.2,
    };
  }

  return {
    quality: 76,
    edVisits: 260,
    readmission: 8.8,
    avoidableAdmissions: 135,
    pcpAccess: 76,
    followUp7d: 70,
    rafCapture: 90,
    hccRecapture: 82,
    encounterCloseRate: 88,
    codingTatDays: 4.5,
  };
}

type DomainMetricProfile = Record<AgreementDomainKey, string[]>;

type UtilizationVariationProfile = {
  edTargetDelta: number;
  avoidableTargetDelta: number;
  readmissionTargetDelta: number;
  readmissionDelta: number;
  avoidableAdmissionMultiplier: number;
  pcpAccessDelta: number;
  followupDelta: number;
};

const defaultUtilizationVariation: UtilizationVariationProfile = {
  edTargetDelta: 0,
  avoidableTargetDelta: 0,
  readmissionTargetDelta: 0,
  readmissionDelta: 0,
  avoidableAdmissionMultiplier: 1,
  pcpAccessDelta: 0,
  followupDelta: 0,
};

const utilizationVariationByContract: Partial<Record<string, UtilizationVariationProfile>> = {
  "mssp-001": {
    edTargetDelta: 8,
    avoidableTargetDelta: 7,
    readmissionTargetDelta: 0.3,
    readmissionDelta: 0.7,
    avoidableAdmissionMultiplier: 1.08,
    pcpAccessDelta: -2,
    followupDelta: -1.5,
  },
  "mssp-002": {
    edTargetDelta: -6,
    avoidableTargetDelta: -4,
    readmissionTargetDelta: -0.2,
    readmissionDelta: -0.4,
    avoidableAdmissionMultiplier: 0.94,
    pcpAccessDelta: 1.4,
    followupDelta: 1.2,
  },
  "mssp-003": {
    edTargetDelta: 12,
    avoidableTargetDelta: 10,
    readmissionTargetDelta: 0.5,
    readmissionDelta: 1.1,
    avoidableAdmissionMultiplier: 1.12,
    pcpAccessDelta: -3,
    followupDelta: -2.4,
  },
  "ma-003": {
    edTargetDelta: -5,
    avoidableTargetDelta: -6,
    readmissionTargetDelta: -0.3,
    readmissionDelta: -0.5,
    avoidableAdmissionMultiplier: 0.93,
    pcpAccessDelta: 1,
    followupDelta: 1.1,
  },
  "ma-004": {
    edTargetDelta: 14,
    avoidableTargetDelta: 11,
    readmissionTargetDelta: 0.6,
    readmissionDelta: 1.2,
    avoidableAdmissionMultiplier: 1.14,
    pcpAccessDelta: -2.8,
    followupDelta: -2,
  },
  "comm-003": {
    edTargetDelta: -8,
    avoidableTargetDelta: -7,
    readmissionTargetDelta: -0.4,
    readmissionDelta: -0.6,
    avoidableAdmissionMultiplier: 0.91,
    pcpAccessDelta: 1.8,
    followupDelta: 1.5,
  },
  "comm-004": {
    edTargetDelta: 10,
    avoidableTargetDelta: 8,
    readmissionTargetDelta: 0.4,
    readmissionDelta: 0.8,
    avoidableAdmissionMultiplier: 1.1,
    pcpAccessDelta: -2.2,
    followupDelta: -1.8,
  },
  "comm-006": {
    edTargetDelta: 7,
    avoidableTargetDelta: 6,
    readmissionTargetDelta: 0.2,
    readmissionDelta: 0.5,
    avoidableAdmissionMultiplier: 1.06,
    pcpAccessDelta: -1.4,
    followupDelta: -1.1,
  },
};

function utilizationVariationForContract(contractId: string): UtilizationVariationProfile {
  return {
    ...defaultUtilizationVariation,
    ...(utilizationVariationByContract[contractId] ?? {}),
  };
}

const baseMetricProfilesByType: Record<ContractType, DomainMetricProfile> = {
  MSSP: {
    quality_of_care: ["quality-composite", "preventive-closure", "chronic-control"],
    utilization_efficiency: ["ed-visits", "avoidable-admissions", "readmit-30d"],
    cost_management: ["pmpm-current", "high-cost-concentration"],
    patient_experience: ["pcp-access-14d", "followup-7d"],
    risk_adjustment: ["awv-completion", "risk-tiering-coverage"],
    documentation: ["enc-close-rate", "coding-tat"],
  },
  "Medicare Advantage": {
    quality_of_care: ["quality-composite", "chronic-control", "preventive-closure"],
    utilization_efficiency: ["ed-visits", "readmit-30d"],
    cost_management: ["pmpm-current", "rx-pmpm", "high-cost-concentration"],
    patient_experience: ["cahps-overall", "followup-7d"],
    risk_adjustment: ["raf-capture", "hcc-recapture", "awv-completion"],
    documentation: ["enc-close-rate", "dx-specificity"],
  },
  Commercial: {
    quality_of_care: ["quality-composite", "preventive-closure"],
    utilization_efficiency: ["ed-visits", "avoidable-admissions"],
    cost_management: ["pmpm-current", "rx-pmpm", "high-cost-concentration"],
    patient_experience: ["cahps-overall", "pcp-access-14d"],
    risk_adjustment: ["risk-tiering-coverage"],
    documentation: ["enc-close-rate", "coding-tat"],
  },
};

const contractMetricProfileOverrides: Partial<Record<string, Partial<DomainMetricProfile>>> = {
  "mssp-001": {
    quality_of_care: ["quality-composite", "chronic-control"],
    utilization_efficiency: ["ed-visits", "avoidable-admissions"],
    cost_management: ["pmpm-current"],
    risk_adjustment: ["awv-completion"],
  },
  "mssp-003": {
    utilization_efficiency: ["ed-visits", "avoidable-admissions", "readmit-30d"],
    patient_experience: ["followup-7d"],
    documentation: ["coding-tat"],
  },
  "ma-002": {
    risk_adjustment: ["raf-capture", "hcc-recapture"],
    documentation: ["enc-close-rate", "coding-tat", "dx-specificity"],
  },
  "ma-004": {
    quality_of_care: ["quality-composite", "chronic-control"],
    utilization_efficiency: ["ed-visits", "avoidable-admissions", "readmit-30d"],
    patient_experience: ["pcp-access-14d", "followup-7d"],
  },
  "comm-001": {
    quality_of_care: ["quality-composite", "preventive-closure", "chronic-control"],
    risk_adjustment: ["risk-tiering-coverage"],
  },
  "comm-003": {
    utilization_efficiency: ["ed-visits"],
    cost_management: ["pmpm-current", "rx-pmpm"],
    documentation: ["enc-close-rate"],
  },
  "comm-004": {
    patient_experience: ["cahps-overall", "pcp-access-14d", "followup-7d"],
    risk_adjustment: ["risk-tiering-coverage"],
  },
};

function resolveMetricProfile(contract: Contract): DomainMetricProfile {
  const baseProfile = baseMetricProfilesByType[contract.contractType];
  const overrideProfile = contractMetricProfileOverrides[contract.id];

  return {
    quality_of_care: overrideProfile?.quality_of_care ?? baseProfile.quality_of_care,
    utilization_efficiency: overrideProfile?.utilization_efficiency ?? baseProfile.utilization_efficiency,
    cost_management: overrideProfile?.cost_management ?? baseProfile.cost_management,
    patient_experience: overrideProfile?.patient_experience ?? baseProfile.patient_experience,
    risk_adjustment: overrideProfile?.risk_adjustment ?? baseProfile.risk_adjustment,
    documentation: overrideProfile?.documentation ?? baseProfile.documentation,
  };
}

function buildDomains(contract: Contract): ScorecardDomain[] {
  const targets = targetsForType(contract.contractType);
  const utilizationVariation = utilizationVariationForContract(contract.id);
  const metricProfile = resolveMetricProfile(contract);
  const qualityMeasures = getMeasuresForContract(contract.id);
  const preventiveMeasures = qualityMeasures.filter((m) => m.domain === "Preventive");
  const chronicMeasures = qualityMeasures.filter((m) => m.domain === "Chronic");

  const preventiveRate =
    preventiveMeasures.length > 0
      ? preventiveMeasures.reduce((sum, m) => sum + m.performance.ratePercent, 0) /
        preventiveMeasures.length
      : contract.qualityScore - seededRange(contract.id, "preventive-fallback", 6, 12);

  const chronicRate =
    chronicMeasures.length > 0
      ? chronicMeasures.reduce((sum, m) => sum + m.performance.ratePercent, 0) /
        chronicMeasures.length
      : contract.qualityScore - seededRange(contract.id, "chronic-fallback", 4, 9);

  const readmissionRate =
    7 +
    (contract.edVisitsPer1000 - 220) / 35 +
    seededRange(contract.id, "readmit", -0.6, 0.8) +
    utilizationVariation.readmissionDelta;
  const avoidableAdmissions =
    (95 +
      (contract.edVisitsPer1000 - 180) * 0.38 +
      seededRange(contract.id, "avoidable-adm", -10, 14)) *
    utilizationVariation.avoidableAdmissionMultiplier;

  const pcpAccess14d =
    86 -
    (contract.edVisitsPer1000 - 210) * 0.05 +
    seededRange(contract.id, "pcp-access", -4, 3) +
    utilizationVariation.pcpAccessDelta;
  const followup7d =
    77 -
    (readmissionRate - 8.5) * 1.5 +
    seededRange(contract.id, "followup-7d", -3, 2) +
    utilizationVariation.followupDelta;

  const rafCapture =
    (contract.contractType === "Medicare Advantage" ? 90 : 87) +
    seededRange(contract.id, "raf-capture", -6, 7);
  const hccRecapture =
    (contract.contractType === "Medicare Advantage" ? 84 : 79) +
    seededRange(contract.id, "hcc-recapture", -8, 7);

  const encounterCloseRate =
    91 - (contract.edVisitsPer1000 - 230) * 0.04 + seededRange(contract.id, "enc-close", -5, 4);
  const codingTatDays =
    3.6 +
    (contract.currentPmpm > contract.targetPmpm ? 0.8 : 0.1) +
    seededRange(contract.id, "coding-tat", -0.6, 1.1);

  const qualityMetrics = [
    buildMetric({
      contractId: contract.id,
      domainKey: "quality_of_care",
      id: "quality-composite",
      label: "Composite quality score",
      description: "Agreement-level quality composite against contract quality gate and bonus thresholds.",
      unit: "percent",
      currentValue: contract.qualityScore,
      targetValue: targets.quality,
      benchmarkValue: targets.quality - 3,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "quality-trend", 1, 5)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "quality_of_care",
      id: "preventive-closure",
      label: "Preventive care closure",
      description: "Percent of preventive screening opportunities closed in measurement year.",
      unit: "percent",
      currentValue: Math.round(preventiveRate),
      targetValue: 74,
      benchmarkValue: 70,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "preventive-trend", 1, 4)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "quality_of_care",
      id: "chronic-control",
      label: "Chronic condition control",
      description: "Control performance for diabetes, hypertension, and related chronic populations.",
      unit: "percent",
      currentValue: Math.round(chronicRate),
      targetValue: 76,
      benchmarkValue: 72,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "chronic-trend", 1, 4)),
    }),
  ];

  const utilizationMetrics = [
    buildMetric({
      contractId: contract.id,
      domainKey: "utilization_efficiency",
      id: "ed-visits",
      label: "ED visits per 1,000",
      description: "Emergency utilization rate normalized per 1,000 attributed members.",
      unit: "rate_per_1000",
      currentValue: contract.edVisitsPer1000,
      targetValue: targets.edVisits + utilizationVariation.edTargetDelta,
      benchmarkValue: targets.edVisits + 18,
      higherIsBetter: false,
      trendPercent: Math.round(seededRange(contract.id, "ed-trend", 1, 6)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "utilization_efficiency",
      id: "avoidable-admissions",
      label: "Avoidable admissions per 1,000",
      description: "Admissions associated with ambulatory care-sensitive conditions.",
      unit: "rate_per_1000",
      currentValue: Math.round(avoidableAdmissions),
      targetValue: targets.avoidableAdmissions + utilizationVariation.avoidableTargetDelta,
      benchmarkValue: targets.avoidableAdmissions + 14,
      higherIsBetter: false,
      trendPercent: Math.round(seededRange(contract.id, "avoidable-trend", 1, 5)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "utilization_efficiency",
      id: "readmit-30d",
      label: "30-day readmission rate",
      description: "All-cause readmissions within 30 days of acute discharge.",
      unit: "percent",
      currentValue: Number(readmissionRate.toFixed(1)),
      targetValue: Number((targets.readmission + utilizationVariation.readmissionTargetDelta).toFixed(1)),
      benchmarkValue: targets.readmission + 0.8,
      higherIsBetter: false,
      trendPercent: Math.round(seededRange(contract.id, "readmit-trend", 1, 4)),
    }),
  ];

  const costMetrics = [
    buildMetric({
      contractId: contract.id,
      domainKey: "cost_management",
      id: "pmpm-current",
      label: "Current PMPM",
      description: "Actual per-member-per-month spend against agreement target trajectory.",
      unit: "currency_pmpm",
      currentValue: contract.currentPmpm,
      targetValue: contract.targetPmpm,
      benchmarkValue: contract.targetPmpm + seededRange(contract.id, "pmpm-bench", 6, 24),
      higherIsBetter: false,
      trendPercent: Math.round(seededRange(contract.id, "pmpm-trend", 1, 5)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "cost_management",
      id: "rx-pmpm",
      label: "Pharmacy PMPM",
      description: "Medication spend PMPM including specialty and maintenance drug classes.",
      unit: "currency_pmpm",
      currentValue: Number((contract.currentPmpm * seededRange(contract.id, "rx-share", 0.18, 0.29)).toFixed(0)),
      targetValue: Number((contract.targetPmpm * 0.22).toFixed(0)),
      benchmarkValue: Number((contract.targetPmpm * 0.24).toFixed(0)),
      higherIsBetter: false,
      trendPercent: Math.round(seededRange(contract.id, "rx-trend", 1, 6)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "cost_management",
      id: "high-cost-concentration",
      label: "High-cost member concentration",
      description: "Percent of spend concentrated in top 5% of members.",
      unit: "percent",
      currentValue: Number(seededRange(contract.id, "hi-cost", 36, 52).toFixed(1)),
      targetValue: 40,
      benchmarkValue: 43,
      higherIsBetter: false,
      trendPercent: Math.round(seededRange(contract.id, "hi-cost-trend", 1, 4)),
    }),
  ];

  const experienceMetrics = [
    buildMetric({
      contractId: contract.id,
      domainKey: "patient_experience",
      id: "cahps-overall",
      label: "CAHPS overall rating",
      description: "Member-reported overall care experience and access rating.",
      unit: "percent",
      currentValue: Number(seededRange(contract.id, "cahps", 69, 86).toFixed(1)),
      targetValue: 80,
      benchmarkValue: 77,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "cahps-trend", 1, 4)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "patient_experience",
      id: "pcp-access-14d",
      label: "PCP access within 14 days",
      description: "Percent of appointment requests fulfilled within 14 calendar days.",
      unit: "percent",
      currentValue: Number(Math.max(55, Math.min(92, pcpAccess14d)).toFixed(1)),
      targetValue: targets.pcpAccess,
      benchmarkValue: targets.pcpAccess - 3,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "pcp-access-trend", 1, 5)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "patient_experience",
      id: "followup-7d",
      label: "Post-discharge follow-up within 7 days",
      description: "Members with timely ambulatory follow-up after inpatient discharge.",
      unit: "percent",
      currentValue: Number(Math.max(52, Math.min(92, followup7d)).toFixed(1)),
      targetValue: targets.followUp7d,
      benchmarkValue: targets.followUp7d - 3,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "followup-trend", 1, 5)),
    }),
  ];

  const riskAdjustmentMetrics = [
    buildMetric({
      contractId: contract.id,
      domainKey: "risk_adjustment",
      id: "raf-capture",
      label: "RAF capture index",
      description: "Relative expected RAF capture versus identified chronic burden.",
      unit: "percent",
      currentValue: Number(Math.max(70, Math.min(110, rafCapture)).toFixed(1)),
      targetValue: targets.rafCapture,
      benchmarkValue: targets.rafCapture - 4,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "raf-trend", 1, 5)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "risk_adjustment",
      id: "hcc-recapture",
      label: "HCC recapture rate",
      description: "Prior-year HCC conditions successfully recaptured in current year documentation.",
      unit: "percent",
      currentValue: Number(Math.max(60, Math.min(96, hccRecapture)).toFixed(1)),
      targetValue: targets.hccRecapture,
      benchmarkValue: targets.hccRecapture - 3,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "hcc-trend", 1, 5)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "risk_adjustment",
      id: "awv-completion",
      label: "Annual wellness visit completion",
      description: "Attributed members with annual wellness visit completed during measurement year.",
      unit: "percent",
      currentValue: Number(seededRange(contract.id, "awv", 58, 84).toFixed(1)),
      targetValue: 76,
      benchmarkValue: 72,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "awv-trend", 1, 4)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "risk_adjustment",
      id: "risk-tiering-coverage",
      label: "Risk tiering coverage",
      description: "Percent of attributed members with an updated risk tier in the past 90 days.",
      unit: "percent",
      currentValue: Number(seededRange(contract.id, "risk-tiering", 61, 94).toFixed(1)),
      targetValue: contract.contractType === "Commercial" ? 82 : 86,
      benchmarkValue: contract.contractType === "Commercial" ? 78 : 83,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "risk-tiering-trend", 1, 4)),
    }),
  ];

  const documentationMetrics = [
    buildMetric({
      contractId: contract.id,
      domainKey: "documentation",
      id: "enc-close-rate",
      label: "Encounter close rate ≤ 7 days",
      description: "Percent of encounters closed and coded within seven days of service date.",
      unit: "percent",
      currentValue: Number(Math.max(65, Math.min(96, encounterCloseRate)).toFixed(1)),
      targetValue: targets.encounterCloseRate,
      benchmarkValue: targets.encounterCloseRate - 4,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "enc-close-trend", 1, 4)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "documentation",
      id: "coding-tat",
      label: "Coding query turnaround",
      description: "Average business days to resolve coding and documentation queries.",
      unit: "days",
      currentValue: Number(Math.max(2.2, Math.min(9.5, codingTatDays)).toFixed(1)),
      targetValue: targets.codingTatDays,
      benchmarkValue: targets.codingTatDays + 0.8,
      higherIsBetter: false,
      trendPercent: Math.round(seededRange(contract.id, "coding-tat-trend", 1, 4)),
    }),
    buildMetric({
      contractId: contract.id,
      domainKey: "documentation",
      id: "dx-specificity",
      label: "Diagnosis specificity",
      description: "Percent of coded diagnoses meeting clinical specificity and audit standards.",
      unit: "percent",
      currentValue: Number(seededRange(contract.id, "dx-spec", 72, 93).toFixed(1)),
      targetValue: 88,
      benchmarkValue: 84,
      higherIsBetter: true,
      trendPercent: Math.round(seededRange(contract.id, "dx-spec-trend", 1, 4)),
    }),
  ];

  const metricsByDomain: Record<AgreementDomainKey, ScorecardMetric[]> = {
    quality_of_care: qualityMetrics,
    utilization_efficiency: utilizationMetrics,
    cost_management: costMetrics,
    patient_experience: experienceMetrics,
    risk_adjustment: riskAdjustmentMetrics,
    documentation: documentationMetrics,
  };

  const domains: Array<Omit<ScorecardDomain, "score" | "status" | "trendDirection" | "trendPercent" | "currentStars" | "targetStars" | "benchmarkStars" | "achievedDollars" | "potentialDollars" | "blockedDollars" | "currentlyAchievedSummary">> = [
    {
      key: "quality_of_care" as AgreementDomainKey,
      label: "Quality of Care",
      description: "Clinical quality performance tied to incentive eligibility and quality gate success.",
      executiveInsight:
        "Closing chronic and preventive care gaps remains the primary lever for bonus qualification.",
      metrics: metricsByDomain.quality_of_care,
    },
    {
      key: "utilization_efficiency" as AgreementDomainKey,
      label: "Utilization Efficiency",
      description: "Avoidable acute utilization and post-acute outcomes that influence cost trend.",
      executiveInsight:
        "ED and avoidable admissions trend is materially impacting PMPM trajectory this quarter.",
      metrics: metricsByDomain.utilization_efficiency,
    },
    {
      key: "cost_management" as AgreementDomainKey,
      label: "Cost Management",
      description: "Total cost of care and PMPM controls versus agreement performance corridor.",
      executiveInsight:
        "PMPM run-rate is the largest direct driver of settlement movement in this agreement.",
      metrics: metricsByDomain.cost_management,
    },
    {
      key: "patient_experience" as AgreementDomainKey,
      label: "Patient Experience",
      description: "Access and member experience indicators correlated to retention and quality outcomes.",
      executiveInsight:
        "Access and transition follow-up reliability are creating variance in member experience measures.",
      metrics: metricsByDomain.patient_experience,
    },
    {
      key: "risk_adjustment" as AgreementDomainKey,
      label: "Risk Adjustment",
      description: "Acuity capture and condition recapture completeness across attributed members.",
      executiveInsight:
        "Risk capture reliability is improving but remains uneven across high-burden cohorts.",
      metrics: metricsByDomain.risk_adjustment,
    },
    {
      key: "documentation" as AgreementDomainKey,
      label: "Documentation",
      description: "Coding and documentation timeliness and specificity supporting accurate performance attribution.",
      executiveInsight:
        "Documentation throughput is a leading indicator for both RAF integrity and quality closure.",
      metrics: metricsByDomain.documentation,
    },
  ].map((domain) => {
    const configuredMetricIds = metricProfile[domain.key];
    const configuredMetrics = domain.metrics.filter((metric) => configuredMetricIds.includes(metric.id));

    return {
      ...domain,
      metrics: configuredMetrics.length > 0 ? configuredMetrics : domain.metrics.slice(0, 1),
    };
  });

  return domains.map((domain) => {
    const weightedMetricStars = domain.metrics.map((metric) => ({
      value: metric.currentStars,
      weight: Math.max(1, Math.round(metric.weight ?? 1)),
    }));
    const weightedTargetStars = domain.metrics.map((metric) => ({
      value: metric.targetStars,
      weight: Math.max(1, Math.round(metric.weight ?? 1)),
    }));
    const weightedBenchmarkStars = domain.metrics
      .filter((metric) => metric.benchmarkStars !== undefined)
      .map((metric) => ({
        value: metric.benchmarkStars as number,
        weight: Math.max(1, Math.round(metric.weight ?? 1)),
      }));

    const domainCurrentStars = Number(weightedAverage(weightedMetricStars).toFixed(1));
    const domainTargetStars = Number(weightedAverage(weightedTargetStars).toFixed(1));
    const domainBenchmarkStars =
      weightedBenchmarkStars.length > 0
        ? Number(weightedAverage(weightedBenchmarkStars).toFixed(1))
        : undefined;
    const score = Math.round(domainCurrentStars * 20);
    const achievedDollars = domain.metrics.reduce((sum, metric) => sum + (metric.achievedDollars ?? 0), 0);
    const potentialDollars = domain.metrics.reduce((sum, metric) => sum + (metric.potentialDollars ?? 0), 0);
    const blockedDollars = domain.metrics.reduce((sum, metric) => sum + (metric.blockedDollars ?? 0), 0);
    const metricsOnTarget = domain.metrics.filter((metric) => metric.currentStars >= metric.targetStars).length;

    return {
      ...domain,
      score,
      status: domainStatus(domainCurrentStars),
      trendDirection: domainCurrentStars >= domainTargetStars ? "down" : "up",
      trendPercent: Math.max(1, Math.round(seededRange(contract.id, `${domain.key}-trend`, 1, 6))),
      currentStars: domainCurrentStars,
      targetStars: domainTargetStars,
      benchmarkStars: domainBenchmarkStars,
      achievedDollars,
      potentialDollars,
      blockedDollars: blockedDollars > 0 ? blockedDollars : undefined,
      currentlyAchievedSummary: `${metricsOnTarget}/${domain.metrics.length} metrics currently on target`,
      calculationNotes: [
        "Domain values reflect the configured metric subset for this contract.",
        "Domain dollars are sums of metric-level synthetic estimates.",
      ],
      achievedDollarComponents: domain.metrics.map((metric) => ({
        label: metric.label,
        value: metric.achievedDollars ?? 0,
      })),
      potentialDollarComponents: domain.metrics.map((metric) => ({
        label: metric.label,
        value: metric.potentialDollars ?? 0,
      })),
      starCalculationExplanation:
        "Current/target/benchmark stars represent the average of metric-level star values within this domain.",
    };
  });
}

function statusFromOverallScore(overallScore: number): Contract["status"] {
  if (overallScore >= 4) return "On Track";
  if (overallScore >= 3.5) return "At Risk";
  return "Off Track";
}

function headlineFromScore(overallScore: number): string {
  if (overallScore >= 4.2) {
    return "Agreement is tracking favorably with opportunities to further expand quality-linked upside.";
  }
  if (overallScore >= 3.7) {
    return "Agreement is in watch range; targeted domain improvements are needed to secure year-end performance.";
  }
  return "Agreement performance is at risk; urgent cross-domain intervention is needed to stabilize outcomes.";
}

export function buildContractScorecard(contract: Contract): ContractScorecard {
  const domains = buildDomains(contract);
  const allMetrics = domains.flatMap((domain) => domain.metrics);
  const overallStars = Number(
    weightedAverage(
      allMetrics.map((metric) => ({ value: metric.currentStars, weight: Math.max(1, Math.round(metric.weight ?? 1)) }))
    ).toFixed(1)
  );
  const overallScore = overallStars;
  const achievedDollars = domains.reduce((sum, domain) => sum + domain.achievedDollars, 0);
  const potentialDollars = domains.reduce((sum, domain) => sum + domain.potentialDollars, 0);
  const blockedDollars = domains.reduce((sum, domain) => sum + (domain.blockedDollars ?? 0), 0);

  return {
    contractId: contract.id,
    contractName: contract.name,
    payor: contract.payor,
    asOfDate: "Mar 2026",
    overallScore,
    overallStars,
    status: statusFromOverallScore(overallScore),
    headline: headlineFromScore(overallScore),
    domains,
    achievedDollars,
    potentialDollars,
    blockedDollars: blockedDollars > 0 ? blockedDollars : undefined,
  };
}

export function getContractScorecardForContract(contractId: string) {
  const cached = contractScorecardCache.get(contractId);
  if (cached) return cached;

  const contract = contractById.get(contractId);
  if (!contract) return undefined;
  const scorecard = buildContractScorecard(contract);
  contractScorecardCache.set(contractId, scorecard);
  return scorecard;
}

function domainStatusFromScore(score: number): ScorecardMetricStatus {
  if (score >= 4) return "on_track";
  if (score >= 3.5) return "watch";
  return "at_risk";
}

function trendDirectionForMetric(
  currentValue: number,
  targetValue: number,
  unit: AgreementMetricUnit
): "up" | "down" {
  const lowerIsBetter = unit === "rate_per_1000" || unit === "currency_pmpm" || unit === "days";
  if (lowerIsBetter) return currentValue <= targetValue ? "down" : "up";
  return currentValue >= targetValue ? "down" : "up";
}

function buildAgreementDomains(contracts: Contract[]): ScorecardDomain[] {
  if (!contracts.length) return [];

  const contractScorecards = contracts.map((contract) => ({
    contract,
    scorecard: buildContractScorecard(contract),
  }));

  const domainKeys = contractScorecards[0].scorecard.domains.map((domain) => domain.key);

  return domainKeys.map((domainKey) => {
    const sourceDomains = contractScorecards
      .map(({ contract, scorecard }) => ({
        contract,
        domain: scorecard.domains.find((item) => item.key === domainKey),
      }))
      .filter((item): item is { contract: Contract; domain: ScorecardDomain } => Boolean(item.domain));

    const firstDomain = sourceDomains[0].domain;
    const weightedScore = weightedAverage(
      sourceDomains.map((item) => ({ value: item.domain.currentStars, weight: item.contract.attributedLives }))
    );

    const metricIds = Array.from(
      new Set(sourceDomains.flatMap((item) => item.domain.metrics.map((metric) => metric.id)))
    );
    const metrics: ScorecardMetric[] = metricIds.map((metricId) => {
      const matching = sourceDomains
        .map((item) => ({
          contract: item.contract,
          metric: item.domain.metrics.find((metric) => metric.id === metricId),
        }))
        .filter((item): item is { contract: Contract; metric: ScorecardMetric } => Boolean(item.metric));

      const metricTemplate = matching[0].metric;
      const currentValue = weightedAverage(
        matching.map((item) => ({ value: item.metric.currentValue, weight: item.contract.attributedLives }))
      );
      const targetValue = weightedAverage(
        matching.map((item) => ({ value: item.metric.targetValue, weight: item.contract.attributedLives }))
      );
      const benchmarkValue = metricTemplate.benchmarkValue
        ? weightedAverage(
            matching
              .filter((item) => item.metric.benchmarkValue !== undefined)
              .map((item) => ({ value: item.metric.benchmarkValue as number, weight: item.contract.attributedLives }))
          )
        : undefined;

      const status = metricStatus(
        currentValue,
        targetValue,
        !(metricTemplate.unit === "rate_per_1000" || metricTemplate.unit === "currency_pmpm" || metricTemplate.unit === "days")
      );

      return {
        ...metricTemplate,
        currentValue: Number(currentValue.toFixed(1)),
        targetValue: Number(targetValue.toFixed(1)),
        benchmarkValue: benchmarkValue !== undefined ? Number(benchmarkValue.toFixed(1)) : undefined,
        trendDirection: trendDirectionForMetric(currentValue, targetValue, metricTemplate.unit),
        trendPercent: Math.max(1, Math.round(weightedAverage(matching.map((item) => ({ value: item.metric.trendPercent, weight: item.contract.attributedLives }))))),
        status,
        currentStars: Number(
          weightedAverage(matching.map((item) => ({ value: item.metric.currentStars, weight: item.contract.attributedLives }))).toFixed(1)
        ),
        targetStars: Number(
          weightedAverage(matching.map((item) => ({ value: item.metric.targetStars, weight: item.contract.attributedLives }))).toFixed(1)
        ),
        benchmarkStars: metricTemplate.benchmarkStars !== undefined
          ? Number(
              weightedAverage(
                matching
                  .filter((item) => item.metric.benchmarkStars !== undefined)
                  .map((item) => ({ value: item.metric.benchmarkStars as number, weight: item.contract.attributedLives }))
              ).toFixed(1)
            )
          : undefined,
        currentlyAchievedLabel: formatMetricValue(currentValue, metricTemplate.unit),
        achievedDollars: Math.round(matching.reduce((sum, item) => sum + (item.metric.achievedDollars ?? 0), 0)),
        potentialDollars: Math.round(matching.reduce((sum, item) => sum + (item.metric.potentialDollars ?? 0), 0)),
        blockedDollars: Math.round(matching.reduce((sum, item) => sum + (item.metric.blockedDollars ?? 0), 0)),
        populationCount: matching.reduce((sum, item) => sum + (item.metric.populationCount ?? 0), 0),
        populationLabel: metricTemplate.populationLabel,
        calculationNotes: metricTemplate.calculationNotes,
        achievedDollarComponents: matching.map((item) => ({
          label: item.contract.name,
          value: item.metric.achievedDollars ?? 0,
        })),
        potentialDollarComponents: matching.map((item) => ({
          label: item.contract.name,
          value: item.metric.potentialDollars ?? 0,
        })),
      };
    });

    const topIssue = sourceDomains
      .map((item) => ({
        contractName: item.contract.name,
        domainScore: item.domain.score,
      }))
      .sort((a, b) => a.domainScore - b.domainScore)[0];

    const currentStars = Number(weightedScore.toFixed(1));
    const score = Math.round(currentStars * 20);
    const achievedDollars = Math.round(sourceDomains.reduce((sum, item) => sum + item.domain.achievedDollars, 0));
    const potentialDollars = Math.round(sourceDomains.reduce((sum, item) => sum + item.domain.potentialDollars, 0));
    const blockedDollars = Math.round(sourceDomains.reduce((sum, item) => sum + (item.domain.blockedDollars ?? 0), 0));

    const utilizationSpreadInsight = (() => {
      if (domainKey !== "utilization_efficiency") return undefined;

      const edValues = sourceDomains
        .flatMap((item) => item.domain.metrics)
        .filter((metric) => metric.id === "ed-visits")
        .map((metric) => metric.currentValue);

      const readmitValues = sourceDomains
        .flatMap((item) => item.domain.metrics)
        .filter((metric) => metric.id === "readmit-30d")
        .map((metric) => metric.currentValue);

      if (!edValues.length || !readmitValues.length) return undefined;

      const edMin = Math.min(...edValues);
      const edMax = Math.max(...edValues);
      const readmitMin = Math.min(...readmitValues);
      const readmitMax = Math.max(...readmitValues);

      return `Utilization performance varies across contracts in this agreement (ED ${edMin.toFixed(0)}–${edMax.toFixed(0)} per 1,000; readmissions ${readmitMin.toFixed(1)}–${readmitMax.toFixed(1)}%). Domain structure is consistent, but outcomes differ by contract.`;
    })();

    return {
      key: firstDomain.key,
      label: firstDomain.label,
      description: firstDomain.description,
      score,
      status: domainStatusFromScore(currentStars),
      trendDirection: currentStars >= 4 ? "down" : "up",
      trendPercent: Math.max(1, Math.round(weightedAverage(sourceDomains.map((item) => ({ value: item.domain.trendPercent, weight: item.contract.attributedLives }))))),
      executiveInsight:
        utilizationSpreadInsight ??
        (topIssue && topIssue.domainScore < 72
          ? `${topIssue.contractName} is the largest drag on this agreement domain and should be prioritized for intervention.`
          : `Domain is generally stable across contracts with selective opportunities to improve consistency and target attainment.`),
      metrics,
      currentStars: Number(
        weightedAverage(sourceDomains.map((item) => ({ value: item.domain.currentStars, weight: item.contract.attributedLives }))).toFixed(1)
      ),
      targetStars: Number(
        weightedAverage(sourceDomains.map((item) => ({ value: item.domain.targetStars, weight: item.contract.attributedLives }))).toFixed(1)
      ),
      benchmarkStars: (() => {
        const benchmarkDomains = sourceDomains.filter((item) => item.domain.benchmarkStars !== undefined);
        if (!benchmarkDomains.length) return undefined;
        return Number(
          weightedAverage(
            benchmarkDomains.map((item) => ({ value: item.domain.benchmarkStars as number, weight: item.contract.attributedLives }))
          ).toFixed(1)
        );
      })(),
      achievedDollars,
      potentialDollars,
      blockedDollars: blockedDollars > 0 ? blockedDollars : undefined,
      currentlyAchievedSummary: `${metrics.filter((metric) => metric.status === "on_track").length}/${metrics.length} metrics currently on target`,
      calculationNotes: [
        "Agreement domain values are weighted by attributed lives across included contracts.",
        "Displayed dollars reflect sum of child contract domain estimates.",
      ],
      achievedDollarComponents: sourceDomains.map((item) => ({
        label: item.contract.name,
        value: item.domain.achievedDollars,
      })),
      potentialDollarComponents: sourceDomains.map((item) => ({
        label: item.contract.name,
        value: item.domain.potentialDollars,
      })),
      starCalculationExplanation:
        "Current/target/benchmark stars are lives-weighted domain averages across contracts in this agreement.",
    };
  });
}

function buildAgreementStatus(overallScore: number): Contract["status"] {
  if (overallScore >= 4) return "On Track";
  if (overallScore >= 3.5) return "At Risk";
  return "Off Track";
}

function buildAgreementHeadline(overallScore: number, qualityRollup: number): string {
  if (overallScore >= 4.2 && qualityRollup >= 80) {
    return "Agreement-level quality and domain performance are tracking favorably against expected targets.";
  }
  if (overallScore >= 3.7) {
    return "Agreement is in a watch range; quality lift in lower-performing contracts is needed to secure year-end goals.";
  }
  return "Agreement performance is at risk; quality and utilization variation across contracts is materially affecting outcomes.";
}

export function buildAgreementScorecard(agreement: ContractAgreement): AgreementScorecard {
  const contracts = agreement.contracts;
  const totalAttributedLives = contracts.reduce((sum, contract) => sum + contract.attributedLives, 0);
  const qualityRollup = weightedAverage(
    contracts.map((contract) => ({ value: contract.qualityScore, weight: contract.attributedLives }))
  );

  const domains = buildAgreementDomains(contracts);
  const allMetrics = domains.flatMap((domain) => domain.metrics);
  const overallStars = Number(
    weightedAverage(allMetrics.map((metric) => ({ value: metric.currentStars, weight: Math.max(1, Math.round(metric.weight ?? 1)) }))).toFixed(1)
  );
  const overallScore = overallStars;
  const achievedDollars = domains.reduce((sum, domain) => sum + domain.achievedDollars, 0);
  const potentialDollars = domains.reduce((sum, domain) => sum + domain.potentialDollars, 0);
  const blockedDollars = domains.reduce((sum, domain) => sum + (domain.blockedDollars ?? 0), 0);

  const qualityNumerator = contracts.reduce(
    (sum, contract) => sum + contract.qualityScore * contract.attributedLives,
    0
  );

  const contributors = contracts
    .map((contract) => {
      const qualityContribution = contract.qualityScore * contract.attributedLives;
      return {
        contractId: contract.id,
        contractName: contract.name,
        contractStatus: contract.status,
        attributedLives: contract.attributedLives,
        qualityScore: contract.qualityScore,
        livesSharePercent:
          totalAttributedLives > 0 ? (contract.attributedLives / totalAttributedLives) * 100 : 0,
        qualityContributionPercent:
          qualityNumerator > 0 ? (qualityContribution / qualityNumerator) * 100 : 0,
      };
    })
    .sort((a, b) => b.attributedLives - a.attributedLives);

  return {
    agreementId: agreement.id,
    agreementName: agreement.name,
    payors: agreement.payors,
    asOfDate: "Mar 2026",
    overallScore,
    overallStars,
    status: buildAgreementStatus(overallScore),
    headline: buildAgreementHeadline(overallScore, qualityRollup),
    totalAttributedLives,
    contractsCount: contracts.length,
    qualityRollup: Number(qualityRollup.toFixed(1)),
    domains,
    contributors,
    achievedDollars,
    potentialDollars,
    blockedDollars: blockedDollars > 0 ? blockedDollars : undefined,
  };
}

export function getAgreementScorecardForAgreement(agreementId: string) {
  const cached = agreementScorecardCache.get(agreementId);
  if (cached) return cached;

  const agreement = mockContractAgreements.find((item) => item.id === agreementId);
  if (!agreement) return undefined;
  const scorecard = buildAgreementScorecard(agreement);
  agreementScorecardCache.set(agreementId, scorecard);
  return scorecard;
}
