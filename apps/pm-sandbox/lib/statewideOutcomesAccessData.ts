export interface HotspotSummary {
  id: string;
  countyGroupLabel: string;
  conditionFocus: string;
  counties: string[];
  edTrendPct: number;
  avoidableAdmitsTrendPct: number;
  qualityDeltaPct: number;
}

export interface FrictionSignals {
  paDelayRatePct: number;
  stepTherapyFailureRatePct: number;
  abandonmentProxyPct: number;
  timeToTherapyDays: number;
}

export interface CohortDefinition {
  name: string;
  adultsWithDiabetes: boolean;
  repeatedEdThreshold: number;
  nonAdherenceRisk: boolean;
  therapyIntensification: boolean;
}

export interface CountyCohortCount {
  county: string;
  count: number;
}

export interface ScenarioInputs {
  nearRealtimeApproval: boolean;
  autoApproveHours: number;
  exceptionRepeatedEd: boolean;
  exceptionPriorFailure: boolean;
  exceptionComorbidity: boolean;
}

export interface ScenarioOutput {
  abandonmentReductionPct: number;
  adherenceLiftPct: number;
  edReductionPct: number;
  admitsReductionPct: number;
  qualityLiftPct: number;
  confidence: "Low" | "Medium" | "High";
}

export interface TopInsightTile {
  id: string;
  label: string;
  value: string | number;
  description: string;
  accent?: string;
  tooltipTitle: string;
  tooltipLines: string[];
}

export const seededHotspots: HotspotSummary[] = [
  {
    id: "diabetes-3-county",
    countyGroupLabel: "3-county diabetes hotspot",
    conditionFocus: "Adults with diabetes",
    counties: ["Cedar", "Pine", "River"],
    edTrendPct: 12,
    avoidableAdmitsTrendPct: 9,
    qualityDeltaPct: -6,
  },
  {
    id: "copd-north",
    countyGroupLabel: "North COPD cluster",
    conditionFocus: "COPD complex cohort",
    counties: ["Northfield", "Aspen"],
    edTrendPct: 7,
    avoidableAdmitsTrendPct: 5,
    qualityDeltaPct: -2,
  },
];

export const seededFriction: Record<string, FrictionSignals> = {
  "diabetes-3-county": {
    paDelayRatePct: 28,
    stepTherapyFailureRatePct: 19,
    abandonmentProxyPct: 14,
    timeToTherapyDays: 24,
  },
  "copd-north": {
    paDelayRatePct: 19,
    stepTherapyFailureRatePct: 11,
    abandonmentProxyPct: 8,
    timeToTherapyDays: 16,
  },
};

export const seededTopInsights: TopInsightTile[] = [
  {
    id: "hotspots-flagged",
    label: "Hotspots flagged (30d)",
    value: seededHotspots.length,
    description: "Aggregated only",
    tooltipTitle: "What is a hotspot?",
    tooltipLines: [
      "A hotspot is a county/segment with above-baseline utilization or outcome drift.",
      "Flagged when ED/admission/quality signals exceed configured thresholds.",
      "Computed from aggregated, de-identified claims + authorization signals over the last 30 days.",
      "Compared against each county's prior baseline and statewide peer bands.",
    ],
  },
  {
    id: "rising-ed",
    label: "Counties with rising ED",
    value: 3,
    description: "De-identified",
    accent: "text-amber-700",
    tooltipTitle: "What does rising ED mean?",
    tooltipLines: [
      "ED = emergency department visits per attributed population.",
      "Rising means the county trend is increasing versus recent baseline.",
      "Derived from aggregated, de-identified utilization feeds over the last 30 days.",
      "Rolled up at county level; no member-level or provider-level display.",
    ],
  },
  {
    id: "declining-diabetes-quality",
    label: "Declining diabetes quality",
    value: "-6%",
    description: "Measure delta",
    accent: "text-rose-700",
    tooltipTitle: "What is diabetes quality delta?",
    tooltipLines: [
      "Shows directional change in diabetes quality measures versus baseline.",
      "Negative values indicate lower performance on selected measure set.",
      "Estimated from aggregated de-identified quality and utilization indicators.",
      "County-level rollup with trend smoothing to reduce week-to-week noise.",
    ],
  },
  {
    id: "pa-delay-signal",
    label: "High PA delay signal",
    value: "28%",
    description: "Median hotspot",
    accent: "text-cyan-700",
    tooltipTitle: "What is PA delay?",
    tooltipLines: [
      "PA = prior authorization; delay reflects slower-than-target approval turnaround.",
      "Signal indicates elevated lag from request to determination or therapy start.",
      "Computed from aggregated authorization timing + claims event timestamps.",
      "Compared against prior baseline and summarized as a hotspot-level median.",
    ],
  },
  {
    id: "step-therapy-friction",
    label: "High step-therapy friction",
    value: "19%",
    description: "Median hotspot",
    accent: "text-indigo-700",
    tooltipTitle: "What is step-therapy friction?",
    tooltipLines: [
      "Step-therapy friction reflects repeated first-line failures before needed therapy access.",
      "Higher values suggest more administrative/clinical progression barriers.",
      "Estimated using aggregated de-identified claims + authorization pathways.",
      "County-level rollup over the last 30 days versus each region's prior baseline.",
    ],
  },
];

export function getHotspotById(id: string) {
  return seededHotspots.find((item) => item.id === id);
}

export function buildCountyCohortCounts(definition: CohortDefinition): CountyCohortCount[] {
  const base = [
    { county: "Cedar", count: 420 },
    { county: "Pine", count: 350 },
    { county: "River", count: 290 },
  ];

  return base.map((item) => {
    let count = item.count;
    count += (definition.repeatedEdThreshold - 2) * -24;
    if (!definition.nonAdherenceRisk) count += 80;
    if (!definition.therapyIntensification) count += 40;
    return { county: item.county, count: Math.max(80, count) };
  });
}

export function modelScenarioOutput(type: "A" | "B", inputs: ScenarioInputs): ScenarioOutput {
  if (type === "A") {
    const approvalLift = inputs.nearRealtimeApproval ? 7 : 2;
    const autoApproveLift = Math.max(1, Math.round((48 - inputs.autoApproveHours) / 12));
    return {
      abandonmentReductionPct: approvalLift + autoApproveLift,
      adherenceLiftPct: 4 + approvalLift,
      edReductionPct: 3 + Math.round(approvalLift / 2),
      admitsReductionPct: 2 + Math.round(autoApproveLift / 2),
      qualityLiftPct: 2 + Math.round((approvalLift + autoApproveLift) / 3),
      confidence: "Medium",
    };
  }

  const ruleCount = [inputs.exceptionRepeatedEd, inputs.exceptionPriorFailure, inputs.exceptionComorbidity].filter(Boolean).length;
  return {
    abandonmentReductionPct: 3 + ruleCount * 2,
    adherenceLiftPct: 4 + ruleCount * 2,
    edReductionPct: 2 + ruleCount,
    admitsReductionPct: 2 + ruleCount,
    qualityLiftPct: 2 + ruleCount,
    confidence: ruleCount >= 2 ? "Medium" : "Low",
  };
}
