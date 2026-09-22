import { Contract } from "@/types/contract";
import {
  ContractQualityMeasure,
  MeasurePerformance,
  QualityMeasure,
} from "@/types/quality";
import { getTopSuggestedActionForMeasure } from "@/data/synthetic/measureActionInsights";
import { getMeasureActionInsightById } from "@/data/synthetic/measureActionInsights";

// ---------------------------------------------------------------------------
// Quality measures master list
// ---------------------------------------------------------------------------

export const qualityMeasures: QualityMeasure[] = [
  {
    id: "a1c-control",
    name: "Diabetes A1c Control (<9%)",
    shortName: "A1c Control",
    domain: "Chronic",
    description:
      "Percent of diabetic members with most recent A1c < 9.0. Closely tied to avoidable admissions and complications.",
    targetPercent: 75,
    benchmarkPercent: 72,
    numeratorLabel: "Members with A1c < 9%",
    denominatorLabel: "Diabetic members",
  },
  {
    id: "bp-control",
    name: "Controlling High Blood Pressure",
    shortName: "BP Control",
    domain: "Chronic",
    description:
      "Percent of hypertensive members with blood pressure controlled below 140/90 during the measurement year.",
    targetPercent: 72,
    benchmarkPercent: 69,
    numeratorLabel: "Members with BP < 140/90",
    denominatorLabel: "Members with hypertension",
  },
  {
    id: "colorectal-screen",
    name: "Colorectal Cancer Screening",
    shortName: "Colorectal Screening",
    domain: "Preventive",
    description:
      "Percent of eligible members ages 50–75 who completed colorectal cancer screening.",
    targetPercent: 70,
    benchmarkPercent: 67,
    numeratorLabel: "Members screened",
    denominatorLabel: "Eligible members",
  },
  {
    id: "breast-screen",
    name: "Breast Cancer Screening",
    shortName: "Breast Screening",
    domain: "Preventive",
    description:
      "Percent of women ages 50–74 who completed a mammogram in the measurement window.",
    targetPercent: 72,
    benchmarkPercent: 70,
    numeratorLabel: "Members screened",
    denominatorLabel: "Eligible women",
  },
  {
    id: "statin-adherence",
    name: "Statin Adherence",
    shortName: "Statin Adherence",
    domain: "Medication",
    description:
      "Medication adherence for statin therapy among members with cardiovascular disease or diabetes.",
    targetPercent: 82,
    benchmarkPercent: 79,
    numeratorLabel: "Members adherent",
    denominatorLabel: "Members on statins",
  },
  {
    id: "flu-shot",
    name: "Annual Flu Vaccination",
    shortName: "Flu Vaccine",
    domain: "Patient Safety",
    description:
      "Percent of members receiving the seasonal influenza vaccine.",
    targetPercent: 80,
    benchmarkPercent: 77,
    numeratorLabel: "Members vaccinated",
    denominatorLabel: "Eligible members",
  },
  {
    id: "eye-exam",
    name: "Diabetic Retinal Eye Exam",
    shortName: "Retinal Eye Exam",
    domain: "Preventive",
    description:
      "Percent of diabetic members receiving annual retinal exam for early vision-risk detection.",
    targetPercent: 74,
    benchmarkPercent: 70,
    numeratorLabel: "Members with annual retinal exam",
    denominatorLabel: "Diabetic members",
  },
  {
    id: "kidney-health",
    name: "Kidney Health Evaluation for Diabetes",
    shortName: "Kidney Health Eval",
    domain: "Chronic",
    description:
      "Annual eGFR and uACR testing among diabetic members to support CKD prevention.",
    targetPercent: 69,
    benchmarkPercent: 64,
    numeratorLabel: "Members with complete kidney evaluation",
    denominatorLabel: "Diabetic members",
  },
  {
    id: "med-recon",
    name: "Medication Reconciliation Post Discharge",
    shortName: "Post-Discharge Med Rec",
    domain: "Patient Safety",
    description:
      "Medication reconciliation within 30 days following acute inpatient discharge.",
    targetPercent: 83,
    benchmarkPercent: 79,
    numeratorLabel: "Members with timely med rec",
    denominatorLabel: "Recent discharges",
  },
  {
    id: "followup-hosp",
    name: "Follow-up After Hospitalization",
    shortName: "Post-Hospital Follow-up",
    domain: "Utilization",
    description:
      "Follow-up visits completed after acute hospitalization to reduce avoidable readmissions.",
    targetPercent: 80,
    benchmarkPercent: 76,
    numeratorLabel: "Members with completed follow-up",
    denominatorLabel: "Hospitalized members",
  },
  {
    id: "depression-remission",
    name: "Depression Remission at 12 Months",
    shortName: "Depression Remission",
    domain: "Chronic",
    description:
      "Members with baseline depression who achieve remission in 12 months.",
    targetPercent: 45,
    benchmarkPercent: 40,
    numeratorLabel: "Members in remission",
    denominatorLabel: "Members with diagnosed depression",
  },
  {
    id: "tobacco-screen",
    name: "Tobacco Use Screening and Cessation",
    shortName: "Tobacco Cessation",
    domain: "Preventive",
    description:
      "Screening and intervention for tobacco use to improve preventive outcomes.",
    targetPercent: 86,
    benchmarkPercent: 82,
    numeratorLabel: "Members screened/intervened",
    denominatorLabel: "Adult members",
  },
  {
    id: "osteoporosis-mgmt",
    name: "Osteoporosis Management Post Fracture",
    shortName: "Post-Fracture Osteoporosis",
    domain: "Patient Safety",
    description:
      "Management interventions after fragility fracture for women 67–85.",
    targetPercent: 52,
    benchmarkPercent: 48,
    numeratorLabel: "Members receiving osteoporosis care",
    denominatorLabel: "Eligible fracture cohort",
  },
  {
    id: "copd-controller",
    name: "COPD Controller Medication Adherence",
    shortName: "COPD Controller Adherence",
    domain: "Medication",
    description:
      "Adherence to prescribed controller therapy among COPD members.",
    targetPercent: 74,
    benchmarkPercent: 70,
    numeratorLabel: "Members adherent to controller meds",
    denominatorLabel: "Members with COPD controller Rx",
  },
  {
    id: "ed-avoidance",
    name: "Avoidable Emergency Department Utilization",
    shortName: "Avoidable ED Utilization",
    domain: "Utilization",
    description:
      "Lower avoidable ED utilization through proactive outpatient and navigation workflows.",
    targetPercent: 78,
    benchmarkPercent: 74,
    numeratorLabel: "Members avoiding low-acuity ED",
    denominatorLabel: "Attributed members",
  },
];

// ---------------------------------------------------------------------------
// Portfolio-level performance (aggregate)
// ---------------------------------------------------------------------------

export const portfolioMeasurePerformance: MeasurePerformance[] = [
  {
    measureId: "a1c-control",
    ratePercent: 68,
    eligibleMembers: 18540,
    gapMembers: 5920,
    trendDirection: "down",
    trendPercent: 3,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "bp-control",
    ratePercent: 70,
    eligibleMembers: 27620,
    gapMembers: 8280,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "colorectal-screen",
    ratePercent: 61,
    eligibleMembers: 21480,
    gapMembers: 8370,
    trendDirection: "down",
    trendPercent: 4,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "breast-screen",
    ratePercent: 67,
    eligibleMembers: 16210,
    gapMembers: 5360,
    trendDirection: "stable",
    trendPercent: 0,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "statin-adherence",
    ratePercent: 76,
    eligibleMembers: 12190,
    gapMembers: 2920,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "flu-shot",
    ratePercent: 73,
    eligibleMembers: 28400,
    gapMembers: 7680,
    trendDirection: "down",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "eye-exam",
    ratePercent: 66,
    eligibleMembers: 13980,
    gapMembers: 4753,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "kidney-health",
    ratePercent: 59,
    eligibleMembers: 12110,
    gapMembers: 4965,
    trendDirection: "down",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "med-recon",
    ratePercent: 79,
    eligibleMembers: 6940,
    gapMembers: 1457,
    trendDirection: "stable",
    trendPercent: 0,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "followup-hosp",
    ratePercent: 72,
    eligibleMembers: 8420,
    gapMembers: 2358,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "depression-remission",
    ratePercent: 38,
    eligibleMembers: 9150,
    gapMembers: 5673,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "tobacco-screen",
    ratePercent: 82,
    eligibleMembers: 22320,
    gapMembers: 4018,
    trendDirection: "stable",
    trendPercent: 0,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "osteoporosis-mgmt",
    ratePercent: 46,
    eligibleMembers: 5080,
    gapMembers: 2743,
    trendDirection: "down",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "copd-controller",
    ratePercent: 68,
    eligibleMembers: 6640,
    gapMembers: 2125,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    measureId: "ed-avoidance",
    ratePercent: 64,
    eligibleMembers: 24860,
    gapMembers: 8950,
    trendDirection: "down",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
];

const qualityMeasureById = new Map(qualityMeasures.map((measure) => [measure.id, measure] as const));

// ---------------------------------------------------------------------------
// Contract-level measure performance (subset per contract)
// ---------------------------------------------------------------------------

const contractMeasurePerformance: MeasurePerformance[] = [
  // MSSP contracts
  {
    contractId: "mssp-001",
    measureId: "a1c-control",
    ratePercent: 62,
    eligibleMembers: 2140,
    gapMembers: 815,
    trendDirection: "down",
    trendPercent: 3,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-001",
    measureId: "colorectal-screen",
    ratePercent: 54,
    eligibleMembers: 1960,
    gapMembers: 902,
    trendDirection: "down",
    trendPercent: 5,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-001",
    measureId: "bp-control",
    ratePercent: 69,
    eligibleMembers: 2980,
    gapMembers: 923,
    trendDirection: "stable",
    trendPercent: 0,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-001",
    measureId: "statin-adherence",
    ratePercent: 71,
    eligibleMembers: 1120,
    gapMembers: 325,
    trendDirection: "down",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-002",
    measureId: "a1c-control",
    ratePercent: 71,
    eligibleMembers: 1680,
    gapMembers: 486,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-002",
    measureId: "colorectal-screen",
    ratePercent: 58,
    eligibleMembers: 1760,
    gapMembers: 739,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-002",
    measureId: "flu-shot",
    ratePercent: 78,
    eligibleMembers: 2640,
    gapMembers: 581,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-003",
    measureId: "a1c-control",
    ratePercent: 55,
    eligibleMembers: 2360,
    gapMembers: 1062,
    trendDirection: "down",
    trendPercent: 4,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-003",
    measureId: "bp-control",
    ratePercent: 61,
    eligibleMembers: 3320,
    gapMembers: 1295,
    trendDirection: "down",
    trendPercent: 3,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-003",
    measureId: "colorectal-screen",
    ratePercent: 48,
    eligibleMembers: 2080,
    gapMembers: 1082,
    trendDirection: "down",
    trendPercent: 6,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "mssp-003",
    measureId: "flu-shot",
    ratePercent: 64,
    eligibleMembers: 3050,
    gapMembers: 1098,
    trendDirection: "down",
    trendPercent: 3,
    lastUpdated: "Feb 2025",
  },
  // Medicare Advantage contracts
  {
    contractId: "ma-001",
    measureId: "a1c-control",
    ratePercent: 74,
    eligibleMembers: 2460,
    gapMembers: 640,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-001",
    measureId: "statin-adherence",
    ratePercent: 84,
    eligibleMembers: 1320,
    gapMembers: 211,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-001",
    measureId: "breast-screen",
    ratePercent: 76,
    eligibleMembers: 1480,
    gapMembers: 355,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-001",
    measureId: "flu-shot",
    ratePercent: 82,
    eligibleMembers: 3560,
    gapMembers: 640,
    trendDirection: "stable",
    trendPercent: 0,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-002",
    measureId: "statin-adherence",
    ratePercent: 74,
    eligibleMembers: 1790,
    gapMembers: 466,
    trendDirection: "down",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-002",
    measureId: "a1c-control",
    ratePercent: 68,
    eligibleMembers: 2840,
    gapMembers: 909,
    trendDirection: "down",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-002",
    measureId: "breast-screen",
    ratePercent: 71,
    eligibleMembers: 1810,
    gapMembers: 525,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-002",
    measureId: "flu-shot",
    ratePercent: 76,
    eligibleMembers: 4120,
    gapMembers: 989,
    trendDirection: "stable",
    trendPercent: 0,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-003",
    measureId: "breast-screen",
    ratePercent: 80,
    eligibleMembers: 1620,
    gapMembers: 324,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-003",
    measureId: "statin-adherence",
    ratePercent: 88,
    eligibleMembers: 1410,
    gapMembers: 169,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-003",
    measureId: "bp-control",
    ratePercent: 76,
    eligibleMembers: 2860,
    gapMembers: 686,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-004",
    measureId: "a1c-control",
    ratePercent: 52,
    eligibleMembers: 3320,
    gapMembers: 1594,
    trendDirection: "down",
    trendPercent: 5,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-004",
    measureId: "bp-control",
    ratePercent: 60,
    eligibleMembers: 4020,
    gapMembers: 1608,
    trendDirection: "down",
    trendPercent: 4,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-004",
    measureId: "colorectal-screen",
    ratePercent: 45,
    eligibleMembers: 2860,
    gapMembers: 1573,
    trendDirection: "down",
    trendPercent: 6,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "ma-004",
    measureId: "statin-adherence",
    ratePercent: 61,
    eligibleMembers: 2080,
    gapMembers: 811,
    trendDirection: "down",
    trendPercent: 4,
    lastUpdated: "Feb 2025",
  },
  // Commercial contracts
  {
    contractId: "comm-001",
    measureId: "colorectal-screen",
    ratePercent: 38,
    eligibleMembers: 920,
    gapMembers: 571,
    trendDirection: "down",
    trendPercent: 4,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-001",
    measureId: "breast-screen",
    ratePercent: 55,
    eligibleMembers: 740,
    gapMembers: 333,
    trendDirection: "down",
    trendPercent: 3,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-001",
    measureId: "a1c-control",
    ratePercent: 61,
    eligibleMembers: 520,
    gapMembers: 203,
    trendDirection: "down",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-002",
    measureId: "colorectal-screen",
    ratePercent: 62,
    eligibleMembers: 780,
    gapMembers: 296,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-002",
    measureId: "breast-screen",
    ratePercent: 68,
    eligibleMembers: 690,
    gapMembers: 221,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-002",
    measureId: "statin-adherence",
    ratePercent: 78,
    eligibleMembers: 510,
    gapMembers: 112,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-003",
    measureId: "breast-screen",
    ratePercent: 74,
    eligibleMembers: 820,
    gapMembers: 213,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-003",
    measureId: "statin-adherence",
    ratePercent: 88,
    eligibleMembers: 660,
    gapMembers: 79,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-003",
    measureId: "flu-shot",
    ratePercent: 83,
    eligibleMembers: 1390,
    gapMembers: 236,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-004",
    measureId: "bp-control",
    ratePercent: 66,
    eligibleMembers: 1680,
    gapMembers: 571,
    trendDirection: "down",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-004",
    measureId: "colorectal-screen",
    ratePercent: 48,
    eligibleMembers: 1390,
    gapMembers: 723,
    trendDirection: "down",
    trendPercent: 3,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-004",
    measureId: "breast-screen",
    ratePercent: 60,
    eligibleMembers: 1120,
    gapMembers: 448,
    trendDirection: "down",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-005",
    measureId: "colorectal-screen",
    ratePercent: 61,
    eligibleMembers: 2080,
    gapMembers: 811,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-005",
    measureId: "bp-control",
    ratePercent: 72,
    eligibleMembers: 2380,
    gapMembers: 666,
    trendDirection: "up",
    trendPercent: 1,
    lastUpdated: "Feb 2025",
  },
  {
    contractId: "comm-005",
    measureId: "flu-shot",
    ratePercent: 77,
    eligibleMembers: 2860,
    gapMembers: 658,
    trendDirection: "up",
    trendPercent: 2,
    lastUpdated: "Feb 2025",
  },
];

const contractMeasurePerformanceByContractId = new Map<string, MeasurePerformance[]>();
for (const performance of contractMeasurePerformance) {
  const contractId = (performance as MeasurePerformance & { contractId?: string }).contractId;
  if (!contractId) continue;
  const current = contractMeasurePerformanceByContractId.get(contractId);
  if (current) current.push(performance);
  else contractMeasurePerformanceByContractId.set(contractId, [performance]);
}

const contractMeasuresCache = new Map<string, ContractQualityMeasure[]>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getMeasureById(id: string) {
  return qualityMeasureById.get(id);
}

export function getPortfolioMeasures(): ContractQualityMeasure[] {
  return portfolioMeasurePerformance
    .map((perf) => ({
      ...(getMeasureById(perf.measureId) as QualityMeasure),
      performance: perf,
    }))
    .filter((m) => m.id);
}

export function getMeasuresForContract(contractId: string): ContractQualityMeasure[] {
  const cached = contractMeasuresCache.get(contractId);
  if (cached) return cached;

  const measures = (contractMeasurePerformanceByContractId.get(contractId) ?? [])
    .map((perf) => {
      const measure = getMeasureById(perf.measureId);
      if (!measure) return null;
      return {
        ...(measure as QualityMeasure),
        performance: perf,
      };
    })
    .filter((item): item is ContractQualityMeasure => Boolean(item));

  contractMeasuresCache.set(contractId, measures);
  return measures;
}

export function getContractCoverage(contractId: string) {
  return (contractMeasurePerformanceByContractId.get(contractId) ?? []).length;
}

export function getPortfolioSummary() {
  const totalEligible = portfolioMeasurePerformance.reduce(
    (sum, perf) => sum + perf.eligibleMembers,
    0
  );
  const totalGaps = portfolioMeasurePerformance.reduce(
    (sum, perf) => sum + perf.gapMembers,
    0
  );
  const avgPerformance =
    portfolioMeasurePerformance.reduce((sum, perf) => sum + perf.ratePercent, 0) /
    portfolioMeasurePerformance.length;
  const belowTarget = portfolioMeasurePerformance.filter((perf) => {
    const measure = getMeasureById(perf.measureId);
    return measure ? perf.ratePercent < measure.targetPercent : false;
  }).length;

  return {
    totalEligible,
    totalGaps,
    avgPerformance: Math.round(avgPerformance),
    belowTarget,
  };
}

export function buildContractQualitySummary(contracts: Contract[]) {
  return contracts.map((contract) => {
    const measures = getMeasuresForContract(contract.id);
    const average = measures.length
      ? Math.round(measures.reduce((sum, m) => sum + m.performance.ratePercent, 0) / measures.length)
      : contract.qualityScore;
    const belowTarget = measures.filter((m) => m.performance.ratePercent < m.targetPercent).length;
    const totalEligible = measures.reduce((sum, m) => sum + m.performance.eligibleMembers, 0);
    const totalGaps = measures.reduce((sum, m) => sum + m.performance.gapMembers, 0);
    const estimatedFinancialImpact = Math.round(totalGaps * 235);

    return {
      contractId: contract.id,
      contractName: contract.name,
      contractType: contract.contractType,
      payor: contract.payor,
      average,
      belowTarget,
      measuresCount: measures.length,
      totalEligible,
      totalGaps,
      estimatedFinancialImpact,
    };
  });
}

const IMPACT_PER_PATIENT_BY_DOMAIN: Record<string, number> = {
  Chronic: 420,
  Preventive: 260,
  Medication: 310,
  Utilization: 260,
  "Patient Safety": 180,
};

export interface QualityOpportunity {
  id: string;
  measureName: string;
  currentPerformance: number;
  targetPerformance: number;
  gapMagnitude: number;
  patientsLeftToTarget: number;
  estimatedFinancialImpact: number;
  actionLabel: string;
  rationale: string;
  suggestedPrompt: string;
  hasInsight: boolean;
}

export function toFinancialBand(value: number) {
  if (value >= 450000) return "High";
  if (value >= 180000) return "Medium";
  return "Low";
}

export function getRankedQualityOpportunities(measures = getPortfolioMeasures()): QualityOpportunity[] {
  return measures
    .map((measure) => {
      const currentPerformance = measure.performance.ratePercent;
      const baseTarget = measure.targetPercent;
      const targetLift =
        currentPerformance < baseTarget - 8 ? 2 : currentPerformance < baseTarget - 4 ? 1 : 0;
      const targetPerformance = Math.min(95, baseTarget + targetLift);
      const patientsLeftToTarget = Math.max(
        0,
        Math.ceil(((targetPerformance - currentPerformance) / 100) * measure.performance.eligibleMembers)
      );

      const perPatientImpact = IMPACT_PER_PATIENT_BY_DOMAIN[measure.domain] ?? 240;
      const estimatedFinancialImpact = patientsLeftToTarget * perPatientImpact;
      const topSuggestedAction = getTopSuggestedActionForMeasure(measure.id);
      const hasInsight = Boolean(getMeasureActionInsightById(measure.id));

      return {
        id: measure.id,
        measureName: measure.name,
        currentPerformance,
        targetPerformance,
        gapMagnitude: targetPerformance - currentPerformance,
        patientsLeftToTarget,
        estimatedFinancialImpact,
        actionLabel: topSuggestedAction?.name ?? "Operational improvement action",
        rationale:
          topSuggestedAction?.recommendedAction ??
          "Route denominator members to the highest-performing closure workflow.",
        suggestedPrompt: `Improve ${measure.name} to receive +${Math.round(
          estimatedFinancialImpact / 1000
        )}k revenue.`,
        hasInsight,
      };
    })
    .sort((a, b) => b.estimatedFinancialImpact - a.estimatedFinancialImpact);
}

type OrganizationSeed = {
  id: string;
  name: string;
  type: "Clinic" | "Hospital Unit";
  region: string;
  contractIds: string[];
  attributedLives: number;
  unattributedRate: number;
  scoreAdjustment: number;
};

type ProviderSeed = {
  id: string;
  name: string;
  specialty: string;
  organizationId: string;
  contractIds: string[];
  panelSize: number;
  scoreAdjustment: number;
};

const ORGANIZATIONS: OrganizationSeed[] = [
  {
    id: "org-north-primary",
    name: "North Valley Primary Care",
    type: "Clinic",
    region: "North",
    contractIds: ["mssp-001", "ma-001", "comm-005"],
    attributedLives: 8600,
    unattributedRate: 0.11,
    scoreAdjustment: 3,
  },
  {
    id: "org-central-specialty",
    name: "Central Specialty Institute",
    type: "Hospital Unit",
    region: "Central",
    contractIds: ["ma-004", "mssp-003", "comm-004"],
    attributedLives: 7400,
    unattributedRate: 0.16,
    scoreAdjustment: -4,
  },
  {
    id: "org-lakeside-multi",
    name: "Lakeside Multi-Specialty",
    type: "Clinic",
    region: "West",
    contractIds: ["ma-002", "mssp-002", "comm-002"],
    attributedLives: 6900,
    unattributedRate: 0.09,
    scoreAdjustment: 1,
  },
  {
    id: "org-east-ambulatory",
    name: "Eastside Ambulatory Center",
    type: "Hospital Unit",
    region: "East",
    contractIds: ["ma-003", "comm-003", "mssp-001"],
    attributedLives: 6200,
    unattributedRate: 0.08,
    scoreAdjustment: 2,
  },
  {
    id: "org-south-community",
    name: "South Community Health Hub",
    type: "Clinic",
    region: "South",
    contractIds: ["comm-001", "comm-004", "mssp-003"],
    attributedLives: 5100,
    unattributedRate: 0.19,
    scoreAdjustment: -5,
  },
];

const PROVIDERS: ProviderSeed[] = [
  {
    id: "prov-ramirez",
    name: "Dr. Elena Ramirez",
    specialty: "Family Medicine",
    organizationId: "org-north-primary",
    contractIds: ["mssp-001", "ma-001"],
    panelSize: 2140,
    scoreAdjustment: 4,
  },
  {
    id: "prov-patel",
    name: "Dr. Nikhil Patel",
    specialty: "Internal Medicine",
    organizationId: "org-north-primary",
    contractIds: ["ma-001", "comm-005"],
    panelSize: 1880,
    scoreAdjustment: 3,
  },
  {
    id: "prov-young",
    name: "Dr. Grace Young",
    specialty: "Endocrinology",
    organizationId: "org-central-specialty",
    contractIds: ["ma-004", "mssp-003"],
    panelSize: 1430,
    scoreAdjustment: -2,
  },
  {
    id: "prov-morris",
    name: "Dr. Cameron Morris",
    specialty: "Cardiology",
    organizationId: "org-central-specialty",
    contractIds: ["ma-004", "comm-004"],
    panelSize: 1690,
    scoreAdjustment: -3,
  },
  {
    id: "prov-chen",
    name: "Dr. Sophia Chen",
    specialty: "Family Medicine",
    organizationId: "org-lakeside-multi",
    contractIds: ["mssp-002", "ma-002"],
    panelSize: 2050,
    scoreAdjustment: 2,
  },
  {
    id: "prov-johnson",
    name: "Dr. Malik Johnson",
    specialty: "Internal Medicine",
    organizationId: "org-lakeside-multi",
    contractIds: ["ma-002", "comm-002"],
    panelSize: 1920,
    scoreAdjustment: 1,
  },
  {
    id: "prov-diaz",
    name: "Dr. Lucia Diaz",
    specialty: "Geriatrics",
    organizationId: "org-east-ambulatory",
    contractIds: ["ma-003", "comm-003"],
    panelSize: 1580,
    scoreAdjustment: 3,
  },
  {
    id: "prov-clark",
    name: "Dr. Aaron Clark",
    specialty: "Family Medicine",
    organizationId: "org-east-ambulatory",
    contractIds: ["mssp-001", "comm-003"],
    panelSize: 1660,
    scoreAdjustment: 2,
  },
  {
    id: "prov-shah",
    name: "Dr. Rina Shah",
    specialty: "Family Medicine",
    organizationId: "org-south-community",
    contractIds: ["comm-001", "mssp-003"],
    panelSize: 1490,
    scoreAdjustment: -4,
  },
  {
    id: "prov-owens",
    name: "Dr. Caleb Owens",
    specialty: "Internal Medicine",
    organizationId: "org-south-community",
    contractIds: ["comm-004", "mssp-003"],
    panelSize: 1370,
    scoreAdjustment: -3,
  },
];

export interface QualityOrganizationRow {
  id: string;
  organizationName: string;
  type: string;
  region: string;
  providerCount: number;
  attributedLives: number;
  eligibleMembers: number;
  unattributedEligibleMembers: number;
  qualityScore: number;
  belowTargetMeasures: number;
  careGaps: number;
  estimatedFinancialImpact: number;
  topFocusMeasure: string;
}

export interface QualityProviderRow {
  id: string;
  providerName: string;
  specialty: string;
  organizationName: string;
  panelSize: number;
  eligibleMembers: number;
  qualityScore: number;
  belowTargetMeasures: number;
  careGaps: number;
  closureRate: number;
  estimatedFinancialImpact: number;
  topFocusMeasure: string;
}

function getScopeMeasures(contractId?: string, measureId?: string) {
  const scoped = contractId ? getMeasuresForContract(contractId) : getPortfolioMeasures();
  return measureId ? scoped.filter((m) => m.id === measureId) : scoped;
}

function getTopFocusMeasureName(measures: ContractQualityMeasure[]) {
  return (
    [...measures].sort((a, b) => b.performance.gapMembers - a.performance.gapMembers)[0]?.shortName ??
    "No measure"
  );
}

export function getOrganizationQualityRows({
  contractId,
  measureId,
}: {
  contractId?: string;
  measureId?: string;
} = {}): QualityOrganizationRow[] {
  const measures = getScopeMeasures(contractId, measureId);
  if (!measures.length) return [];

  const measureEligible = measures.reduce((sum, m) => sum + m.performance.eligibleMembers, 0);
  const measureGaps = measures.reduce((sum, m) => sum + m.performance.gapMembers, 0);
  const avgRate =
    measures.reduce((sum, m) => sum + m.performance.ratePercent, 0) / Math.max(1, measures.length);
  const belowTarget = measures.filter((m) => m.performance.ratePercent < m.targetPercent).length;

  const scopedOrgs = ORGANIZATIONS.filter((org) =>
    contractId ? org.contractIds.includes(contractId) : true
  );
  const totalLives = scopedOrgs.reduce((sum, org) => sum + org.attributedLives, 0);

  return scopedOrgs
    .map((org) => {
      const weight = org.attributedLives / Math.max(1, totalLives);
      const eligibleMembers = Math.round(measureEligible * weight);
      const unattributedEligibleMembers = Math.round(eligibleMembers * org.unattributedRate);
      const careGaps = Math.round(measureGaps * weight);
      const qualityScore = Math.max(0, Math.min(100, Math.round(avgRate + org.scoreAdjustment)));

      return {
        id: org.id,
        organizationName: org.name,
        type: org.type,
        region: org.region,
        providerCount: PROVIDERS.filter((provider) => provider.organizationId === org.id).length,
        attributedLives: org.attributedLives,
        eligibleMembers,
        unattributedEligibleMembers,
        qualityScore,
        belowTargetMeasures: belowTarget,
        careGaps,
        estimatedFinancialImpact: Math.round(careGaps * 230),
        topFocusMeasure: getTopFocusMeasureName(measures),
      };
    })
    .sort((a, b) => b.qualityScore - a.qualityScore || b.estimatedFinancialImpact - a.estimatedFinancialImpact);
}

export function getProviderQualityRows({
  contractId,
  measureId,
}: {
  contractId?: string;
  measureId?: string;
} = {}): QualityProviderRow[] {
  const measures = getScopeMeasures(contractId, measureId);
  if (!measures.length) return [];

  const measureEligible = measures.reduce((sum, m) => sum + m.performance.eligibleMembers, 0);
  const measureGaps = measures.reduce((sum, m) => sum + m.performance.gapMembers, 0);
  const avgRate =
    measures.reduce((sum, m) => sum + m.performance.ratePercent, 0) / Math.max(1, measures.length);
  const belowTarget = measures.filter((m) => m.performance.ratePercent < m.targetPercent).length;

  const scopedProviders = PROVIDERS.filter((provider) =>
    contractId ? provider.contractIds.includes(contractId) : true
  );
  const totalPanels = scopedProviders.reduce((sum, provider) => sum + provider.panelSize, 0);

  return scopedProviders
    .map((provider) => {
      const weight = provider.panelSize / Math.max(1, totalPanels);
      const eligibleMembers = Math.round(measureEligible * weight);
      const careGaps = Math.round(measureGaps * weight);
      const closureRate = Math.max(0, Math.min(100, Math.round(((eligibleMembers - careGaps) / Math.max(1, eligibleMembers)) * 100)));
      const qualityScore = Math.max(0, Math.min(100, Math.round(avgRate + provider.scoreAdjustment)));

      return {
        id: provider.id,
        providerName: provider.name,
        specialty: provider.specialty,
        organizationName:
          ORGANIZATIONS.find((organization) => organization.id === provider.organizationId)?.name ??
          "Unknown organization",
        panelSize: provider.panelSize,
        eligibleMembers,
        qualityScore,
        belowTargetMeasures: belowTarget,
        careGaps,
        closureRate,
        estimatedFinancialImpact: Math.round(careGaps * 240),
        topFocusMeasure: getTopFocusMeasureName(measures),
      };
    })
    .sort((a, b) => b.qualityScore - a.qualityScore || b.panelSize - a.panelSize);
}

export interface QualityFinancialHeroInputMeasure {
  id: string;
  shortName: string;
  domain: string;
  financialImpact: number;
  current: number;
  target: number;
  patientsLeftToTarget?: number;
}

export interface QualityFinancialHeroMonthPoint {
  month: string;
  lastYearEarned: number;
  projectedThisYear: number;
  targetRunRate: number;
}

export interface QualityFinancialHeroMeasurePoint {
  id: string;
  label: string;
  domain: string;
  current: number;
  target: number;
  gapMagnitude: number;
  patientsLeftToTarget: number;
  potential: number;
  projectedEarned: number;
  lastYearEarned: number;
  variance: number;
  monthlyRates: Array<{ month: string; rate: number }>;
  heatmap: Array<{ quarter: string; value: number }>;
}

export interface QualityFinancialHeroData {
  lastYearTotalEarned: number;
  projectedThisYearTotal: number;
  totalPossibleImpact: number;
  projectedDelta: number;
  monthlyTrend: QualityFinancialHeroMonthPoint[];
  measures: QualityFinancialHeroMeasurePoint[];
}

export function buildQualityFinancialHeroData(
  measures: QualityFinancialHeroInputMeasure[]
): QualityFinancialHeroData {
  const scopedMeasures: QualityFinancialHeroInputMeasure[] = measures.length
    ? measures
    : getPortfolioMeasures().map((measure) => ({
        id: measure.id,
        shortName: measure.shortName,
        domain: measure.domain,
        financialImpact: Math.round(measure.performance.gapMembers * 230),
        current: measure.performance.ratePercent,
        target: measure.targetPercent,
        patientsLeftToTarget: undefined,
      }));

  const totalPossibleImpact = scopedMeasures.reduce(
    (sum, measure) => sum + Math.max(0, measure.financialImpact),
    0
  );
  const lastYearTotalEarned = Math.round(totalPossibleImpact * 0.58);
  const projectedThisYearTotal = Math.round(totalPossibleImpact * 0.74);
  const projectedDelta = projectedThisYearTotal - lastYearTotalEarned;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = months.map((month, idx) => {
    const pct = (idx + 1) / 12;
    const seasonality = idx >= 8 ? 1.05 : idx >= 5 ? 1.02 : 0.98;
    const lastYearEarned = Math.round(lastYearTotalEarned * pct * seasonality);
    const projectedThisYear = Math.round(projectedThisYearTotal * pct * (1 + idx * 0.003));
    const targetRunRate = Math.round(totalPossibleImpact * pct);
    return { month, lastYearEarned, projectedThisYear, targetRunRate };
  });

  const measuresBreakout = scopedMeasures
    .map((measure, idx) => {
      const gapMagnitude = Math.max(0, measure.target - measure.current);
      const patientsLeftToTarget =
        measure.patientsLeftToTarget ?? Math.max(0, Math.round(gapMagnitude * 120));
      const projectedEarned = Math.round(measure.financialImpact * (0.64 + ((idx % 4) * 0.04)));
      const lastYearEarned = Math.round(projectedEarned * 0.84);
      const variance = projectedEarned - lastYearEarned;
      const momentum = measure.current < measure.target ? 0.18 : -0.06;
      const monthlyRates = months.map((month, monthIdx) => {
        const lookbackOffset = 11 - monthIdx;
        const seasonal = ((idx + monthIdx) % 4 === 0 ? 0.4 : (idx + monthIdx) % 3 === 0 ? -0.3 : 0.1);
        const rate = Math.max(0, Math.min(100, Number((measure.current - momentum * lookbackOffset + seasonal).toFixed(1))));
        return { month, rate };
      });
      const baseHeat = [0.7, 0.82, 0.93, 1.05].map((factor, qIdx) => {
        const volatility = 1 + ((idx + qIdx) % 3) * 0.03;
        return {
          quarter: `Q${qIdx + 1}`,
          value: Math.round((projectedEarned / 4) * factor * volatility),
        };
      });

      return {
        id: measure.id,
        label: measure.shortName,
        domain: measure.domain,
        current: measure.current,
        target: measure.target,
        gapMagnitude,
        patientsLeftToTarget,
        potential: measure.financialImpact,
        projectedEarned,
        lastYearEarned,
        variance,
        monthlyRates,
        heatmap: baseHeat,
      };
    });

  return {
    lastYearTotalEarned,
    projectedThisYearTotal,
    totalPossibleImpact,
    projectedDelta,
    monthlyTrend,
    measures: measuresBreakout,
  };
}

export interface HealthSystemResourceSnapshot {
  generatedAt: string;
  careManagersAvailableFte: number;
  outreachRnHours: number;
  callCenterDailyCapacity: number;
  digitalOutreachDailyCapacity: number;
  pcpOpenSlots14d: number;
  transportationNavigatorSlots: number;
  constrainedAreas: string[];
}

export interface AutomatedActionExecution {
  id: string;
  status: "Executed" | "In Progress" | "Recommended";
  measureId: string;
  measureName: string;
  actionExecuted: string;
  actionExecutionDetail: string;
  whyExecuted: string;
  executionResult: string;
  metrics: {
    targetedMembers: number;
    outreachCompleted: number;
    appointmentsScheduled: number;
    projectedClosures: number;
    projectedQualityLift: number;
    projectedFinancialImpact: number;
    staffHoursUsed: number;
  };
  confidence: number;
  channels: string[];
}

export interface DeferredAutomationOpportunity {
  id: string;
  measureName: string;
  blockedMembers: number;
  reason: string;
  recommendedUnlock: string;
  approvalActionLabel: string;
}

export interface AutomatedQualityActionSummary {
  resourceSnapshot: HealthSystemResourceSnapshot;
  actions: AutomatedActionExecution[];
  deferredOpportunities: DeferredAutomationOpportunity[];
  totals: {
    autoExecutedActions: number;
    membersTargeted: number;
    projectedClosures: number;
    projectedFinancialImpact: number;
    staffHoursUsed: number;
  };
}

export type QualityOpportunityExecutionMode = "automated" | "approval_required" | "manual";
export type QualityOpportunityExecutionStatus =
  | "monitoring"
  | "in_progress"
  | "needs_review"
  | "recommended";

export interface UnifiedQualityOpportunityExecution {
  id: string;
  measureName: string;
  currentPerformance: number;
  targetPerformance: number;
  gapMagnitude: number;
  patientsLeftToTarget: number;
  estimatedFinancialImpact: number;
  actionLabel: string;
  rationale: string;
  suggestedPrompt: string;
  hasInsight: boolean;
  executionMode: QualityOpportunityExecutionMode;
  executionStatus: QualityOpportunityExecutionStatus;
  actionExecutionDetail?: string;
  whyExecuted?: string;
  executionResult?: string;
  approvalActionLabel?: string;
  blockerReason?: string;
  recommendedUnlock?: string;
  blockedMembers?: number;
  autoActionId?: string;
}

export function buildAutomatedQualityActionSummary(
  opportunities: QualityOpportunity[]
): AutomatedQualityActionSummary {
  const topActions = opportunities.slice(0, 4);
  const resourceSnapshot: HealthSystemResourceSnapshot = {
    generatedAt: new Date().toISOString(),
    careManagersAvailableFte: 18,
    outreachRnHours: 312,
    callCenterDailyCapacity: 1480,
    digitalOutreachDailyCapacity: 9200,
    pcpOpenSlots14d: 1260,
    transportationNavigatorSlots: 140,
    constrainedAreas: [
      "North region PCP follow-up slots",
      "Evening bilingual call-center coverage",
      "Transportation-assisted mammography scheduling",
    ],
  };

  const actions: AutomatedActionExecution[] = topActions.map((opportunity, idx) => {
    const targetedMembers = opportunity.patientsLeftToTarget;
    const digitalFirst = idx % 2 === 0;
    const measureInsight = getMeasureActionInsightById(opportunity.id);
    const topSuggestedAction = getTopSuggestedActionForMeasure(opportunity.id);
    const workflowOwner = topSuggestedAction?.primaryOwner ?? "Quality Operations";
    const workflowSystem = topSuggestedAction?.workflowSystem ?? "Care-gap workflow orchestration";
    const cohortName = topSuggestedAction?.name ?? `${opportunity.measureName} priority cohort`;
    const recommendedAction =
      topSuggestedAction?.recommendedAction ??
      "Launch the highest-priority closure workflow for the members left to target.";
    const cohortImpactText = topSuggestedAction?.estimatedImpact ?? "Projected closure impact pending final cohort scoring.";

    const outreachCompleted = Math.round(targetedMembers * (digitalFirst ? 0.88 : 0.76));
    const appointmentsScheduled = Math.round(outreachCompleted * (digitalFirst ? 0.42 : 0.37));
    const projectedClosures = Math.round(appointmentsScheduled * (digitalFirst ? 0.71 : 0.66));
    const projectedQualityLift = Number(
      Math.max(0.2, (projectedClosures / Math.max(1, targetedMembers)) * opportunity.gapMagnitude).toFixed(1)
    );
    const projectedFinancialImpact =
      idx === 0
        ? Math.min(185000, Math.round(opportunity.estimatedFinancialImpact * 0.35))
        : Math.round(opportunity.estimatedFinancialImpact * (0.46 + idx * 0.07));
    const staffHoursUsed = Math.round(targetedMembers * (digitalFirst ? 0.05 : 0.08));

    return {
      id: `auto-action-${opportunity.id}`,
      status: idx < 2 ? "Executed" : idx === 2 ? "In Progress" : "Recommended",
      measureId: opportunity.id,
      measureName: opportunity.measureName,
      actionExecuted:
        idx === 0
          ? "Care Management Enrollment · auto-assign top 10% highest-risk members to available care managers"
          : digitalFirst
          ? `${cohortName} · automated omnichannel outreach + digital self-scheduling`
          : `${cohortName} · RN outreach queue + navigator-assisted scheduling`,
      actionExecutionDetail:
        idx === 0
          ? `Using Quality + Resources agent orchestration, automatically assigned the top 10% highest-risk members (${targetedMembers.toLocaleString()}) to care managers. Capacity and staffing availability were validated from Oracle Fusion-connected resource signals before execution.`
          : digitalFirst
          ? `Executed a digital-first campaign for ${targetedMembers.toLocaleString()} members aligned to "${cohortName}" using ${workflowSystem}. Members with failed digital engagement were auto-routed to outbound follow-up under ${workflowOwner}.`
          : `Executed nurse-led outreach for ${targetedMembers.toLocaleString()} members aligned to "${cohortName}" using ${workflowSystem}, with navigator handoff for access-barrier members under ${workflowOwner}.`,
      whyExecuted:
        idx === 0
          ? `Quality agent identified a rising-risk cohort with open quality and utilization risk. Resources agent (hooked into Oracle Fusion operational data) confirmed care manager panel capacity and schedule availability, enabling safe auto-enrollment without exceeding staffing limits.`
          : `${measureInsight?.contextualSummary ?? `${opportunity.measureName} is a top incentive-sensitive gap in the current portfolio.`} ` +
            `Selected intervention: ${recommendedAction} ` +
            `Health System Resources insights showed sufficient ${digitalFirst ? "digital outreach throughput" : "RN care-management capacity"} and appointment inventory to run this workflow now, while minimizing burden on constrained areas (e.g., ${resourceSnapshot.constrainedAreas[0]}).`,
      executionResult:
        idx === 0
          ? `Auto-enrollment workflow assigned ${targetedMembers.toLocaleString()} members to care managers, with ${outreachCompleted.toLocaleString()} outreach touches initiated and ${appointmentsScheduled.toLocaleString()} follow-up appointments staged. Projected ${projectedClosures.toLocaleString()} closure opportunities with ${projectedFinancialImpact.toLocaleString()} impact while remaining within resource guardrails.`
          : `${cohortImpactText} Current execution indicates ${appointmentsScheduled.toLocaleString()} appointments scheduled and ${projectedClosures.toLocaleString()} projected closures. This is expected to improve ${opportunity.measureName} by ~${projectedQualityLift} pts and protect ${projectedFinancialImpact.toLocaleString()} in incentive-linked impact while consuming ${staffHoursUsed.toLocaleString()} operational hours.`,
      metrics: {
        targetedMembers,
        outreachCompleted,
        appointmentsScheduled,
        projectedClosures,
        projectedQualityLift,
        projectedFinancialImpact,
        staffHoursUsed,
      },
      confidence: Number((0.72 + idx * 0.06).toFixed(2)),
      channels:
        idx === 0
          ? ["Care management assignment", "RN outreach", "Portal", "Call center"]
          : digitalFirst
          ? ["SMS", "Portal", "Email", "Fallback outbound call"]
          : ["RN outreach", "Navigator handoff", "Call center"],
    };
  });

  const deferredOpportunities: DeferredAutomationOpportunity[] = opportunities.slice(4, 7).map((opportunity, idx) => ({
    id: `deferred-${opportunity.id}`,
    measureName: opportunity.measureName,
    blockedMembers: Math.round(opportunity.patientsLeftToTarget * (0.32 + idx * 0.08)),
    reason:
      idx === 0
        ? "Insufficient PCP follow-up slots in north region"
        : idx === 1
        ? "Bilingual evening outreach coverage below required threshold"
        : "Transportation navigator capacity saturated for 10-day window",
    recommendedUnlock:
      idx === 0
        ? "Release additional PCP overflow slots or route to virtual follow-up sessions"
        : idx === 1
        ? "Add bilingual evening shift coverage or shift campaign to digital-first"
        : "Expand rideshare vouchers and navigator overtime for high-risk cohorts",
    approvalActionLabel:
      idx === 0
        ? "Click here to confirm releasing additional PCP overflow slots"
        : idx === 1
        ? "Click here to confirm adding bilingual evening shift coverage"
        : "Click here to confirm expanding transportation navigator support",
  }));

  return {
    resourceSnapshot,
    actions,
    deferredOpportunities,
    totals: {
      autoExecutedActions: actions.filter((action) => action.status !== "Recommended").length,
      membersTargeted: actions.reduce((sum, action) => sum + action.metrics.targetedMembers, 0),
      projectedClosures: actions.reduce((sum, action) => sum + action.metrics.projectedClosures, 0),
      projectedFinancialImpact: actions.reduce((sum, action) => sum + action.metrics.projectedFinancialImpact, 0),
      staffHoursUsed: actions.reduce((sum, action) => sum + action.metrics.staffHoursUsed, 0),
    },
  };
}

export function buildUnifiedQualityOpportunityExecution(
  opportunities: QualityOpportunity[],
  options?: { requireApprovalForHighCostActions?: boolean; highCostThreshold?: number }
): UnifiedQualityOpportunityExecution[] {
  const requireApprovalForHighCostActions = options?.requireApprovalForHighCostActions ?? true;
  const highCostThreshold = options?.highCostThreshold ?? 220000;
  const automatedSummary = buildAutomatedQualityActionSummary(opportunities);

  const actionByMeasureId = new Map(
    automatedSummary.actions.map((action) => [action.measureId, action] as const)
  );
  const deferredByMeasureId = new Map(
    automatedSummary.deferredOpportunities.map((item) => [item.id.replace("deferred-", ""), item] as const)
  );

  return opportunities.map((opportunity) => {
    const action = actionByMeasureId.get(opportunity.id);
    const deferred = deferredByMeasureId.get(opportunity.id);

    if (action) {
      const needsReview =
        requireApprovalForHighCostActions &&
        action.metrics.projectedFinancialImpact >= highCostThreshold;

      const executionStatus: QualityOpportunityExecutionStatus = needsReview
        ? "needs_review"
        : action.status === "Executed"
        ? "monitoring"
        : action.status === "In Progress"
        ? "in_progress"
        : "recommended";

      return {
        ...opportunity,
        actionLabel: action.actionExecuted,
        rationale: action.whyExecuted,
        executionMode: needsReview ? "approval_required" : "automated",
        executionStatus,
        actionExecutionDetail: action.actionExecutionDetail,
        whyExecuted: action.whyExecuted,
        executionResult: action.executionResult,
        approvalActionLabel: needsReview ? "Review and approve automated execution" : undefined,
        blockerReason: needsReview
          ? `Projected impact ${action.metrics.projectedFinancialImpact.toLocaleString()} exceeds automated threshold ${highCostThreshold.toLocaleString()}.`
          : undefined,
        recommendedUnlock: needsReview
          ? "Approve this high-impact automation run or lower batch size and execute in staged waves."
          : undefined,
        blockedMembers: needsReview ? Math.max(1, Math.round(action.metrics.targetedMembers * 0.5)) : undefined,
        autoActionId: action.id,
      };
    }

    if (deferred) {
      return {
        ...opportunity,
        executionMode: "approval_required",
        executionStatus: "needs_review",
        approvalActionLabel: deferred.approvalActionLabel,
        blockerReason: deferred.reason,
        recommendedUnlock: deferred.recommendedUnlock,
        blockedMembers: deferred.blockedMembers,
      };
    }

    return {
      ...opportunity,
      executionMode: "manual",
      executionStatus: "recommended",
    };
  });
}