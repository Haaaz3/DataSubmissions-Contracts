import type { Contract, ContractStatus } from "@/types/contract";
import { calculateEstimatedSettlement, ContractSettlementEstimate } from "@/lib/contracts/settlement";

export interface ContractScenarioOverrides {
  currentPmpm: number;
  qualityScore: number;
  edVisitsPer1000: number;
  attributedLives: number;
  benchmarkPmpm: number;
  sharedSavingsRate: number;
  sharedRiskRate: number;
  qualityGate: number;
}

export interface ContractScenarioComparison {
  baseline: ContractSettlementEstimate;
  scenario: ContractSettlementEstimate;
  baselineOperationalStatus: ContractStatus;
  scenarioOperationalStatus: ContractStatus;
  scenarioContract: Contract;
  deltaSettlement: number;
  deltaGrossDeltaAmount: number;
  deltaPmpm: number;
  deltaQuality: number;
  deltaEdVisits: number;
  driverSteps: ScenarioDriverStep[];
}

export interface ScenarioDriverStep {
  id: string;
  label: string;
  value: number;
  deltaFromPrevious: number;
}

export function deriveOperationalStatus(contract: Pick<Contract, "currentPmpm" | "targetPmpm" | "qualityScore" | "edVisitsPer1000">): ContractStatus {
  const pmpmVariancePct = ((contract.currentPmpm - contract.targetPmpm) / contract.targetPmpm) * 100;
  if (pmpmVariancePct <= 0 && contract.qualityScore >= 75 && contract.edVisitsPer1000 <= 300) return "On Track";
  if (pmpmVariancePct <= 5 && contract.qualityScore >= 65 && contract.edVisitsPer1000 <= 360) return "At Risk";
  return "Off Track";
}

export function calculateContractScenarioComparison(
  contract: Contract,
  overrides: ContractScenarioOverrides
): ContractScenarioComparison {
  const baseline = calculateEstimatedSettlement(contract);

  const buildScenarioContract = (partial: Partial<ContractScenarioOverrides>): Contract => {
    const merged = { ...overrides, ...partial };
    return {
      ...contract,
      currentPmpm: merged.currentPmpm,
      qualityScore: merged.qualityScore,
      edVisitsPer1000: merged.edVisitsPer1000,
      attributedLives: Math.max(1, Math.round(merged.attributedLives)),
      vbcTerms: {
        ...(contract.vbcTerms ?? baseline.terms),
        benchmarkPmpm: merged.benchmarkPmpm,
        sharedSavingsRate: merged.sharedSavingsRate,
        sharedRiskRate: merged.sharedRiskRate,
        qualityGate: merged.qualityGate,
      },
    };
  };

  const scenarioContract = buildScenarioContract({});

  const scenario = calculateEstimatedSettlement(scenarioContract);

  const pmpmScenario = calculateEstimatedSettlement(buildScenarioContract({
    qualityScore: contract.qualityScore,
    edVisitsPer1000: contract.edVisitsPer1000,
    attributedLives: contract.attributedLives,
    benchmarkPmpm: (contract.vbcTerms ?? baseline.terms).benchmarkPmpm,
    sharedSavingsRate: (contract.vbcTerms ?? baseline.terms).sharedSavingsRate,
    sharedRiskRate: (contract.vbcTerms ?? baseline.terms).sharedRiskRate,
    qualityGate: (contract.vbcTerms ?? baseline.terms).qualityGate,
  }));

  const qualityScenario = calculateEstimatedSettlement(buildScenarioContract({
    edVisitsPer1000: contract.edVisitsPer1000,
    attributedLives: contract.attributedLives,
    benchmarkPmpm: (contract.vbcTerms ?? baseline.terms).benchmarkPmpm,
    sharedSavingsRate: (contract.vbcTerms ?? baseline.terms).sharedSavingsRate,
    sharedRiskRate: (contract.vbcTerms ?? baseline.terms).sharedRiskRate,
    qualityGate: (contract.vbcTerms ?? baseline.terms).qualityGate,
  }));

  const livesScenario = calculateEstimatedSettlement(buildScenarioContract({
    benchmarkPmpm: (contract.vbcTerms ?? baseline.terms).benchmarkPmpm,
    sharedSavingsRate: (contract.vbcTerms ?? baseline.terms).sharedSavingsRate,
    sharedRiskRate: (contract.vbcTerms ?? baseline.terms).sharedRiskRate,
    qualityGate: (contract.vbcTerms ?? baseline.terms).qualityGate,
  }));

  const termsScenario = scenario;

  const driverSteps: ScenarioDriverStep[] = [
    {
      id: "baseline",
      label: "Baseline settlement",
      value: baseline.estimatedAmount,
      deltaFromPrevious: 0,
    },
    {
      id: "pmpm",
      label: "PMPM change impact",
      value: pmpmScenario.estimatedAmount,
      deltaFromPrevious: pmpmScenario.estimatedAmount - baseline.estimatedAmount,
    },
    {
      id: "quality",
      label: "Quality score impact",
      value: qualityScenario.estimatedAmount,
      deltaFromPrevious: qualityScenario.estimatedAmount - pmpmScenario.estimatedAmount,
    },
    {
      id: "lives",
      label: "Attributed lives impact",
      value: livesScenario.estimatedAmount,
      deltaFromPrevious: livesScenario.estimatedAmount - qualityScenario.estimatedAmount,
    },
    {
      id: "terms",
      label: "Contract terms impact",
      value: termsScenario.estimatedAmount,
      deltaFromPrevious: termsScenario.estimatedAmount - livesScenario.estimatedAmount,
    },
  ];

  return {
    baseline,
    scenario,
    baselineOperationalStatus: deriveOperationalStatus(contract),
    scenarioOperationalStatus: deriveOperationalStatus(scenarioContract),
    scenarioContract,
    deltaSettlement: scenario.estimatedAmount - baseline.estimatedAmount,
    deltaGrossDeltaAmount: scenario.grossDeltaAmount - baseline.grossDeltaAmount,
    deltaPmpm: scenarioContract.currentPmpm - contract.currentPmpm,
    deltaQuality: scenarioContract.qualityScore - contract.qualityScore,
    deltaEdVisits: scenarioContract.edVisitsPer1000 - contract.edVisitsPer1000,
    driverSteps,
  };
}
