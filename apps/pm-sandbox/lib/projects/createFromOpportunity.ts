import { workflowTemplateLibrary } from "@/data/synthetic/workflowTemplates";
import { generateMetricPoints } from "@/lib/metrics/generator";
import { Project, Task, WorkflowTemplate } from "@/lib/models/project";
import {
  makeId,
  saveAuditEvents,
  saveMetricPoints,
  saveProjects,
  saveTasks,
  saveWorkflowTemplates,
} from "@/lib/storage/synapseStore";
import { Contract, Opportunity } from "@/types/contract";

function inferGoalType(opportunity: Opportunity): Project["goalType"] {
  const text = `${opportunity.title} ${opportunity.description}`.toLowerCase();
  if (text.includes("ed") || text.includes("emergency")) return "ed_utilization";
  if (text.includes("readmission") || text.includes("post-acute")) return "readmissions";
  if (text.includes("diabetes") || text.includes("a1c")) return "diabetes";
  return "cancer_screening";
}

export async function createProjectFromOpportunity(contract: Contract, opportunity: Opportunity) {
  const nowIso = new Date().toISOString();
  const nowDate = nowIso.slice(0, 10);
  const workflowTypes = opportunity.workflowTypes ?? [];

  const project: Project = {
    id: makeId("project"),
    name: `${contract.name} – ${opportunity.title}`,
    goalType: inferGoalType(opportunity),
    status: "active",
    cohortSnapshot: {
      cohortId: `contract-${contract.id}-opportunity`,
      cohortVersionHash: `v1-contract-${contract.id}`,
      sizeAtStart: contract.attributedLives,
      definitionFrozen: true,
      frozenAt: nowDate,
    },
    savedViewSnapshot: {
      synapseRunId: `contract-opportunity-${contract.id}`,
      agentId: "contract_performance",
      agentDisplayName: "Contract Performance Agent",
      savedAt: nowDate,
      summaryMarkdown: opportunity.executiveSummary ?? opportunity.description,
      drivers: [
        { label: "Current PMPM", value: `$${contract.currentPmpm}`, evidenceRefIds: ["contract-kpi"] },
        { label: "Target PMPM", value: `$${contract.targetPmpm}`, evidenceRefIds: ["contract-kpi"] },
        { label: "Current Quality Score", value: `${contract.qualityScore}`, evidenceRefIds: ["contract-kpi"] },
      ],
      segments: [
        {
          name: `${contract.contractType} attributed population`,
          size: contract.attributedLives,
          rationale: "Opportunity scoped to attributed population and top variance subsegments.",
          evidenceRefIds: ["segment-1"],
        },
      ],
      workflows: (opportunity.projectPlanActions ?? []).map((action, index) => ({
        title: `Action ${index + 1}: ${action}`,
        ownerRole: opportunity.ownerRole ?? "Operations Lead",
        slas: ["Initial action launched within 14 days"],
        metrics: (opportunity.leadingKpis ?? []).map((kpi) => kpi.key),
      })),
      telemetry: [
        {
          metricKey: opportunity.primaryKpi?.key ?? "project_primary_metric",
          displayName: opportunity.primaryKpi?.displayName ?? "Primary Opportunity KPI",
          cadence: "weekly",
          freshness: "weekly",
          limitations: [],
        },
        ...(opportunity.leadingKpis ?? []).map((kpi) => ({
          metricKey: kpi.key,
          displayName: kpi.displayName,
          cadence: "weekly",
          freshness: "weekly",
          limitations: [],
        })),
      ],
      citations: [
        {
          id: "opp-1",
          label: "Contract opportunity signal",
          excerpt: opportunity.description,
        },
      ],
    },
    sharing: {
      visibility: "private",
      shares: [],
    },
    charter: {
      goalStatement: opportunity.executiveSummary ?? opportunity.description,
      primaryKPI: opportunity.primaryKpi ?? {
        key: "pmpm_delta",
        displayName: "PMPM Delta",
        baseline: contract.currentPmpm - contract.targetPmpm,
        target: 0,
        direction: "down",
      },
      secondaryKPIs: opportunity.leadingKpis ?? [],
      timeframe: {
        startDate: nowDate,
        endDate: new Date(Date.now() + (opportunity.impactEstimate?.timelineDays ?? 120) * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      },
      owners: {
        executiveSponsor: "Contract Executive Sponsor",
        clinicalOwner: "Clinical Program Owner",
        opsOwner: opportunity.ownerRole ?? "Operations Lead",
        analyticsOwner: "Analytics Lead",
      },
      leadingIndicators: opportunity.leadingKpis ?? [],
      assumptions: [
        "Assumes timely outreach and scheduling capacity is available.",
        "Assumes payer policy remains stable during execution window.",
      ],
    },
    projectOrigin: "opportunity",
    sourceContractId: contract.id,
    sourceOpportunityTitle: opportunity.title,
    createdAt: nowDate,
    updatedAt: nowDate,
  };

  const workflows: WorkflowTemplate[] = workflowTemplateLibrary
    .filter((template) => workflowTypes.includes(template.type))
    .map((template) => ({
      ...template,
      id: makeId("workflow"),
      projectId: project.id,
      status: "active",
    }));

  const tasks: Task[] = workflows.flatMap((workflow) =>
    Array.from({ length: 6 }).map((_, idx) => ({
      id: makeId("task"),
      projectId: project.id,
      workflowTemplateId: workflow.id,
      title: `Opportunity task ${idx + 1} for ${workflow.title}`,
      assignedRole: workflow.ownerRole,
      dueDate: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: idx === 0 ? "todo" : idx % 4 === 0 ? "blocked" : "in_progress",
      reasonCode: idx % 4 === 0 ? "Pending stakeholder alignment" : undefined,
      createdAt: nowDate,
      updatedAt: nowDate,
    }))
  );

  const metricPoints = generateMetricPoints(project);

  await saveProjects([project]);
  if (workflows.length) await saveWorkflowTemplates(workflows);
  if (tasks.length) await saveTasks(tasks);
  await saveMetricPoints(metricPoints);
  await saveAuditEvents([
    {
      id: makeId("audit"),
      entityType: "Project",
      entityId: project.id,
      eventType: "ProjectCreatedFromOpportunity",
      timestamp: nowIso,
      actor: "Demo User",
      details: `Project created from contract opportunity: ${opportunity.title}`,
    },
  ]);

  return project;
}
