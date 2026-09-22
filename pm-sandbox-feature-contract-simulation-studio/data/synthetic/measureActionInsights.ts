export type SupportedMeasureInsightId =
  | "a1c-control"
  | "bp-control"
  | "colorectal-screen"
  | "flu-shot"
  | "statin-adherence"
  | "breast-screen"
  | "followup-hosp"
  | "copd-controller"
  | "ed-avoidance";

export interface MeasureInsightKpi {
  label: string;
  value: string;
  delta: string;
}

export interface MeasureTierContractImpact {
  contractId: string;
  contractName: string;
  impact: number;
}

export interface MeasureImpactTier {
  id: string;
  label: string;
  targetPerformance: number;
  incrementalImpact: number;
  totalImpactAtTier: number;
  contracts: MeasureTierContractImpact[];
}

export interface MeasureFinancialModel {
  currentPerformanceImpact: number;
  maxIncentive: number;
  tiers: MeasureImpactTier[];
}

export interface MeasureTrendPoint {
  month: string;
  priorYear: number;
  currentYear: number | null;
  target: number;
  priorYearMoM: number | null;
  currentYearMoM: number | null;
}

export type CohortResourceNeed = "Low" | "Medium" | "High";

export interface MeasureInsightCohort {
  id: string;
  name: string;
  patientCount: number;
  cohortDescription: string;
  recommendedAction: string;
  primaryOwner: string;
  workflowSystem: string;
  estimatedImpact: string;
  estimatedImpactValue?: number;
  resourceNeed?: CohortResourceNeed;
  automationSummary?: string;
  expectedTierLabel?: string;
  incrementalFinancialImpact?: number;
  efficiencyScore?: number;
  criteria: string[];
  ctaLabel: string;
}

export interface MeasureActionInsight {
  measureId: SupportedMeasureInsightId;
  measureName: string;
  lastUpdated: string;
  contextualSummary: string;
  currentPerformance: number;
  targetPerformance: number;
  patientsToTarget: number;
  metPatientCount: number;
  totalScorablePatients: number;
  compositeScoreImpactPct: number;
  estimatedFinancialImpact: string;
  estimatedFinancialImpactValue?: number;
  kpis: MeasureInsightKpi[];
  trend: MeasureTrendPoint[];
  cohorts: MeasureInsightCohort[];
  financialModel?: MeasureFinancialModel;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CONTRACT_SPLITS: Array<{ contractId: string; contractName: string; weight: number }> = [
  { contractId: "mssp-001", contractName: "ACO REACH — Northeast Region", weight: 0.34 },
  { contractId: "ma-004", contractName: "United MA Compass — Midwest", weight: 0.28 },
  { contractId: "ma-002", contractName: "Humana Gold Plus — Suburban Markets", weight: 0.22 },
  { contractId: "comm-004", contractName: "Humana Commercial PCMH — Retail Sector", weight: 0.16 },
];

function realisticTrendSeries(priorYearEnd: number, currentYearMonthEnd: number, target: number, currentMonthsCompleted = 3): MeasureTrendPoint[] {
  const priorSeries = MONTHS.map((_, idx) => {
    const linear = (idx / 11) * priorYearEnd;
    const seasonalDrift = Math.sin(idx / 2.5) * 1.2;
    return Number(Math.max(0, linear + seasonalDrift).toFixed(1));
  });

  const currentSeries = MONTHS.map((_, idx) => {
    if (idx >= currentMonthsCompleted) return null;
    const denominator = Math.max(currentMonthsCompleted - 1, 1);
    const linear = (idx / denominator) * currentYearMonthEnd;
    const drift = idx === 0 ? 0 : Math.sin(idx) * 0.7;
    return Number(Math.max(0, linear + drift).toFixed(1));
  });

  return MONTHS.map((month, idx) => {
    const priorYear = priorSeries[idx];
    const currentYear = currentSeries[idx];
    const priorYearMoM = idx === 0 ? null : Number((priorYear - priorSeries[idx - 1]).toFixed(1));
    const currentYearMoM =
      idx === 0 || currentYear === null || currentSeries[idx - 1] === null
        ? null
        : Number((currentYear - (currentSeries[idx - 1] as number)).toFixed(1));

    return {
      month,
      priorYear,
      currentYear,
      target,
      priorYearMoM,
      currentYearMoM,
    };
  });
}

function splitImpactAcrossContracts(amount: number): MeasureTierContractImpact[] {
  const impacts = CONTRACT_SPLITS.map((contract, idx) => {
    const rawImpact = Math.round(amount * contract.weight);
    return {
      ...contract,
      impact: rawImpact,
      idx,
    };
  });

  const allocated = impacts.reduce((sum, c) => sum + c.impact, 0);
  const remainder = amount - allocated;
  if (remainder !== 0) {
    impacts[0].impact += remainder;
  }

  return impacts.map(({ contractId, contractName, impact }) => ({
    contractId,
    contractName,
    impact,
  }));
}

function buildFinancialModel(
  currentPerformance: number,
  targetPerformance: number,
  currentPerformanceImpact: number,
  maxIncentive: number
): MeasureFinancialModel {
  const totalUpside = Math.max(0, maxIncentive - currentPerformanceImpact);
  const tier1Target = Math.min(targetPerformance - 2, currentPerformance + 3);
  const tier2Target = targetPerformance;
  const tier3Target = Math.min(95, targetPerformance + 3);

  const tier1Increment = Math.round(totalUpside * 0.34);
  const tier2Increment = Math.round(totalUpside * 0.39);
  const tier3Increment = Math.max(0, totalUpside - tier1Increment - tier2Increment);

  const tiers: MeasureImpactTier[] = [
    {
      id: "tier-1",
      label: "Tier 1 · Stabilize trajectory",
      targetPerformance: tier1Target,
      incrementalImpact: tier1Increment,
      totalImpactAtTier: currentPerformanceImpact + tier1Increment,
      contracts: splitImpactAcrossContracts(tier1Increment),
    },
    {
      id: "tier-2",
      label: "Tier 2 · Contract target attainment",
      targetPerformance: tier2Target,
      incrementalImpact: tier2Increment,
      totalImpactAtTier: currentPerformanceImpact + tier1Increment + tier2Increment,
      contracts: splitImpactAcrossContracts(tier2Increment),
    },
    {
      id: "tier-3",
      label: "Tier 3 · Stretch / best-case",
      targetPerformance: tier3Target,
      incrementalImpact: tier3Increment,
      totalImpactAtTier: maxIncentive,
      contracts: splitImpactAcrossContracts(tier3Increment),
    },
  ];

  return {
    currentPerformanceImpact,
    maxIncentive,
    tiers,
  };
}

const baseInsightsByMeasure: Record<SupportedMeasureInsightId, MeasureActionInsight> = {
  "a1c-control": {
    measureId: "a1c-control",
    measureName: "Diabetes A1c Control (<9%)",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary:
      "1,483 diabetic members remain to target. Closing this gap is projected to improve quality performance and generate meaningful contract-level savings across the portfolio.",
    currentPerformance: 68,
    targetPerformance: 76,
    patientsToTarget: 1483,
    metPatientCount: 12607,
    totalScorablePatients: 18540,
    compositeScoreImpactPct: 4.2,
    estimatedFinancialImpact: "$622,860",
    kpis: [
      { label: "Current Performance", value: "68%", delta: "↓ 1.3% MoM" },
      { label: "Patients to Target", value: "1,483", delta: "↑ 2.1% MoM" },
      { label: "Met Patient Count", value: "12,607", delta: "↑ 0.8% MoM" },
      { label: "Total Eligible Population", value: "18,540", delta: "↑ 0.3% MoM" },
      { label: "Target", value: "76%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "4.2%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(74.8, 68, 76, 3),
    cohorts: [
      {
        id: "a1c-outreach",
        name: "Patient Outbound Outreach",
        patientCount: 542,
        cohortDescription:
          "Members due for an HbA1c closure event with no upcoming PCP/endocrinology appointment in the next 60 days.",
        recommendedAction:
          "Create a Patient Outreach Campaign via CRM connector (Salesforce/Dynamics) with scheduling links and reminder cadence.",
        primaryOwner: "Population Health Outreach",
        workflowSystem: "CRM connector + scheduling",
        estimatedImpact: "~290 potential closures in 60 days",
        estimatedImpactValue: 290,
        resourceNeed: "Medium",
        automationSummary: "Campaign auto-built with scheduling links and reminder cadence.",
        criteria: [
          "Diabetes denominator eligible",
          "Most recent A1c > 9% or no current-year closure",
          "No future appointment in next 60 days",
        ],
        ctaLabel: "Create outreach campaign",
      },
      {
        id: "a1c-previsit",
        name: "Provider Pre-visit Prep",
        patientCount: 401,
        cohortDescription:
          "Members due for gap closure with a scheduled upcoming visit where HbA1c closure can be completed.",
        recommendedAction:
          "Confirm pre-visit note workflow to auto-generate and transmit note into provider EHR with A1c due signal and order recommendation.",
        primaryOwner: "Provider Ops",
        workflowSystem: "EHR pre-visit workflow",
        estimatedImpact: "~245 potential closures in 45 days",
        estimatedImpactValue: 245,
        resourceNeed: "Low",
        automationSummary: "Pre-visit notes and order suggestions are auto-inserted into encounter prep.",
        criteria: [
          "HbA1c gap unresolved",
          "Future PCP/endocrinology appointment exists",
          "No A1c order placed for the encounter",
        ],
        ctaLabel: "Confirm workflow",
      },
      {
        id: "a1c-caremgmt",
        name: "Care Management Enrollment",
        patientCount: 236,
        cohortDescription:
          "Members with recent A1c capture and persistently elevated values requiring longitudinal clinical support.",
        recommendedAction:
          "Auto-assign members to diabetes care management program with pharmacist + RN protocols and remote monitoring enrollment.",
        primaryOwner: "Care Management",
        workflowSystem: "Care management registry",
        estimatedImpact: "~118 improved-control outcomes in 90 days",
        estimatedImpactValue: 118,
        resourceNeed: "High",
        automationSummary: "Agent auto-assigns high-risk members into RN/pharmacist longitudinal pathways.",
        criteria: [
          "Current-year HbA1c test completed",
          "Most recent value > 9%",
          "High-risk comorbidity overlay",
        ],
        ctaLabel: "Enroll cohort",
      },
      {
        id: "a1c-coverage",
        name: "Coverage Friction Resolution",
        patientCount: 187,
        cohortDescription:
          "Members facing access and network barriers impacting their ability to complete recommended diabetes care.",
        recommendedAction:
          "Launch navigation workflow for in-network alternatives, transportation support, and prior-auth escalation where required.",
        primaryOwner: "Navigation Team",
        workflowSystem: "Benefits + navigation workflow",
        estimatedImpact: "~84 closures with friction mitigation",
        estimatedImpactValue: 84,
        resourceNeed: "Medium",
        automationSummary: "Navigation tasks are auto-routed by barrier type and region.",
        criteria: [
          "Distance to in-network site > 20 miles OR transport barrier",
          "Recent denied diabetes-related service",
          "Unclosed A1c care gap",
        ],
        ctaLabel: "Start navigation workflow",
      },
      {
        id: "a1c-medopt",
        name: "Medication Intensification Review",
        patientCount: 117,
        cohortDescription:
          "Members with repeated elevated A1c despite recent visits, suggesting treatment optimization opportunity.",
        recommendedAction:
          "Queue pharmacist/protocol review to support therapy adjustment and adherence reinforcement with provider co-sign.",
        primaryOwner: "Clinical Pharmacy",
        workflowSystem: "Pharmacy protocol queue",
        estimatedImpact: "~62 likely control improvements",
        estimatedImpactValue: 62,
        resourceNeed: "High",
        automationSummary: "Protocol-based pharmacist reviews are queued automatically with rationale.",
        criteria: ["Two or more elevated A1c values", "Recent visit completed", "No therapy adjustment in 120 days"],
        ctaLabel: "Queue clinical review",
      },
    ],
  },
  "bp-control": {
    measureId: "bp-control",
    measureName: "Controlling High Blood Pressure",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary:
      "828 members remain to target for blood-pressure control performance. Most unresolved gaps are tied to missed follow-up and medication titration delays.",
    currentPerformance: 70,
    targetPerformance: 73,
    patientsToTarget: 828,
    metPatientCount: 19340,
    totalScorablePatients: 27620,
    compositeScoreImpactPct: 2.6,
    estimatedFinancialImpact: "$347,760",
    kpis: [
      { label: "Current Performance", value: "70%", delta: "↑ 0.6% MoM" },
      { label: "Patients to Target", value: "828", delta: "↑ 1.1% MoM" },
      { label: "Met Patient Count", value: "19,340", delta: "↑ 0.4% MoM" },
      { label: "Total Eligible Population", value: "27,620", delta: "↑ 0.2% MoM" },
      { label: "Target", value: "73%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "2.6%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(71.6, 70, 73, 3),
    cohorts: [
      {
        id: "bp-home-monitoring",
        name: "Home BP Monitoring Outreach",
        patientCount: 297,
        cohortDescription: "Members with uncontrolled BP and no recent home BP readings submitted.",
        recommendedAction: "Launch remote BP monitoring workflow with device enablement and weekly reading prompts.",
        primaryOwner: "Care Management",
        workflowSystem: "Remote monitoring + outreach",
        estimatedImpact: "~132 likely controlled-BP closures",
        estimatedImpactValue: 132,
        resourceNeed: "High",
        automationSummary: "Device enrollment and weekly reminder flows are auto-triggered.",
        criteria: ["Most recent BP uncontrolled", "No home readings in last 30 days", "Open BP gap"],
        ctaLabel: "Start home-monitoring program",
      },
      {
        id: "bp-previsit",
        name: "Visit-based BP Recheck",
        patientCount: 224,
        cohortDescription: "Members with upcoming visits where repeat BP protocol can close measurement gap.",
        recommendedAction: "Confirm pre-visit protocol and in-visit BP repeat reminder in provider workflow.",
        primaryOwner: "Provider Ops",
        workflowSystem: "EHR pre-visit protocol",
        estimatedImpact: "~101 expected closures",
        estimatedImpactValue: 101,
        resourceNeed: "Low",
        automationSummary: "Visit protocol reminders are auto-attached for upcoming encounters.",
        criteria: ["Upcoming PCP visit", "Uncontrolled or missing confirmatory BP", "Open BP gap"],
        ctaLabel: "Confirm visit protocol",
      },
      {
        id: "bp-med-review",
        name: "Antihypertensive Medication Review",
        patientCount: 183,
        cohortDescription: "Members with persistent uncontrolled BP and potential therapy adjustment needs.",
        recommendedAction: "Queue pharmacist/provider co-management workflow for medication optimization.",
        primaryOwner: "Clinical Pharmacy",
        workflowSystem: "Medication optimization queue",
        estimatedImpact: "~76 likely improved-control outcomes",
        estimatedImpactValue: 76,
        resourceNeed: "Medium",
        automationSummary: "Medication optimization tasks are queued with suggested titration context.",
        criteria: ["Two recent uncontrolled BP values", "No medication adjustment in 90 days", "Open BP gap"],
        ctaLabel: "Queue medication review",
      },
      {
        id: "bp-access",
        name: "Follow-up Access Friction",
        patientCount: 124,
        cohortDescription: "Members unable to complete timely follow-up due to transportation or network access barriers.",
        recommendedAction: "Launch navigation workflow for follow-up scheduling and transport support.",
        primaryOwner: "Navigation Team",
        workflowSystem: "Navigation and scheduling",
        estimatedImpact: "~49 follow-up completions",
        estimatedImpactValue: 49,
        resourceNeed: "Medium",
        automationSummary: "Scheduling and transport workflows are auto-routed to navigation queues.",
        criteria: ["Missed HTN follow-up", "Transport or network barrier", "Unclosed BP gap"],
        ctaLabel: "Start access workflow",
      },
    ],
  },
  "colorectal-screen": {
    measureId: "colorectal-screen",
    measureName: "Colorectal Cancer Screening",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary:
      "2,363 members remain to target across active contracts. Largest lift opportunity is among members overdue with no completed outreach sequence.",
    currentPerformance: 61,
    targetPerformance: 72,
    patientsToTarget: 2363,
    metPatientCount: 13110,
    totalScorablePatients: 21480,
    compositeScoreImpactPct: 3.7,
    estimatedFinancialImpact: "$614,380",
    kpis: [
      { label: "Current Performance", value: "61%", delta: "↓ 1.9% MoM" },
      { label: "Patients to Target", value: "2,363", delta: "↑ 2.5% MoM" },
      { label: "Met Patient Count", value: "13,110", delta: "↑ 0.6% MoM" },
      { label: "Total Eligible Population", value: "21,480", delta: "↑ 0.2% MoM" },
      { label: "Target", value: "72%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "3.7%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(70.2, 61, 72, 3),
    cohorts: [
      {
        id: "crc-mailkit",
        name: "FIT Kit Outreach Candidates",
        patientCount: 1042,
        cohortDescription: "Members overdue for screening with no recent outreach completion and valid mailing/contact preference.",
        recommendedAction: "Launch mailed FIT kit outreach campaign with digital follow-up reminders.",
        primaryOwner: "Preventive Outreach",
        workflowSystem: "CRM + print/mail vendor",
        estimatedImpact: "~460 expected completed kits",
        estimatedImpactValue: 460,
        resourceNeed: "Medium",
        automationSummary: "FIT kit campaign audiences and reminder cadences are auto-generated.",
        criteria: ["Overdue for colorectal screening", "No colonoscopy in measurement window", "Active contact pathway"],
        ctaLabel: "Launch FIT campaign",
      },
      {
        id: "crc-upcoming",
        name: "Upcoming Wellness Visit Prep",
        patientCount: 601,
        cohortDescription: "Members overdue for screening with annual wellness visit already scheduled.",
        recommendedAction: "Insert pre-visit prompt and order recommendation into visit workflow.",
        primaryOwner: "Provider Ops",
        workflowSystem: "EHR pre-visit",
        estimatedImpact: "~290 closure opportunities",
        estimatedImpactValue: 290,
        resourceNeed: "Low",
        automationSummary: "Order prompts are auto-inserted into wellness visit prep workflow.",
        criteria: ["Screening overdue", "Upcoming wellness/PCP appointment", "No pending colorectal order"],
        ctaLabel: "Confirm pre-visit prompts",
      },
      {
        id: "crc-nav",
        name: "Navigation Assistance",
        patientCount: 399,
        cohortDescription: "Members with social/transport barriers likely to miss colonoscopy or lab handoff completion.",
        recommendedAction: "Route to navigation team for transport, scheduling, and prep-support calls.",
        primaryOwner: "Navigation Team",
        workflowSystem: "Navigation task queue",
        estimatedImpact: "~162 incremental completions",
        estimatedImpactValue: 162,
        resourceNeed: "High",
        automationSummary: "Barrier-detection logic auto-assigns members to navigator worklists.",
        criteria: ["High SDOH or transport barrier", "Prior incomplete screening workflow", "Overdue status"],
        ctaLabel: "Start navigation plan",
      },
      {
        id: "crc-manual",
        name: "Clinical Exclusion Review",
        patientCount: 321,
        cohortDescription: "Members likely requiring exclusion validation or chart abstraction before outreach.",
        recommendedAction: "Queue chart-abstraction review and documentation correction workflow.",
        primaryOwner: "Quality Abstractors",
        workflowSystem: "Chart review workflow",
        estimatedImpact: "~120 denominator corrections/closures",
        estimatedImpactValue: 120,
        resourceNeed: "High",
        automationSummary: "Potential exclusion charts are auto-queued for abstraction validation.",
        criteria: ["Potential exclusion evidence in chart", "Conflicting data sources", "Open care gap persists"],
        ctaLabel: "Queue manual review",
      },
    ],
  },
  "flu-shot": {
    measureId: "flu-shot",
    measureName: "Annual Flu Vaccination",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary: "2,272 members remain to target. Outreach timing and pharmacy accessibility are the dominant closure levers.",
    currentPerformance: 73,
    targetPerformance: 81,
    patientsToTarget: 2272,
    metPatientCount: 20720,
    totalScorablePatients: 28400,
    compositeScoreImpactPct: 2.8,
    estimatedFinancialImpact: "$408,960",
    kpis: [
      { label: "Current Performance", value: "73%", delta: "↓ 1.1% MoM" },
      { label: "Patients to Target", value: "2,272", delta: "↑ 1.8% MoM" },
      { label: "Met Patient Count", value: "20,720", delta: "↑ 0.5% MoM" },
      { label: "Total Eligible Population", value: "28,400", delta: "↑ 0.3% MoM" },
      { label: "Target", value: "81%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "2.8%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(79.5, 73, 81, 3),
    cohorts: [
      {
        id: "flu-outreach",
        name: "Seasonal Outreach Candidates",
        patientCount: 1016,
        cohortDescription: "Unvaccinated members with valid digital contacts and no recent campaign completion.",
        recommendedAction: "Launch SMS/email vaccine reminders with direct scheduling links.",
        primaryOwner: "Outreach Team",
        workflowSystem: "CRM campaigns",
        estimatedImpact: "~410 expected vaccinations",
        estimatedImpactValue: 410,
        resourceNeed: "Medium",
        automationSummary: "Digital campaign waves are auto-personalized by channel preference.",
        criteria: ["No flu vaccine this season", "Reachable contact channels", "No completed outreach in 30 days"],
        ctaLabel: "Create outreach campaign",
      },
      {
        id: "flu-visit",
        name: "Upcoming Visit Vaccination Prompt",
        patientCount: 654,
        cohortDescription: "Members with upcoming encounters where flu vaccine can be offered at point of care.",
        recommendedAction: "Auto-insert visit vaccine prompt and standing order reminder.",
        primaryOwner: "Provider Ops",
        workflowSystem: "EHR standing order",
        estimatedImpact: "~302 likely vaccinations",
        estimatedImpactValue: 302,
        resourceNeed: "Low",
        automationSummary: "Standing-order prompts are auto-added to eligible encounters.",
        criteria: ["Upcoming visit in 45 days", "No vaccine recorded", "No contraindication flag"],
        ctaLabel: "Confirm standing-order prompts",
      },
      {
        id: "flu-pharmacy",
        name: "Pharmacy Access Routing",
        patientCount: 378,
        cohortDescription: "Members with primary-care access friction better suited for pharmacy-based closure.",
        recommendedAction: "Route to in-network pharmacy vaccination workflow and send pharmacy locator.",
        primaryOwner: "Care Navigation",
        workflowSystem: "Pharmacy connector",
        estimatedImpact: "~149 expected vaccinations",
        estimatedImpactValue: 149,
        resourceNeed: "Medium",
        automationSummary: "In-network pharmacy routing and locator links are auto-delivered.",
        criteria: ["No PCP visit access", "In-network pharmacy available", "Open flu gap"],
        ctaLabel: "Route to pharmacy workflow",
      },
      {
        id: "flu-hesitancy",
        name: "Vaccine Education Queue",
        patientCount: 224,
        cohortDescription: "Members with prior refusal/hesitancy indicators requiring clinician-assisted counseling.",
        recommendedAction: "Assign targeted education and shared decision-making outreach script.",
        primaryOwner: "Care Management",
        workflowSystem: "Education workflow",
        estimatedImpact: "~84 conversion opportunities",
        estimatedImpactValue: 84,
        resourceNeed: "High",
        automationSummary: "Hesitancy markers auto-route members into counseling scripts and follow-up cadence.",
        criteria: ["Historical refusal/hesitancy markers", "No documented contraindication", "Open flu gap"],
        ctaLabel: "Assign education workflow",
      },
    ],
  },
  "statin-adherence": {
    measureId: "statin-adherence",
    measureName: "Statin Adherence",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary:
      "853 members remain to target for statin adherence thresholds. Refill delay and affordability barriers drive most unresolved gaps.",
    currentPerformance: 76,
    targetPerformance: 83,
    patientsToTarget: 853,
    metPatientCount: 9270,
    totalScorablePatients: 12190,
    compositeScoreImpactPct: 2.3,
    estimatedFinancialImpact: "$264,430",
    kpis: [
      { label: "Current Performance", value: "76%", delta: "↑ 0.4% MoM" },
      { label: "Patients to Target", value: "853", delta: "↑ 1.2% MoM" },
      { label: "Met Patient Count", value: "9,270", delta: "↑ 0.7% MoM" },
      { label: "Total Eligible Population", value: "12,190", delta: "↑ 0.2% MoM" },
      { label: "Target", value: "83%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "2.3%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(81.7, 76, 83, 3),
    cohorts: [
      {
        id: "statin-refill",
        name: "Refill Gap Outreach",
        patientCount: 332,
        cohortDescription: "Members with imminent refill lapse and no automatic refill enabled.",
        recommendedAction: "Start refill outreach campaign with one-click refill links and reminder cadence.",
        primaryOwner: "Pharmacy Ops",
        workflowSystem: "Pharmacy outreach",
        estimatedImpact: "~162 adherence recoveries",
        estimatedImpactValue: 162,
        resourceNeed: "Medium",
        automationSummary: "Refill-risk members are auto-enrolled in refill reminder campaigns.",
        criteria: ["PDC trending below threshold", "Refill due in <14 days", "No auto-refill active"],
        ctaLabel: "Launch refill campaign",
      },
      {
        id: "statin-afford",
        name: "Affordability Support",
        patientCount: 211,
        cohortDescription: "Members with likely copay/coverage barriers impacting refill persistence.",
        recommendedAction: "Route to benefit support and copay-assistance workflow.",
        primaryOwner: "Benefits Navigation",
        workflowSystem: "Benefits connector",
        estimatedImpact: "~87 adherence recoveries",
        estimatedImpactValue: 87,
        resourceNeed: "High",
        automationSummary: "Coverage barrier signals auto-trigger affordability workflow tasks.",
        criteria: ["High out-of-pocket exposure", "Recent abandoned claim", "Adherence decline"],
        ctaLabel: "Start affordability workflow",
      },
      {
        id: "statin-provider",
        name: "Provider Medication Review",
        patientCount: 189,
        cohortDescription: "Members with side-effect or tolerance signals needing clinician review.",
        recommendedAction: "Queue provider review for alternative statin/intensity and side-effect counseling.",
        primaryOwner: "Provider Team",
        workflowSystem: "Medication review queue",
        estimatedImpact: "~74 adherence recoveries",
        estimatedImpactValue: 74,
        resourceNeed: "Medium",
        automationSummary: "Tolerance/adverse-effect flags auto-queue provider review with context.",
        criteria: ["Documented intolerance signals", "Medication change history", "Subthreshold adherence"],
        ctaLabel: "Queue med review",
      },
      {
        id: "statin-caremgmt",
        name: "High-risk Longitudinal Support",
        patientCount: 121,
        cohortDescription: "Members with persistent nonadherence and high ASCVD risk requiring active management.",
        recommendedAction: "Enroll in high-risk care management pathway with pharmacist touchpoints.",
        primaryOwner: "Care Management",
        workflowSystem: "CM registry",
        estimatedImpact: "~52 adherence recoveries",
        estimatedImpactValue: 52,
        resourceNeed: "High",
        automationSummary: "High-risk nonadherence cohorts are auto-assigned into CM pathways.",
        criteria: ["High cardiovascular risk", "Multiple refill gaps", "Limited engagement history"],
        ctaLabel: "Enroll in CM pathway",
      },
    ],
  },
  "breast-screen": {
    measureId: "breast-screen",
    measureName: "Breast Cancer Screening",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary:
      "972 members remain to target. Timely scheduling and imaging access are the primary barriers to closure.",
    currentPerformance: 67,
    targetPerformance: 73,
    patientsToTarget: 972,
    metPatientCount: 10850,
    totalScorablePatients: 16210,
    compositeScoreImpactPct: 2.1,
    estimatedFinancialImpact: "$252,720",
    kpis: [
      { label: "Current Performance", value: "67%", delta: "↓ 0.8% MoM" },
      { label: "Patients to Target", value: "972", delta: "↑ 1.4% MoM" },
      { label: "Met Patient Count", value: "10,850", delta: "↑ 0.6% MoM" },
      { label: "Total Eligible Population", value: "16,210", delta: "↑ 0.2% MoM" },
      { label: "Target", value: "73%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "2.1%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(71.3, 67, 73, 3),
    cohorts: [
      {
        id: "mammo-outreach",
        name: "Scheduling Outreach",
        patientCount: 413,
        cohortDescription: "Eligible members overdue for mammography with no future imaging appointment.",
        recommendedAction: "Launch scheduling campaign with imaging-center direct booking links.",
        primaryOwner: "Preventive Outreach",
        workflowSystem: "CRM + imaging scheduling",
        estimatedImpact: "~188 expected completed screenings",
        estimatedImpactValue: 188,
        resourceNeed: "Medium",
        automationSummary: "Scheduling campaigns and booking links are auto-launched by eligibility.",
        criteria: ["Overdue status", "No mammogram appointment in next 90 days", "Contact channel available"],
        ctaLabel: "Launch scheduling campaign",
      },
      {
        id: "mammo-previsit",
        name: "Pre-visit Screening Prompt",
        patientCount: 287,
        cohortDescription: "Members with upcoming primary-care visits where mammogram order can be facilitated.",
        recommendedAction: "Send provider pre-visit prompt to place mammography order and counsel closure.",
        primaryOwner: "Provider Ops",
        workflowSystem: "EHR pre-visit note",
        estimatedImpact: "~136 likely order conversions",
        estimatedImpactValue: 136,
        resourceNeed: "Low",
        automationSummary: "Provider prompts are auto-generated for upcoming visits.",
        criteria: ["Overdue measure", "Upcoming PCP visit", "No active imaging order"],
        ctaLabel: "Confirm provider prompts",
      },
      {
        id: "mammo-access",
        name: "Imaging Access Friction",
        patientCount: 169,
        cohortDescription: "Members with geography/network barriers to completing imaging in timeframe.",
        recommendedAction: "Route to navigation for in-network imaging alternatives and transportation support.",
        primaryOwner: "Navigation Team",
        workflowSystem: "Navigation queue",
        estimatedImpact: "~73 completed screenings",
        estimatedImpactValue: 73,
        resourceNeed: "High",
        automationSummary: "Access-friction cohorts are auto-triaged into navigation pathways.",
        criteria: ["Distance barrier", "Narrow network imaging availability", "Unclosed measure"],
        ctaLabel: "Start access workflow",
      },
      {
        id: "mammo-manual",
        name: "External Result Retrieval",
        patientCount: 103,
        cohortDescription: "Members likely completed screening externally with missing result integration.",
        recommendedAction: "Queue result retrieval and abstraction workflow to close data capture gap.",
        primaryOwner: "Quality Abstraction",
        workflowSystem: "Result retrieval workflow",
        estimatedImpact: "~41 denominator/closure updates",
        estimatedImpactValue: 41,
        resourceNeed: "Medium",
        automationSummary: "External-result mismatch cases are auto-routed for retrieval.",
        criteria: ["Likely outside imaging", "Incomplete claims signal", "No structured result in chart"],
        ctaLabel: "Queue result retrieval",
      },
    ],
  },
  "followup-hosp": {
    measureId: "followup-hosp",
    measureName: "Follow-up After Hospitalization",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary:
      "1,010 members remain to target. The highest-yield opportunities are discharge follow-up scheduling and 7-day completion workflows.",
    currentPerformance: 72,
    targetPerformance: 84,
    patientsToTarget: 1010,
    metPatientCount: 6062,
    totalScorablePatients: 8420,
    compositeScoreImpactPct: 3.3,
    estimatedFinancialImpact: "$262,600",
    kpis: [
      { label: "Current Performance", value: "72%", delta: "↑ 0.5% MoM" },
      { label: "Patients to Target", value: "1,010", delta: "↑ 1.6% MoM" },
      { label: "Met Patient Count", value: "6,062", delta: "↑ 0.7% MoM" },
      { label: "Total Eligible Population", value: "8,420", delta: "↑ 0.2% MoM" },
      { label: "Target", value: "84%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "3.3%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(79.2, 72, 84, 3),
    cohorts: [
      {
        id: "hosp-discharge-outreach",
        name: "Discharge Outreach Within 48 Hours",
        patientCount: 382,
        cohortDescription: "Recently discharged members without a follow-up appointment scheduled in 7 days.",
        recommendedAction: "Launch immediate outreach with one-click scheduling and care-transition scripts.",
        primaryOwner: "Transitions of Care",
        workflowSystem: "TOC outreach queue",
        estimatedImpact: "~176 expected follow-up completions",
        estimatedImpactValue: 176,
        resourceNeed: "Medium",
        automationSummary: "Discharge feeds auto-trigger outreach and appointment offers.",
        criteria: ["Discharge in last 48h", "No 7-day follow-up", "High readmit risk"],
        ctaLabel: "Launch TOC outreach",
      },
      {
        id: "hosp-pcp-capacity",
        name: "PCP/Virtual Follow-up Routing",
        patientCount: 341,
        cohortDescription: "Members with no in-person slot availability who can be completed through virtual follow-up.",
        recommendedAction: "Auto-route to virtual transition visits and reserve overflow PCP blocks.",
        primaryOwner: "Provider Access Ops",
        workflowSystem: "Access routing workflow",
        estimatedImpact: "~148 expected completions",
        estimatedImpactValue: 148,
        resourceNeed: "Low",
        automationSummary: "Capacity-aware routing auto-assigns in-person vs virtual follow-up.",
        criteria: ["No PCP slot <7 days", "Virtual-eligible", "Open follow-up gap"],
        ctaLabel: "Enable routing workflow",
      },
      {
        id: "hosp-nav-barriers",
        name: "Post-discharge Barrier Navigation",
        patientCount: 201,
        cohortDescription: "Members with transportation or caregiver barriers delaying post-discharge follow-up.",
        recommendedAction: "Route to navigation team for transport and caregiver support coordination.",
        primaryOwner: "Navigation Team",
        workflowSystem: "Navigation support queue",
        estimatedImpact: "~83 expected completions",
        estimatedImpactValue: 83,
        resourceNeed: "High",
        automationSummary: "Barrier signals auto-route members into navigator worklists.",
        criteria: ["Recent discharge", "Transport/caregiver barrier", "Open follow-up gap"],
        ctaLabel: "Start navigation support",
      },
    ],
  },
  "copd-controller": {
    measureId: "copd-controller",
    measureName: "COPD Controller Medication Adherence",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary:
      "797 members remain to target. Refill persistence and inhaler-technique reinforcement are key closure levers.",
    currentPerformance: 68,
    targetPerformance: 80,
    patientsToTarget: 797,
    metPatientCount: 4515,
    totalScorablePatients: 6640,
    compositeScoreImpactPct: 2.9,
    estimatedFinancialImpact: "$247,070",
    kpis: [
      { label: "Current Performance", value: "68%", delta: "↑ 0.4% MoM" },
      { label: "Patients to Target", value: "797", delta: "↑ 1.3% MoM" },
      { label: "Met Patient Count", value: "4,515", delta: "↑ 0.5% MoM" },
      { label: "Total Eligible Population", value: "6,640", delta: "↑ 0.2% MoM" },
      { label: "Target", value: "80%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "2.9%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(74.5, 68, 80, 3),
    cohorts: [
      {
        id: "copd-refill-risk",
        name: "Controller Refill Risk",
        patientCount: 306,
        cohortDescription: "Members with controller refill gaps and no automatic refill enrollment.",
        recommendedAction: "Launch refill outreach with pharmacy handoff and adherence reminders.",
        primaryOwner: "Pharmacy Ops",
        workflowSystem: "Pharmacy adherence queue",
        estimatedImpact: "~142 expected adherence recoveries",
        estimatedImpactValue: 142,
        resourceNeed: "Medium",
        automationSummary: "Refill-risk members are auto-enrolled in adherence outreach.",
        criteria: ["PDC below threshold", "Refill due <14 days", "No auto-refill"],
        ctaLabel: "Launch refill outreach",
      },
      {
        id: "copd-inhaler-technique",
        name: "Inhaler Technique Reinforcement",
        patientCount: 271,
        cohortDescription: "Members with frequent rescue use and suspected controller underuse/technique issues.",
        recommendedAction: "Route to RN/pharmacist coaching for inhaler technique and adherence counseling.",
        primaryOwner: "Care Management",
        workflowSystem: "RN coaching workflow",
        estimatedImpact: "~118 expected adherence recoveries",
        estimatedImpactValue: 118,
        resourceNeed: "High",
        automationSummary: "High-rescue-use cohorts auto-route to coaching protocols.",
        criteria: ["High rescue med utilization", "Controller adherence risk", "Open measure gap"],
        ctaLabel: "Start coaching workflow",
      },
      {
        id: "copd-provider-review",
        name: "Provider Regimen Optimization",
        patientCount: 143,
        cohortDescription: "Members needing regimen simplification or therapeutic substitution to improve persistence.",
        recommendedAction: "Queue provider/pharmacist regimen review with simplified plan recommendations.",
        primaryOwner: "Clinical Pharmacy",
        workflowSystem: "Medication optimization queue",
        estimatedImpact: "~61 expected adherence recoveries",
        estimatedImpactValue: 61,
        resourceNeed: "Medium",
        automationSummary: "Regimen optimization opportunities are auto-scored and queued.",
        criteria: ["Multiple controller changes", "Adherence decline", "Persistent open gap"],
        ctaLabel: "Queue regimen review",
      },
    ],
  },
  "ed-avoidance": {
    measureId: "ed-avoidance",
    measureName: "Avoidable Emergency Department Utilization",
    lastUpdated: "3/11/2026, 9:20 PM PDT",
    contextualSummary:
      "3,482 members remain to target. The largest opportunities are frequent low-acuity utilizers without timely outpatient follow-up pathways.",
    currentPerformance: 64,
    targetPerformance: 78,
    patientsToTarget: 3482,
    metPatientCount: 15910,
    totalScorablePatients: 24860,
    compositeScoreImpactPct: 4.8,
    estimatedFinancialImpact: "$905,320",
    kpis: [
      { label: "Current Performance", value: "64%", delta: "↓ 1.4% MoM" },
      { label: "Patients to Target", value: "3,482", delta: "↑ 2.2% MoM" },
      { label: "Met Patient Count", value: "15,910", delta: "↑ 0.5% MoM" },
      { label: "Total Eligible Population", value: "24,860", delta: "↑ 0.3% MoM" },
      { label: "Target", value: "78%", delta: "Scorecard target" },
      { label: "Composite Impact", value: "4.8%", delta: "If target is achieved" },
    ],
    trend: realisticTrendSeries(71.1, 64, 78, 3),
    cohorts: [
      {
        id: "ed-caremgmt-enrollment",
        name: "Care Management Enrollment",
        patientCount: 1560,
        cohortDescription:
          "Top 10% highest-risk members with repeated avoidable ED signals and complex chronic burden who need longitudinal intervention.",
        recommendedAction:
          "Auto-enroll the top 10% highest-risk members into care management with RN assignment, pharmacist review, and 30-day stabilization touchpoints.",
        primaryOwner: "Care Management",
        workflowSystem: "Care management registry + Oracle Fusion capacity routing",
        estimatedImpact: "~690 avoidable ED reductions and quality closures",
        estimatedImpactValue: 690,
        resourceNeed: "Medium",
        automationSummary: "Quality + Resources agents auto-assign members to available care managers using Oracle Fusion capacity signals.",
        criteria: [
          "Top decile avoidable ED risk score",
          "2+ low-acuity ED visits in 6 months",
          "Open utilization or follow-up quality gap",
        ],
        ctaLabel: "Auto-enroll care management cohort",
      },
      {
        id: "ed-frequent-utilizers",
        name: "Frequent Low-Acuity ED Utilizers",
        patientCount: 1418,
        cohortDescription: "Members with repeated low-acuity ED visits and no attributed urgent primary-care pathway.",
        recommendedAction: "Launch high-touch outreach to assign urgent PCP access and after-hours alternatives.",
        primaryOwner: "Population Health Ops",
        workflowSystem: "ED diversion workflow",
        estimatedImpact: "~612 avoidable ED reductions",
        estimatedImpactValue: 612,
        resourceNeed: "High",
        automationSummary: "Frequent-utilizer cohorts are auto-prioritized for diversion outreach.",
        criteria: ["2+ low-acuity ED visits", "No recent PCP follow-up", "Open avoidable ED gap"],
        ctaLabel: "Launch diversion outreach",
      },
      {
        id: "ed-post-ed-followup",
        name: "Post-ED Follow-up Scheduling",
        patientCount: 1126,
        cohortDescription: "Members with recent ED discharge and no follow-up appointment in 7 days.",
        recommendedAction: "Auto-schedule post-ED follow-up via centralized call center and digital self-scheduling.",
        primaryOwner: "Transitions of Care",
        workflowSystem: "Post-ED follow-up queue",
        estimatedImpact: "~508 avoidable ED reductions",
        estimatedImpactValue: 508,
        resourceNeed: "Medium",
        automationSummary: "Post-ED discharge triggers auto-create scheduling tasks.",
        criteria: ["ED discharge in 7 days", "No PCP follow-up", "Attributed member"],
        ctaLabel: "Start post-ED scheduling",
      },
      {
        id: "ed-access-friction",
        name: "Access Friction & Navigation",
        patientCount: 684,
        cohortDescription: "Members with transportation, language, or network barriers driving avoidable ED use.",
        recommendedAction: "Route to navigation support with transport, language, and urgent access handoff.",
        primaryOwner: "Navigation Team",
        workflowSystem: "Barrier-resolution workflow",
        estimatedImpact: "~286 avoidable ED reductions",
        estimatedImpactValue: 286,
        resourceNeed: "High",
        automationSummary: "Barrier indicators auto-route members to navigator playbooks.",
        criteria: ["Known access barriers", "Recent avoidable ED use", "No outpatient closure"],
        ctaLabel: "Start barrier-resolution workflow",
      },
    ],
  },
};

function parseCurrencyToNumber(value: string) {
  const sanitized = value.replace(/[^0-9.-]/g, "");
  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resourceMultiplier(resourceNeed: CohortResourceNeed | undefined) {
  if (resourceNeed === "Low") return 1.25;
  if (resourceNeed === "High") return 0.8;
  return 1;
}

function expectedTierLabelFromClosures(closureCount: number, patientsToTarget: number) {
  const ratio = closureCount / Math.max(1, patientsToTarget);
  if (ratio >= 0.26) return "Tier 2 (target attainment)";
  if (ratio >= 0.14) return "Tier 1 (stabilize trajectory)";
  return "Tier 1 (incremental lift)";
}

function finalizeInsight(insight: MeasureActionInsight): MeasureActionInsight {
  const estimatedFinancialImpactValue =
    insight.estimatedFinancialImpactValue ?? parseCurrencyToNumber(insight.estimatedFinancialImpact);

  const currentPerformanceImpact = Math.round(estimatedFinancialImpactValue * 0.62);
  const maxIncentive = Math.round(estimatedFinancialImpactValue * 1.42);
  const financialModel =
    insight.financialModel ??
    buildFinancialModel(
      insight.currentPerformance,
      insight.targetPerformance,
      currentPerformanceImpact,
      maxIncentive
    );

  const perClosureValue =
    (financialModel.tiers[1]?.incrementalImpact ?? Math.round(estimatedFinancialImpactValue * 0.45)) /
    Math.max(1, insight.patientsToTarget);

  return {
    ...insight,
    estimatedFinancialImpactValue,
    financialModel,
    cohorts: insight.cohorts.map((cohort) => {
      const expectedClosures = cohort.estimatedImpactValue ?? Math.round(cohort.patientCount * 0.45);
      const incrementalFinancialImpact = Math.round(expectedClosures * perClosureValue);
      return {
        ...cohort,
        incrementalFinancialImpact,
        expectedTierLabel: expectedTierLabelFromClosures(expectedClosures, insight.patientsToTarget),
        efficiencyScore: Math.round(expectedClosures * resourceMultiplier(cohort.resourceNeed)),
      };
    }),
  };
}

const insightsByMeasure = Object.fromEntries(
  Object.entries(baseInsightsByMeasure).map(([measureId, insight]) => [
    measureId,
    finalizeInsight(insight),
  ])
) as Record<SupportedMeasureInsightId, MeasureActionInsight>;

const measureAliases: Record<string, SupportedMeasureInsightId> = {
  "a1c-control": "a1c-control",
  "diabetes a1c control": "a1c-control",
  "colorectal-screen": "colorectal-screen",
  "colorectal cancer screening": "colorectal-screen",
  "bp-control": "bp-control",
  "controlling high blood pressure": "bp-control",
  "blood pressure": "bp-control",
  "flu-shot": "flu-shot",
  "flu vaccination": "flu-shot",
  "statin-adherence": "statin-adherence",
  "statin adherence": "statin-adherence",
  "breast-screen": "breast-screen",
  "breast cancer screening": "breast-screen",
  "followup-hosp": "followup-hosp",
  "follow-up after hospitalization": "followup-hosp",
  "copd-controller": "copd-controller",
  "copd controller medication adherence": "copd-controller",
  "ed-avoidance": "ed-avoidance",
  "avoidable emergency department utilization": "ed-avoidance",
};

export function getRankedCohortsForMeasure(measureId: string | null | undefined) {
  const insight = getMeasureActionInsightById(measureId);
  if (!insight) return [];
  return [...insight.cohorts].sort(
    (a, b) =>
      (b.efficiencyScore ?? 0) - (a.efficiencyScore ?? 0) ||
      (b.estimatedImpactValue ?? 0) - (a.estimatedImpactValue ?? 0)
  );
}

export function getTopSuggestedActionForMeasure(measureId: string | null | undefined) {
  return getRankedCohortsForMeasure(measureId)[0] ?? null;
}

export function getMeasureActionInsightById(measureId: string | null | undefined) {
  if (!measureId) return null;
  const normalized = measureId.toLowerCase().trim();
  const resolved = (measureAliases[normalized] ?? normalized) as SupportedMeasureInsightId;
  return insightsByMeasure[resolved] ?? null;
}

export function inferMeasureInsightFromPrompt(prompt: string) {
  const lower = prompt.toLowerCase();
  const matched = (Object.keys(measureAliases) as Array<keyof typeof measureAliases>).find((alias) =>
    lower.includes(alias)
  );

  if (!matched) return null;
  return insightsByMeasure[measureAliases[matched]];
}
