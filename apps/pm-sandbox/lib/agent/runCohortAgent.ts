import { demoCohorts, demoMembers } from "@/data/synthetic/cohorts";
import { workflowTemplateLibrary } from "@/data/synthetic/workflowTemplates";
import { AgentRun, TelemetryMetric } from "@/lib/models/agent";
import { GoalType } from "@/lib/models/cohort";
import { makeId } from "@/lib/storage/synapseStore";

const goalToWorkflowTypes: Record<GoalType, string[]> = {
  ed_utilization: ["ed_frequent_utilizer", "ed_diversion"],
  readmissions: ["toc_readmission_bundle", "post_acute_network"],
  cancer_screening: ["screening_campaign", "provider_panel_microcampaign"],
  diabetes: ["diabetes_control", "diabetes_complication_overlay"],
};

function buildCitations(cohortId: string) {
  const cohort = demoCohorts.find((c) => c.id === cohortId);
  return [
    {
      id: "cite-1",
      label: "Synthetic cohort snapshot",
      excerpt: `${cohort?.size ?? 0} synthetic members with ${cohort?.keyMetricLabel ?? "key metrics"} at ${
        cohort?.keyMetricValue ?? 0
      }.`,
    },
    {
      id: "cite-2",
      label: "Synthetic access signals",
      excerpt: "42% of synthetic members show access barriers and no PCP touchpoint in 12 months.",
    },
    {
      id: "cite-3",
      label: "Synthetic risk mix",
      excerpt: "High-risk tier comprises 34% of synthetic cohort members; medium risk 38%.",
    },
  ];
}

export function runCohortAgent(cohortId: string, userPrompt: string): AgentRun {
  const cohort = demoCohorts.find((c) => c.id === cohortId);
  const members = demoMembers.filter((m) => m.cohortId === cohortId);
  if (!cohort) {
    throw new Error("Synthetic cohort not found");
  }

  const highRisk = members.filter((m) => m.riskTier === "high").length;
  const mediumRisk = members.filter((m) => m.riskTier === "medium").length;

  const drivers = [
    {
      label: "Access barriers",
      value: "42% of synthetic members show access or transportation barriers",
      evidenceRefs: ["cite-2"],
    },
    {
      label: "High-risk clinical overlay",
      value: `${highRisk} members classified as high risk with repeat triggers`,
      evidenceRefs: ["cite-3"],
    },
    {
      label: "Cohort KPI gap",
      value: `${cohort.keyMetricLabel} at ${cohort.keyMetricValue} (synthetic) remains above target`,
      evidenceRefs: ["cite-1"],
    },
  ];

  const segments = [
    {
      name: "Access-barrier high utilizers",
      size: Math.round(highRisk * 0.4),
      rationale: "High risk + access barrier signals in synthetic data.",
      evidenceRefs: ["cite-2", "cite-3"],
    },
    {
      name: "Moderate risk with missed touchpoints",
      size: Math.round(mediumRisk * 0.5),
      rationale: "Medium risk members with recent gaps and missed preventive touchpoints.",
      evidenceRefs: ["cite-2"],
    },
    {
      name: "Stabilized members",
      size: Math.max(0, members.length - Math.round(highRisk * 0.4) - Math.round(mediumRisk * 0.5)),
      rationale: "Low risk members with fewer acute signals.",
      evidenceRefs: ["cite-1"],
    },
  ];

  const recommendedWorkflows = workflowTemplateLibrary
    .filter((template) => goalToWorkflowTypes[cohort.goalType].includes(template.type))
    .slice(0, 3)
    .map((template) => ({
      type: template.type,
      title: template.title,
      description: template.description,
      reason: "Matches the cohort goal type and observed synthetic drivers.",
    }));

  const telemetryPlan: TelemetryMetric[] = [
    { key: "reach_rate", label: "Reach Rate", cadence: "weekly", definition: "Percent of members reached within SLA." },
    { key: "followup_within_7d_rate", label: "Follow-up Within 7 Days", cadence: "weekly", definition: "Share of members with follow-up within 7 days." },
    {
      key: cohort.goalType === "cancer_screening" ? "screening_closure_rate_crc" : "ed_visits_per_1000_mm",
      label: cohort.goalType === "cancer_screening" ? "CRC Closure Rate" : "ED Visits / 1,000",
      cadence: "claims_lagged",
      definition: "Outcome metric refreshed monthly with synthetic claims lag.",
      limitations: "Recent months have lower confidence due to lag.",
    },
  ];

  return {
    id: makeId("agentrun"),
    cohortId,
    prompt: userPrompt,
    createdAt: new Date().toISOString(),
    summaryMarkdown: `**What we see:** ${cohort.name} has ${cohort.size} synthetic members. ${cohort.keyMetricLabel} remains elevated at ${cohort.keyMetricValue}.

**Why it's happening:** Access barriers and high-risk overlays are the dominant drivers. Medium-risk segments are missing timely touchpoints.

**What to do next:** Launch the top workflow templates below and monitor leading indicators weekly.

**How we'll know it worked:** Outcome metrics should improve after two monthly refresh cycles.`,
    drivers,
    segments,
    recommendedWorkflows,
    telemetryPlan,
    confidence: 0.74,
    assumptions: [
      "Synthetic cohort definitions remain stable over 90 days.",
      "Operational capacity can reach 65% of cohort within 4 weeks.",
    ],
    limitations: [
      "Outcome metrics are claims-lagged and have lower confidence in recent months.",
      "Synthetic signals do not capture unobserved social risk factors.",
    ],
    citations: buildCitations(cohortId),
  };
}