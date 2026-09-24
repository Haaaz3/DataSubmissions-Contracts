import { Project } from "@/lib/models/project";

export const demoProjects: Project[] = [
  {
    id: "project-ed-reduction",
    name: "ED Utilization Reduction – ED Frequent Utilizers",
    goalType: "ed_utilization",
    status: "active",
    cohortSnapshot: {
      cohortId: "cohort-ed-utilizers",
      cohortVersionHash: "v1-ed-utilizers",
      sizeAtStart: 1480,
      definitionFrozen: true,
      frozenAt: "2025-02-01",
    },
    savedViewSnapshot: {
      synapseRunId: "synapse-seed-ed",
      agentId: "contract_performance",
      agentDisplayName: "Contract Performance Agent",
      savedAt: "2025-02-01",
      summaryMarkdown: "**What we see:** ED utilization remains above target with access friction.\n\n**Why it’s happening:** High-risk overlay + missed follow-ups.\n\n**What to do next:** Stabilize top 25% high utilizers.\n\n**How we’ll know:** ED rate drops after two refreshes.",
      drivers: [
        { label: "Access friction", value: "44% show access barriers", evidenceRefIds: ["cite-2"] },
        { label: "High-risk overlay", value: "410 high-risk members", evidenceRefIds: ["cite-3"] },
      ],
      segments: [
        { name: "Access-barrier high utilizers", size: 410, rationale: "High risk + missed PCP visits", evidenceRefIds: ["cite-2"] },
        { name: "Moderate risk", size: 320, rationale: "Moderate risk with gap backlog", evidenceRefIds: ["cite-1"] },
      ],
      workflows: [
        { title: "ED Frequent Utilizer Outreach & Stabilization", ownerRole: "Care Management Lead", slas: ["Contact 48h", "Follow-up 7d"], metrics: ["reach_rate", "ed_visits_per_1000_mm"] },
      ],
      telemetry: [
        { metricKey: "reach_rate", displayName: "Reach Rate", cadence: "weekly", freshness: "weekly", limitations: ["Synthetic weekly refresh"] },
        { metricKey: "ed_visits_per_1000_mm", displayName: "ED Visits / 1,000", cadence: "claims_lagged", freshness: "claims_lagged", limitations: ["Claims lag"] },
      ],
      citations: [
        { id: "cite-1", label: "Synthetic snapshot", excerpt: "1,480 synthetic members; ED visits 412 per 1,000." },
        { id: "cite-2", label: "Synthetic access signal", excerpt: "44% show access barriers." },
        { id: "cite-3", label: "Synthetic risk mix", excerpt: "High-risk tier 34%." },
      ],
    },
    sharing: {
      visibility: "shared",
      shares: [
        { shareId: "share-1", createdAt: "2025-02-02", createdBy: "Demo User", permission: "view", sharedWithUserId: "Quality Lead" },
      ],
    },
    charter: {
      goalStatement: "Reduce ED visits per 1,000 by stabilizing high-frequency utilizers.",
      primaryKPI: {
        key: "ed_visits_per_1000_mm",
        displayName: "ED Visits / 1,000",
        baseline: 412,
        target: 330,
        direction: "down",
      },
      secondaryKPIs: [
        { key: "repeat_ed_30d_rate", displayName: "Repeat ED 30-day Rate", baseline: 22, target: 16, direction: "down" },
      ],
      timeframe: { startDate: "2025-02-01", endDate: "2025-06-30" },
      owners: {
        executiveSponsor: "A. Rivera",
        clinicalOwner: "D. Patel",
        opsOwner: "M. Nguyen",
        analyticsOwner: "S. Chen",
      },
      leadingIndicators: [
        { key: "reach_rate", displayName: "Reach Rate", baseline: 42, target: 70, direction: "up" },
        { key: "contact_within_48h_rate", displayName: "Contact <48h", baseline: 38, target: 65, direction: "up" },
      ],
      assumptions: [
        "Synthetic outreach capacity of 10 care managers.",
        "Urgent care navigation slots remain available during peak demand.",
      ],
    },
    createdFromAgentRunId: "synapse-seed-ed",
    createdAt: "2025-02-01",
    updatedAt: "2025-03-01",
  },
  {
    id: "project-screening-closure",
    name: "Cancer Screening Gap Closure – Outreach Campaign",
    goalType: "cancer_screening",
    status: "active",
    cohortSnapshot: {
      cohortId: "cohort-screening-gaps",
      cohortVersionHash: "v1-screening-gaps",
      sizeAtStart: 2040,
      definitionFrozen: true,
      frozenAt: "2025-01-20",
    },
    savedViewSnapshot: {
      synapseRunId: "synapse-seed-screening",
      agentId: "quality_care_gap",
      agentDisplayName: "Quality Care Gap Agent",
      savedAt: "2025-01-20",
      summaryMarkdown: "**What we see:** Screening closure rates remain below target.\n\n**Why it’s happening:** Outreach gaps and no-show risk.\n\n**What to do next:** Omnichannel outreach + provider panel micro-campaign.",
      drivers: [
        { label: "Outreach gap", value: "38% missing outreach touch", evidenceRefIds: ["cite-2"] },
      ],
      segments: [
        { name: "No-show risk", size: 520, rationale: "Missed appointments", evidenceRefIds: ["cite-1"] },
      ],
      workflows: [
        { title: "Screening Gap Closure Campaign", ownerRole: "Quality Outreach", slas: ["Outreach 14d"], metrics: ["outreach_completion_rate"] },
      ],
      telemetry: [
        { metricKey: "screening_closure_rate_crc", displayName: "CRC Closure Rate", cadence: "claims_lagged", freshness: "claims_lagged", limitations: ["Claims lag"] },
      ],
      citations: [
        { id: "cite-1", label: "Synthetic snapshot", excerpt: "2,040 synthetic members; closure 58%." },
        { id: "cite-2", label: "Synthetic outreach", excerpt: "38% missing outreach touch." },
      ],
    },
    sharing: {
      visibility: "private",
      shares: [],
    },
    charter: {
      goalStatement: "Increase screening closure rates across CRC, breast, and cervical gaps.",
      primaryKPI: {
        key: "screening_closure_rate_crc",
        displayName: "CRC Closure Rate",
        baseline: 58,
        target: 72,
        direction: "up",
      },
      secondaryKPIs: [
        { key: "screening_closure_rate_breast", displayName: "Breast Closure Rate", baseline: 61, target: 74, direction: "up" },
        { key: "screening_closure_rate_cervical", displayName: "Cervical Closure Rate", baseline: 55, target: 70, direction: "up" },
      ],
      timeframe: { startDate: "2025-01-20", endDate: "2025-07-15" },
      owners: {
        executiveSponsor: "J. Lopez",
        clinicalOwner: "K. Barnes",
        opsOwner: "A. Ortiz",
        analyticsOwner: "R. Singh",
      },
      leadingIndicators: [
        { key: "outreach_completion_rate", displayName: "Outreach Completion", baseline: 46, target: 75, direction: "up" },
        { key: "scheduled_rate", displayName: "Scheduled Rate", baseline: 38, target: 62, direction: "up" },
      ],
      assumptions: [
        "Synthetic outreach center capacity of 3,000 touches/month.",
        "Screening kit supply remains stable.",
      ],
    },
    createdFromAgentRunId: "synapse-seed-screening",
    createdAt: "2025-01-20",
    updatedAt: "2025-02-25",
  },
];