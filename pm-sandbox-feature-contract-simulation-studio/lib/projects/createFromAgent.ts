import { SynapseAIRun } from "@/lib/models/agent";
import { Cohort } from "@/lib/models/cohort";
import { Project, Task, WorkflowTemplate } from "@/lib/models/project";
import { generateMetricPoints } from "@/lib/metrics/generator";
import { workflowTemplateLibrary } from "@/data/synthetic/workflowTemplates";
import {
  makeId,
  saveAuditEvents,
  saveMetricPoints,
  saveProjects,
  saveTasks,
  saveWorkflowTemplates,
} from "@/lib/storage/synapseStore";

export async function createProjectFromAgent(cohort: Cohort, run: SynapseAIRun) {
  const now = new Date().toISOString().slice(0, 10);
  const project: Project = {
    id: makeId("project"),
    name: `${cohort.name} – SynapseAI Project`,
    goalType: cohort.goalType,
    status: "active",
    cohortSnapshot: {
      cohortId: cohort.id,
      cohortVersionHash: `v1-${cohort.id}`,
      sizeAtStart: cohort.size,
      definitionFrozen: true,
      frozenAt: now,
    },
    savedViewSnapshot: {
      synapseRunId: run.id,
      agentId: run.agentId,
      agentDisplayName: run.agentDisplayName,
      savedAt: now,
      summaryMarkdown: run.output.summaryMarkdown,
      drivers: run.output.drivers.map((driver) => ({
        label: driver.label,
        value: driver.value,
        evidenceRefIds: driver.evidenceRefs,
      })),
      segments: run.output.segments.map((segment) => ({
        name: segment.name,
        size: segment.size,
        rationale: segment.rationale,
        evidenceRefIds: segment.evidenceRefs,
      })),
      workflows: run.output.recommendedWorkflows.map((workflow) => ({
        title: workflow.title,
        ownerRole: "Demo Owner",
        slas: ["Contact within 48 hours", "Follow-up within 7 days"],
        metrics: ["reach_rate", "ed_visits_per_1000_mm"],
      })),
      telemetry: run.output.telemetryPlan.map((metric) => ({
        metricKey: metric.key,
        displayName: metric.label,
        cadence: metric.cadence,
        freshness: metric.cadence === "claims_lagged" ? "claims_lagged" : "weekly",
        limitations: metric.limitations ? [metric.limitations] : [],
      })),
      citations: run.output.citations,
    },
    sharing: {
      visibility: "private",
      shares: [],
    },
    charter: {
      goalStatement: `Improve ${cohort.keyMetricLabel.toLowerCase()} for ${cohort.name}.`,
      primaryKPI: run.output.projectCharterDraft.primaryKPI,
      secondaryKPIs: [],
      timeframe: { startDate: now, endDate: "2025-08-31" },
      owners: {
        executiveSponsor: "Demo Sponsor",
        clinicalOwner: "Demo Clinical Lead",
        opsOwner: "Demo Ops Lead",
        analyticsOwner: "Demo Analyst",
      },
      leadingIndicators: run.output.projectCharterDraft.leadingIndicators,
      assumptions: run.output.projectCharterDraft.assumptions,
    },
    createdFromAgentRunId: run.id,
    projectOrigin: "agent_run",
    createdAt: now,
    updatedAt: now,
  };

  const workflows: WorkflowTemplate[] = workflowTemplateLibrary
    .filter((template) => run.output.recommendedWorkflows.some((w) => w.type === template.type))
    .map((template) => ({
      ...template,
      id: makeId("workflow"),
      projectId: project.id,
      status: "active",
    }));

  const tasks: Task[] = workflows.flatMap((workflow) =>
    Array.from({ length: 10 }).map((_, idx) => ({
      id: makeId("task"),
      projectId: project.id,
      workflowTemplateId: workflow.id,
      title: `Synthetic task ${idx + 1} for ${workflow.title}`,
      assignedRole: workflow.ownerRole,
      dueDate: "2025-04-15",
      status: idx % 5 === 0 ? "blocked" : idx % 3 === 0 ? "done" : "in_progress",
      reasonCode: idx % 5 === 0 ? "Member unreachable" : undefined,
      createdAt: now,
      updatedAt: now,
    }))
  );

  const points = generateMetricPoints(project);

  await saveProjects([project]);
  await saveWorkflowTemplates(workflows);
  await saveTasks(tasks);
  await saveMetricPoints(points);
  await saveAuditEvents([
    {
      id: makeId("audit"),
      entityType: "Project",
      entityId: project.id,
      eventType: "ProjectCreated",
      timestamp: now,
      actor: "Demo User",
      details: `Project created from SynapseAI run ${run.id}.`,
    },
  ]);

  return project;
}