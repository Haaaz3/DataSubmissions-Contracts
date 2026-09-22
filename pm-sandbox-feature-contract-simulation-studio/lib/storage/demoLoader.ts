import { demoCohorts, demoMembers } from "@/data/synthetic/cohorts";
import { demoProjects } from "@/data/synthetic/projects";
import { demoWorkspaces } from "@/data/synthetic/workspaces";
import { workflowTemplateLibrary } from "@/data/synthetic/workflowTemplates";
import { generateMetricPoints } from "@/lib/metrics/generator";
import {
  saveAuditEvents,
  saveCohortMembers,
  saveCohorts,
  saveMetricPoints,
  saveProjects,
  saveTasks,
  saveWorkflowTemplates,
  saveWorkspaces,
  makeId,
} from "@/lib/storage/synapseStore";
import { AuditEvent, Task, WorkflowTemplate } from "@/lib/models/project";

export async function loadDemoCohorts() {
  await saveCohorts(demoCohorts);
  await saveCohortMembers(demoMembers);
}

export async function loadDemoProjects() {
  await saveProjects(demoProjects);

  const workflowTemplates: WorkflowTemplate[] = demoProjects.flatMap((project) =>
    workflowTemplateLibrary.slice(0, 2).map((template) => ({
      ...template,
      id: makeId("workflow"),
      projectId: project.id,
      status: "active",
    }))
  );

  const tasks: Task[] = workflowTemplates.flatMap((workflow) =>
    Array.from({ length: 8 }).map((_, idx) => ({
      id: makeId("task"),
      projectId: workflow.projectId,
      workflowTemplateId: workflow.id,
      title: `Synthetic task ${idx + 1} for ${workflow.title}`,
      assignedRole: workflow.ownerRole,
      dueDate: "2025-03-15",
      status: idx % 4 === 0 ? "blocked" : idx % 3 === 0 ? "done" : "in_progress",
      reasonCode: idx % 4 === 0 ? "Member unreachable" : undefined,
      createdAt: "2025-02-10",
      updatedAt: "2025-03-01",
    }))
  );

  const metricPoints = demoProjects.flatMap((project) => generateMetricPoints(project));

  const auditEvents: AuditEvent[] = demoProjects.map((project) => ({
    id: makeId("audit"),
    entityType: "Project",
    entityId: project.id,
    eventType: "ProjectCreated",
    timestamp: project.createdAt,
    actor: "Demo User",
    details: `Synthetic project created for ${project.name}.`,
  }));

  await saveWorkflowTemplates(workflowTemplates);
  await saveTasks(tasks);
  await saveMetricPoints(metricPoints);
  await saveAuditEvents(auditEvents);
  await saveWorkspaces(demoWorkspaces);
}