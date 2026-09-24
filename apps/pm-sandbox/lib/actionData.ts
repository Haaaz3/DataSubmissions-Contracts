import { ActionItem } from "@/types/action";

// ---------------------------------------------------------------------------
// Mock action items — each one chains a measurable contract performance gap
// to the population health driver causing it, then a recommended intervention.
//
// Covers At Risk and Off Track contracts.  Ordered by severity of gap.
// ---------------------------------------------------------------------------

export const mockActionItems: ActionItem[] = [
  // ── Off Track: mssp-003 (Pioneer ACO — Southeast) ───────────────────────
  {
    id: "action-001",
    contractId: "mssp-003",
    priority: "High",
    title: "COPD-driven ED spike is the primary PMPM cost driver",
    performanceGap: {
      metric: "PMPM Spend",
      current: "$980 / mo",
      target: "$920 target",
      delta: "$60 over target",
      severity: "critical",
    },
    populationDriver: {
      summary: "COPD high utilization",
      detail: "24% COPD prevalence (1,322 members) driving 388 ED visits per 1,000 — 38% above the 280 ACO benchmark.",
      memberCount: 1322,
    },
    recommendedAction: "Deploy a respiratory disease management program with rescue inhaler protocols and 30-day post-ED follow-up calls for COPD members.",
    estimatedImpact: "~$22 PMPM savings",
    timeToImpact: "90–120 days",
    effort: "High",
    impactTypes: ["Cost", "Utilization"],
  },
  {
    id: "action-002",
    contractId: "mssp-003",
    priority: "High",
    title: "Post-acute readmission rate is nearly double the benchmark",
    performanceGap: {
      metric: "Readmission Rate",
      current: "14.8% (30-day)",
      target: "8% benchmark",
      delta: "6.8 pts above benchmark",
      severity: "critical",
    },
    populationDriver: {
      summary: "Social risk + poor transitions",
      detail: "22% food insecurity and 19% transportation barriers compound weak discharge follow-up — the highest SDOH burden in the portfolio.",
      memberCount: 1432,
    },
    recommendedAction: "Standardise discharge bundles with 48-hour follow-up calls and integrate a community health worker program targeting members with 2+ social risk factors.",
    estimatedImpact: "Reduce readmissions to ~9%",
    timeToImpact: "60–90 days",
    effort: "High",
    impactTypes: ["Cost", "Patient Outcomes", "Utilization"],
  },

  // ── Off Track: ma-004 (United MA Compass — Midwest) ─────────────────────
  {
    id: "action-003",
    contractId: "ma-004",
    priority: "High",
    title: "Uncontrolled diabetes is the largest single cost and quality driver",
    performanceGap: {
      metric: "PMPM Spend",
      current: "$1,240 / mo",
      target: "$1,180 target",
      delta: "$60 over target",
      severity: "critical",
    },
    populationDriver: {
      summary: "Uncontrolled diabetes (A1c gap)",
      detail: "41% diabetes prevalence (3,772 members); only 52% have A1c in control — the lowest rate across all MA contracts.",
      memberCount: 3772,
    },
    recommendedAction: "Launch structured diabetes care management: monthly outreach to members with A1c >9, remote glucometer monitoring for the top 500 highest-risk patients, and PCP co-management protocols.",
    estimatedImpact: "~$18 PMPM savings + 5 quality pts",
    timeToImpact: "60–90 days",
    effort: "High",
    impactTypes: ["Cost", "Quality", "Patient Outcomes"],
  },
  {
    id: "action-004",
    contractId: "ma-004",
    priority: "High",
    title: "High-cost member concentration is escalating without intervention",
    performanceGap: {
      metric: "Quality Score",
      current: "61 / 100",
      target: "80 target",
      delta: "19 pts below target",
      severity: "critical",
    },
    populationDriver: {
      summary: "460 high-cost members unmanaged",
      detail: "5% of members (460) drive a disproportionate share of spend — predominantly CHF, COPD, and CKD patients with no active care management assignment.",
      memberCount: 460,
    },
    recommendedAction: "Assign dedicated care managers to the top 460 high-cost members, co-locate a coordinator at the 3 highest-volume PCPs, and establish weekly check-ins for members with 2+ chronic conditions.",
    estimatedImpact: "~$35 PMPM hospital avoidance",
    timeToImpact: "30–60 days",
    effort: "High",
    impactTypes: ["Cost", "Utilization"],
  },

  // ── At Risk: mssp-001 (ACO REACH — Northeast) ───────────────────────────
  {
    id: "action-005",
    contractId: "mssp-001",
    priority: "High",
    title: "Avoidable ED utilization is pulling PMPM above target",
    performanceGap: {
      metric: "PMPM Spend",
      current: "$910 / mo",
      target: "$875 target",
      delta: "$35 over target",
      severity: "moderate",
    },
    populationDriver: {
      summary: "High-risk members without navigation",
      detail: "964 high-risk members without active care navigation driving 312 ED visits per 1,000 — 11% above the 280 ACO benchmark.",
      memberCount: 964,
    },
    recommendedAction: "Deploy care navigators for the top 200 high-risk members. Focus on ambulatory care-sensitive conditions (CHF, COPD, diabetes) with 30-day post-discharge follow-up protocols.",
    estimatedImpact: "~$15 PMPM savings",
    timeToImpact: "60–90 days",
    effort: "Medium",
    impactTypes: ["Cost", "Utilization"],
  },

  // ── Off Track: comm-001 (Aetna Commercial ACO — Large Employer) ──────────
  {
    id: "action-006",
    contractId: "comm-001",
    priority: "High",
    title: "Behavioral health cost escalation is the primary off-track driver",
    performanceGap: {
      metric: "PMPM Spend",
      current: "$480 / mo",
      target: "$450 target",
      delta: "$30 over target",
      severity: "moderate",
    },
    populationDriver: {
      summary: "BH claims up 22% YoY",
      detail: "Depression (18%) and anxiety (20%) affect 818 members; behavioral health claims grew 22% YoY with no care coordination support in place.",
      memberCount: 818,
    },
    recommendedAction: "Embed a behavioral health navigator and expand EAP-linked telehealth therapy from 8 to 16 sessions annually to divert high-acuity BH utilization from inpatient settings.",
    estimatedImpact: "~$12 PMPM savings",
    timeToImpact: "90–120 days",
    effort: "Medium",
    impactTypes: ["Cost", "Patient Outcomes"],
  },

  // ── At Risk: ma-002 (Humana Gold Plus — Suburban) ───────────────────────
  {
    id: "action-007",
    contractId: "ma-002",
    priority: "Medium",
    title: "Medication non-adherence is threatening the Stars Rating threshold",
    performanceGap: {
      metric: "Quality Score",
      current: "74 / 100",
      target: "80 target",
      delta: "6 pts below target",
      severity: "moderate",
    },
    populationDriver: {
      summary: "Medication adherence below Stars floor",
      detail: "74% adherence rate across 7,840 members — 6 points below the 80% Stars threshold that triggers bonus revenue in 2026.",
      memberCount: 7840,
    },
    recommendedAction: "Implement 90-day automatic refill enrollment and pharmacist-led outreach to 400+ members with identified adherence gaps in statin and ACE inhibitor classes.",
    estimatedImpact: "+2 Stars pts, ~$8 PMPM",
    timeToImpact: "30–60 days",
    effort: "Low",
    impactTypes: ["Quality", "Cost"],
  },

  // ── At Risk: comm-004 (Humana Commercial PCMH — Retail Sector) ───────────
  {
    id: "action-008",
    contractId: "comm-004",
    priority: "Medium",
    title: "Transportation barriers are converting missed visits to ED visits",
    performanceGap: {
      metric: "ED Visits / 1,000",
      current: "355 / 1,000",
      target: "280 benchmark",
      delta: "75 above benchmark",
      severity: "moderate",
    },
    populationDriver: {
      summary: "22% transport barrier rate",
      detail: "900+ members reporting transportation barriers show 40% higher ED utilization — the worst social risk profile in the commercial portfolio.",
      memberCount: 902,
    },
    recommendedAction: "Partner with an NEMT vendor for non-emergency medical transport and expand same-day telehealth access as a complementary option for shift workers.",
    estimatedImpact: "~$10 PMPM savings",
    timeToImpact: "30–60 days",
    effort: "Medium",
    impactTypes: ["Utilization", "Patient Outcomes"],
  },

  // ── On Track but high opportunity: ma-003 (Aetna Medicare — West Coast) ─
  {
    id: "action-009",
    contractId: "ma-003",
    priority: "Medium",
    title: "0.5 Star gap represents a high-ROI quality improvement opportunity",
    performanceGap: {
      metric: "Star Rating",
      current: "4.5 Stars",
      target: "5.0 Stars",
      delta: "0.5 Stars below bonus tier",
      severity: "minor",
    },
    populationDriver: {
      summary: "Breast screening & flu vaccine gaps",
      detail: "Breast cancer screening at 80% and flu vaccination at 78% are the two measures below the 5-Star threshold — affecting 5,120 members.",
      memberCount: 5120,
    },
    recommendedAction: "Run targeted outreach campaigns in October/November for flu vaccination and a mammography reminder program for women aged 50–74.",
    estimatedImpact: "~$45K quality bonus",
    timeToImpact: "30 days",
    effort: "Low",
    impactTypes: ["Quality"],
  },

  // ── On Track but rising risk: comm-005 (BlueCross — Public Sector) ───────
  {
    id: "action-010",
    contractId: "comm-005",
    priority: "Medium",
    title: "Rising-risk members lack care management — escalation risk is building",
    performanceGap: {
      metric: "Rising Risk Members",
      current: "2,025 unmanaged",
      target: "80% enrolled",
      delta: "~1,420 members without programs",
      severity: "minor",
    },
    populationDriver: {
      summary: "SDOH compound rising-risk trajectory",
      detail: "13% food insecurity and 14% transport barriers are accelerating chronic disease progression for members not yet enrolled in care management.",
      memberCount: 2025,
    },
    recommendedAction: "Automate care management enrollment triggers for members meeting 2+ risk criteria, with a 90-day structured touchpoint program and PCP co-management handoff.",
    estimatedImpact: "Prevent ~$25 PMPM escalation",
    timeToImpact: "30–60 days",
    effort: "Medium",
    impactTypes: ["Cost", "Patient Outcomes"],
  },
];

const actionsByContractId = new Map<string, ActionItem[]>();
for (const action of mockActionItems) {
  const current = actionsByContractId.get(action.contractId);
  if (current) current.push(action);
  else actionsByContractId.set(action.contractId, [action]);
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

export function getActionsForContract(contractId: string): ActionItem[] {
  return actionsByContractId.get(contractId) ?? [];
}

/** Return the top N action items sorted by priority then severity. */
export function getTopActions(n = 3): ActionItem[] {
  const priorityOrder  = { High: 0, Medium: 1, Low: 2 };
  const severityOrder  = { critical: 0, moderate: 1, minor: 2 };
  return [...mockActionItems]
    .sort((a, b) => {
      const p = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (p !== 0) return p;
      return severityOrder[a.performanceGap.severity] - severityOrder[b.performanceGap.severity];
    })
    .slice(0, n);
}

export const actionSummary = {
  total:  mockActionItems.length,
  high:   mockActionItems.filter((a) => a.priority === "High").length,
  medium: mockActionItems.filter((a) => a.priority === "Medium").length,
  contractsWithActions: new Set(mockActionItems.map((a) => a.contractId)).size,
};
