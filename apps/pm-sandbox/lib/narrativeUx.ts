import { mockContracts } from "@/lib/mockData";
import { getMeasuresForContract } from "@/lib/qualityData";

export interface AgentActivityStep {
  label: string;
  detail: string;
  status: "complete" | "running" | "queued";
}

export interface FlaggedContractCard {
  scenarioLabel: "Contract A" | "Contract B";
  contractId: string;
  contractName: string;
  payer: string;
  statusLabel: "Incentive at risk" | "Downside risk";
  estimatedDollarsAtStake: string;
  timeRemaining: string;
  topMeasureDrivers: string[];
}

export interface RankedOpportunity {
  id: string;
  measureName: string;
  cohortDescriptor: string;
  gapSize: number;
  financialImpactRange: string;
  nextActionLabel: string;
  nextActionHref: string;
  scores: {
    clinicalRisk: number;
    measureImpact: number;
    financialExposure: number;
    total: number;
  };
}

export interface CareGapCohortPlan {
  id: string;
  name: string;
  criteria: string;
  rules: string[];
  patientCount: number;
  reviewedSignals: string[];
  recommendedActions: string[];
  subAgentLabel: string;
}

const FLAGGED_CONFIG = [
  {
    scenarioLabel: "Contract A" as const,
    contractId: "mssp-001",
    statusLabel: "Incentive at risk" as const,
    estimatedDollarsAtStake: "$420K–$560K upside incentive",
    timeRemaining: "89 days left in performance period",
  },
  {
    scenarioLabel: "Contract B" as const,
    contractId: "ma-004",
    statusLabel: "Downside risk" as const,
    estimatedDollarsAtStake: "$1.1M–$1.5M penalty exposure",
    timeRemaining: "89 days left in performance period",
  },
];

function normalizeTo100(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function measureCohortDescriptor(measureId: string) {
  const byMeasure: Record<string, string> = {
    "a1c-control": "Adults with diabetes due for HbA1c screening or follow-up",
    "bp-control": "Members with hypertension and recent uncontrolled BP",
    "colorectal-screen": "Adults age 50–75 missing colorectal screening",
    "breast-screen": "Women age 50–74 with preventive screening gaps",
    "statin-adherence": "ASCVD/diabetes members with refill adherence risk",
    "flu-shot": "Eligible members overdue for seasonal flu vaccine",
  };

  return byMeasure[measureId] ?? "Eligible members with unresolved quality gap";
}

function financialMultiplier(measureId: string) {
  const byMeasure: Record<string, number> = {
    "a1c-control": 290,
    "bp-control": 210,
    "colorectal-screen": 240,
    "breast-screen": 180,
    "statin-adherence": 170,
    "flu-shot": 130,
  };
  return byMeasure[measureId] ?? 150;
}

export function getFlaggedContractsForLanding(): FlaggedContractCard[] {
  return FLAGGED_CONFIG.map((config) => {
    const contract = mockContracts.find((item) => item.id === config.contractId);
    const measures = getMeasuresForContract(config.contractId)
      .sort((a, b) => b.performance.gapMembers - a.performance.gapMembers)
      .slice(0, 3)
      .map((measure) => measure.shortName);

    return {
      ...config,
      contractName: contract?.name ?? "Unknown contract",
      payer: contract?.payor ?? "Unknown payer",
      topMeasureDrivers: measures,
    };
  });
}

export function buildRankedOpportunities(contractId: string): RankedOpportunity[] {
  const measures = getMeasuresForContract(contractId);
  if (!measures.length) return [];

  const maxGap = Math.max(...measures.map((m) => m.performance.gapMembers));
  const maxGapRate = Math.max(
    ...measures.map((m) => (m.performance.gapMembers / Math.max(m.performance.eligibleMembers, 1)) * 100)
  );
  const maxFinancial = Math.max(
    ...measures.map((m) => m.performance.gapMembers * financialMultiplier(m.id))
  );

  return measures
    .map((measure) => {
      const gapRate =
        (measure.performance.gapMembers / Math.max(measure.performance.eligibleMembers, 1)) * 100;
      const chronicBoost = measure.domain === "Chronic" ? 12 : 0;
      const downTrendBoost = measure.performance.trendDirection === "down" ? 8 : 0;
      const a1cBoost = measure.id === "a1c-control" ? 14 : 0;

      const clinicalRisk = Math.min(
        100,
        normalizeTo100(gapRate, maxGapRate) + chronicBoost + downTrendBoost + a1cBoost
      );
      const measureImpact = Math.min(100, normalizeTo100(measure.performance.gapMembers, maxGap));
      const financialExposure = normalizeTo100(
        measure.performance.gapMembers * financialMultiplier(measure.id),
        maxFinancial
      );
      const total = Math.round(
        clinicalRisk * 0.45 + measureImpact * 0.35 + financialExposure * 0.2
      );

      const grossFinancial = measure.performance.gapMembers * financialMultiplier(measure.id);
      const lowEstimate = Math.round(grossFinancial * 0.75);
      const highEstimate = Math.round(grossFinancial * 1.05);

      return {
        id: `${contractId}-${measure.id}`,
        measureName: measure.name,
        cohortDescriptor: measureCohortDescriptor(measure.id),
        gapSize: measure.performance.gapMembers,
        financialImpactRange: `$${lowEstimate.toLocaleString()}–$${highEstimate.toLocaleString()}`,
        nextActionLabel:
          measure.id === "a1c-control" ? "Open Care Gap Closure" : "Queue targeted intervention",
        nextActionHref:
          measure.id === "a1c-control"
            ? `/care-management/hba1c?contractId=${contractId}`
            : `/quality/${contractId}`,
        scores: {
          clinicalRisk,
          measureImpact,
          financialExposure,
          total,
        },
      };
    })
    .sort((a, b) => b.scores.total - a.scores.total);
}

export function getContractExecutiveNarrative(contractId: string) {
  const flagged = getFlaggedContractsForLanding().find((item) => item.contractId === contractId);
  const opportunities = buildRankedOpportunities(contractId);
  const topDriver = opportunities[0]?.measureName ?? "Quality performance";

  if (flagged?.statusLabel === "Incentive at risk") {
    return {
      title: "Incentive attainment is at risk without targeted gap closure.",
      dollars: flagged.estimatedDollarsAtStake,
      timeline: flagged.timeRemaining,
      performanceWindow: "Performance Year 2025 · Q4 closing window",
      recommendation:
        "Prioritize high-risk diabetic members and preventive gap cohorts to recover numerator performance before year-end.",
      topDriver,
    };
  }

  return {
    title: "Current trajectory signals downside risk if trend is not reversed.",
    dollars: flagged?.estimatedDollarsAtStake ?? "$600K–$900K exposure",
    timeline: flagged?.timeRemaining ?? "89 days left in performance period",
    performanceWindow: "Performance Year 2025 · Q4 reconciliation window",
    recommendation:
      "Focus on the highest clinical-risk cohorts first to avoid quality misses that compound financial penalties.",
    topDriver,
  };
}

export function getContractAgentActivitySteps(): AgentActivityStep[] {
  return [
    {
      label: "Reviewing patient chart data including documents, medications, labs, orders…",
      detail: "Summarizing quality-relevant clinical signals without exposing PHI.",
      status: "complete",
    },
    {
      label: "Checking upcoming appointments and care team assignments…",
      detail: "Detecting visit opportunities and pre-visit prep windows.",
      status: "complete",
    },
    {
      label: "Evaluating measure eligibility and numerator compliance…",
      detail: "Comparing denominator cohorts against current closure status.",
      status: "complete",
    },
    {
      label: "Estimating financial exposure based on contract terms…",
      detail: "Mapping quality movement to incentive lift and penalty avoidance.",
      status: "running",
    },
    {
      label: "Generating prioritized opportunity list and recommended actions…",
      detail: "Ranking by clinical risk, measure impact, and financial exposure.",
      status: "queued",
    },
  ];
}

export function getHbA1cCareGapActivitySteps(): AgentActivityStep[] {
  return [
    {
      label: "Reviewing diabetic member eligibility for HbA1c screening…",
      detail: "Validating denominator inclusion and due status.",
      status: "complete",
    },
    {
      label: "Checking future appointments and pre-visit workflow opportunities…",
      detail: "Routing members to outbound outreach vs provider pre-visit prep.",
      status: "complete",
    },
    {
      label: "Evaluating this-year HbA1c results for elevated values…",
      detail: "Identifying members requiring care management enrollment.",
      status: "running",
    },
    {
      label: "Assessing network and access friction for due screenings…",
      detail: "Flagging travel barriers and in-network availability constraints.",
      status: "queued",
    },
  ];
}

export function getHbA1cCareGapCohorts(contractId: string): CareGapCohortPlan[] {
  const a1cOpportunity = buildRankedOpportunities(contractId).find((item) =>
    item.id.includes("a1c-control")
  );
  const base = a1cOpportunity?.gapSize ?? 520;

  const outreachCount = Math.round(base * 0.34);
  const preVisitCount = Math.round(base * 0.29);
  const coverageFrictionCount = Math.round(base * 0.17);
  const careManagementCount = Math.round(base * 0.2);

  return [
    {
      id: "outbound",
      name: "Patient Outbound Outreach",
      criteria: "Patients due for HbA1c screening and no future appointments.",
      rules: [
        "HbA1c screening due",
        "No scheduled PCP or endocrinology appointment in next 60 days",
      ],
      patientCount: outreachCount,
      reviewedSignals: [
        "Open care gaps",
        "Scheduling data",
        "Recent outreach history",
      ],
      recommendedActions: [
        "Generate outreach list",
        "Draft patient message",
        "Recommend scheduling workflow",
      ],
      subAgentLabel: "Run outreach sub-agent",
    },
    {
      id: "previsit",
      name: "Provider Pre-visit Prep",
      criteria: "Patients due for HbA1c screening and has an upcoming appointment.",
      rules: [
        "HbA1c screening due",
        "Upcoming appointment exists in next 45 days",
      ],
      patientCount: preVisitCount,
      reviewedSignals: [
        "Appointment schedule",
        "Care team assignment",
        "Most recent A1c date/value (if available)",
      ],
      recommendedActions: [
        "Generate pre-visit note",
        "Highlight last A1c date and value",
        "Suggest order placement",
      ],
      subAgentLabel: "Run pre-visit prep sub-agent",
    },
    {
      id: "care-mgmt",
      name: "Care Management Enrollment",
      criteria: "Patients screened this year with elevated HbA1c result.",
      rules: [
        "HbA1c completed this measurement year",
        "Most recent value elevated (e.g., >9)",
      ],
      patientCount: careManagementCount,
      reviewedSignals: [
        "Lab result trends",
        "Comorbidity burden",
        "Care management enrollment status",
      ],
      recommendedActions: [
        "Recommend assignment to care management queue",
        "Attach rationale and risk context",
        "Suggest 30/60/90 day follow-up steps",
      ],
      subAgentLabel: "Run care management sub-agent",
    },
    {
      id: "coverage",
      name: "Coverage Friction",
      criteria:
        "Patients due for screening with access barriers (example: nearest in-network provider >20 miles).",
      rules: [
        "HbA1c screening due",
        "Access friction detected (distance, transport, network mismatch)",
      ],
      patientCount: coverageFrictionCount,
      reviewedSignals: [
        "Network adequacy",
        "Geographic distance",
        "Transportation support eligibility",
      ],
      recommendedActions: [
        "Identify primary friction reason",
        "Suggest alternate site or telehealth pathway",
        "Recommend exception workflow when needed",
      ],
      subAgentLabel: "Run coverage resolution sub-agent",
    },
  ];
}
