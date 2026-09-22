import { AuditEvent, MetricPoint, Project, Task, WorkflowTemplate } from "@/lib/models/project";
import { makeId } from "@/lib/storage/synapseStore";

export interface SharePackage {
  project: Project;
  workflows: WorkflowTemplate[];
  tasks: Task[];
  metrics: MetricPoint[];
  audit: AuditEvent[];
}

export function buildSharePackage(
  project: Project,
  workflows: WorkflowTemplate[],
  tasks: Task[],
  metrics: MetricPoint[],
  audit: AuditEvent[]
): SharePackage {
  return { project, workflows, tasks, metrics, audit };
}

export function addShareEvent(projectId: string, createdBy: string) {
  return {
    id: makeId("audit"),
    entityType: "Project",
    entityId: projectId,
    eventType: "ProjectShared",
    timestamp: new Date().toISOString(),
    actor: createdBy,
    details: "Shared project package exported.",
  } as AuditEvent;
}