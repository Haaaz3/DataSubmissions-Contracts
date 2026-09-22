import { demoCohorts, demoMembers } from "@/data/synthetic/cohorts";
import { workflowTemplateLibrary } from "@/data/synthetic/workflowTemplates";
import { SynapseAIRun, SynapseStep, TelemetryMetric } from "@/lib/models/agent";
import { GoalType } from "@/lib/models/cohort";
import { makeId } from "@/lib/storage/synapseStore";
import { SynapseAgentId, getAgentById } from "@/lib/synapseai/agentRegistry";

function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const workflowByGoal: Record<GoalType, string[]> = {
  ed_utilization: ["ed_frequent_utilizer", "ed_diversion"],
  readmissions: ["toc_readmission_bundle", "post_acute_network"],
  cancer_screening: ["screening_campaign", "provider_panel_microcampaign"],
  diabetes: ["diabetes_control", "diabetes_complication_overlay"],
};

export function buildSynapseRun(cohortId: string, prompt: string, agentId: SynapseAgentId): SynapseAIRun {
  const seed = seededRandom(`${cohortId}-${prompt}`);
  const agent = getAgentById(agentId);
  const cohort = demoCohorts.find((c) => c.id === cohortId);
  if (!cohort) throw new Error("Cohort not found");
  const members = demoMembers.filter((m) => m.cohortId === cohortId);

  const steps: SynapseStep[] = [
    "loadCohortProfile",
    "computeBaselineMetrics",
    "segmentCohort",
    "identifyDrivers",
    "recommendWorkflows",
    "assembleTelemetryPlan",
    "draftProjectCharter",
  ].map((name) => ({ name, status: "pending" }));

  const highRisk = members.filter((m) => m.riskTier === "high").length;
  const mediumRisk = members.filter((m) => m.riskTier === "medium").length;
  const churnPct = Math.round(cohort.churnRate * 100);

  const drivers = [
    {
      label: "Access friction",
      value: `${Math.round(seed() * 20 + 35)}% show access barriers`,
      evidenceRefs: ["cite-2"],
    },
    {
      label: "High-risk overlay",
      value: `${highRisk} members classified as high risk`,
      evidenceRefs: ["cite-3"],
    },
    {
      label: "Cohort churn",
      value: `${churnPct}% monthly churn requiring re-engagement`,
      evidenceRefs: ["cite-4"],
    },
  ];

  const segments = [
    {
      name: "Access-barrier high utilizers",
      size: Math.round(highRisk * 0.45),
      rationale: "High risk + access barriers or low PCP touchpoints.",
      evidenceRefs: ["cite-2", "cite-3"],
    },
    {
      name: "Moderate risk with missed touchpoints",
      size: Math.round(mediumRisk * 0.5),
      rationale: "Medium risk with follow-up gaps and missed appointments.",
      evidenceRefs: ["cite-2"],
    },
    {
      name: "Stabilized members",
      size: Math.max(0, members.length - Math.round(highRisk * 0.45) - Math.round(mediumRisk * 0.5)),
      rationale: "Lower utilization but still affected by churn.",
      evidenceRefs: ["cite-1"],
    },
  ];

  const recommendedWorkflows = workflowTemplateLibrary
    .filter((w) => workflowByGoal[cohort.goalType].includes(w.type))
    .map((w) => ({
      type: w.type,
      title: w.title,
      description: w.description,
      reason: "Aligned to cohort goal type and synthetic drivers.",
    }));

  const telemetryPlan: TelemetryMetric[] = [
    {
      key: "reach_rate",
      label: "Reach Rate",
      cadence: "weekly",
      definition: "Percent of members reached within SLA.",
      limitations: "Operational metric, synthetic refresh weekly.",
    },
    {
      key: cohort.goalType === "cancer_screening" ? "screening_closure_rate_crc" : "ed_visits_per_1000_mm",
      label: cohort.goalType === "cancer_screening" ? "CRC Closure Rate" : "ED Visits / 1,000",
      cadence: "claims_lagged",
      definition: "Outcome metric refreshed monthly with claims lag.",
      limitations: "Recent months lower confidence.",
    },
  ];

  const summaryMarkdown = `**What we see:** ${cohort.name} has ${cohort.size} synthetic members. ${cohort.keyMetricLabel} remains at ${cohort.keyMetricValue}.

**Why it's happening:** Access barriers and high-risk overlays drive avoidable utilization. Churn at ${churnPct}% requires continual re-identification.

**What to do next:** Focus on the top workflows and improve reach rate within 30 days.

**How we'll know it worked:** Outcome metrics improve after two monthly refresh cycles.`;

  return {
    id: makeId("synapse-run"),
    cohortId,
    prompt,
    createdAt: new Date().toISOString(),
    agentName: "SynapseAI",
    agentId: agent.id,
    agentDisplayName: agent.displayName,
    steps,
    output: {
      summaryMarkdown,
      drivers,
      segments,
      recommendedWorkflows,
      telemetryPlan,
      projectCharterDraft: {
        goalStatement: `Improve ${cohort.keyMetricLabel.toLowerCase()} for ${cohort.name}.`,
        primaryKPI: {
          key: cohort.goalType === "cancer_screening" ? "screening_closure_rate_crc" : "ed_visits_per_1000_mm",
          displayName: cohort.goalType === "cancer_screening" ? "CRC Closure Rate" : "ED Visits / 1,000",
          baseline: cohort.keyMetricValue,
          target: cohort.goalType === "cancer_screening" ? cohort.keyMetricValue + 12 : cohort.keyMetricValue - 60,
          direction: cohort.goalType === "cancer_screening" ? "up" : "down",
        },
        leadingIndicators: [
          { key: "reach_rate", displayName: "Reach Rate", baseline: 40, target: 70, direction: "up" },
          { key: "followup_within_7d_rate", displayName: "Follow-up Within 7 Days", baseline: 45, target: 68, direction: "up" },
        ],
        timeframeDays: 120,
        assumptions: ["Synthetic operational capacity remains stable."],
      },
      confidence: Number((0.68 + seed() * 0.2).toFixed(2)),
      limitations: ["Claims-lagged metrics refreshed monthly", "Synthetic signals only"],
      citations: [
        {
          id: "cite-1",
          label: "Synthetic cohort snapshot",
          excerpt: `${cohort.size} synthetic members with ${cohort.keyMetricLabel} at ${cohort.keyMetricValue}.`,
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
        {
          id: "cite-4",
          label: "Synthetic churn",
          excerpt: `${churnPct}% synthetic churn indicates drift risk month over month.`,
        },
      ],
    },
  };
}

export async function streamSynapseRun(run: SynapseAIRun, onUpdate: (partial: SynapseAIRun) => void) {
  const now = () => new Date().toISOString();
  const steps = [...run.steps];

  for (let i = 0; i < steps.length; i += 1) {
    steps[i] = { ...steps[i], status: "running", startedAt: now() };
    onUpdate({ ...run, steps });
    await new Promise((resolve) => setTimeout(resolve, 600));
    steps[i] = { ...steps[i], status: "complete", finishedAt: now() };
    onUpdate({ ...run, steps });
  }
}