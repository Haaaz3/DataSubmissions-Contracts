import { v4 as uuid } from "uuid";
import {
  Cohort,
  CohortMember,
  CohortSchema,
  CohortMemberSchema,
} from "@/lib/models/cohort";
import { SynapseAIRun, SynapseAIRunSchema } from "@/lib/models/agent";
import {
  AuditEvent,
  MetricPoint,
  Project,
  ProjectSchema,
  Task,
  WorkflowTemplate,
} from "@/lib/models/project";
import { SynapseWorkspace, SynapseWorkspaceSchema } from "@/lib/models/workspace";
import { TelemetryEvent, TelemetryEventSchema } from "@/lib/models/telemetry";
import { getAll, putAll, getById, clearStore } from "./db";
import { getAllByIndex } from "./db";

export async function loadCohorts() {
  const cohorts = await getAll<Cohort>("cohorts");
  return cohorts.map((c) => CohortSchema.parse(c));
}

export async function loadCohortMembers(cohortId: string) {
  const members = await getAllByIndex<CohortMember>("cohortMembers", "byCohortId", cohortId);
  return members.map((m) => CohortMemberSchema.parse(m));
}

export async function saveCohorts(cohorts: Cohort[]) {
  return putAll("cohorts", cohorts);
}

export async function saveCohortMembers(members: CohortMember[]) {
  return putAll("cohortMembers", members);
}

export async function saveAgentRun(run: SynapseAIRun) {
  SynapseAIRunSchema.parse(run);
  return putAll("agentRuns", [run]);
}

export async function saveWorkspaces(workspaces: SynapseWorkspace[]) {
  workspaces.forEach((workspace) => SynapseWorkspaceSchema.parse(workspace));
  return putAll("workspaces", workspaces);
}

export async function loadWorkspaces() {
  const workspaces = await getAll<SynapseWorkspace>("workspaces");
  return workspaces.map((workspace) => SynapseWorkspaceSchema.parse(workspace));
}

export async function loadWorkspace(workspaceId: string) {
  const workspace = await getById<SynapseWorkspace>("workspaces", workspaceId);
  return workspace ? SynapseWorkspaceSchema.parse(workspace) : undefined;
}

export async function clearWorkspaces() {
  return clearStore("workspaces");
}

export async function saveTelemetryEvents(events: TelemetryEvent[]) {
  events.forEach((event) => TelemetryEventSchema.parse(event));
  return putAll("telemetryEvents", events);
}

export async function loadTelemetryEvents() {
  const events = await getAll<TelemetryEvent>("telemetryEvents");
  return events.map((event) => TelemetryEventSchema.parse(event));
}

export async function loadAgentRuns(cohortId?: string) {
  if (!cohortId) {
    const runs = await getAll<SynapseAIRun>("agentRuns");
    return runs.map((r) => SynapseAIRunSchema.parse(r));
  }
  const runs = await getAllByIndex<SynapseAIRun>("agentRuns", "byCohortId", cohortId);
  return runs.map((r) => SynapseAIRunSchema.parse(r));
}

export async function saveProjects(projects: Project[]) {
  return putAll("projects", projects);
}

export async function saveWorkflowTemplates(templates: WorkflowTemplate[]) {
  return putAll("workflowTemplates", templates);
}

export async function saveTasks(tasks: Task[]) {
  return putAll("tasks", tasks);
}

export async function saveMetricPoints(points: MetricPoint[]) {
  return putAll("metricPoints", points);
}

export async function saveAuditEvents(events: AuditEvent[]) {
  return putAll("auditEvents", events);
}

export async function loadProjects() {
  const projects = await getAll<Project>("projects");
  return projects
    .map((project) => {
      const parsed = ProjectSchema.safeParse(project);
      if (!parsed.success) {
        console.warn("Skipping invalid project record from storage", {
          projectId: (project as { id?: unknown })?.id,
          issues: parsed.error.issues,
        });
        return null;
      }
      return parsed.data;
    })
    .filter((project): project is Project => Boolean(project));
}

export async function loadProject(projectId: string) {
  const project = await getById<Project>("projects", projectId);
  if (!project) return undefined;

  const parsed = ProjectSchema.safeParse(project);
  if (!parsed.success) {
    console.warn("Invalid project record found for requested id", {
      projectId,
      issues: parsed.error.issues,
    });
    return undefined;
  }

  return parsed.data;
}

export async function loadWorkflowTemplates(projectId: string) {
  return getAllByIndex<WorkflowTemplate>("workflowTemplates", "byProjectId", projectId);
}

export async function loadTasks(projectId: string) {
  return getAllByIndex<Task>("tasks", "byProjectId", projectId);
}

export async function loadAllTasks() {
  return getAll<Task>("tasks");
}

export async function loadMetricPoints(projectId: string) {
  return getAllByIndex<MetricPoint>("metricPoints", "byProjectId", projectId);
}

export async function loadAllMetricPoints() {
  return getAll<MetricPoint>("metricPoints");
}

export async function loadAuditEvents(projectId: string) {
  return getAllByIndex<AuditEvent>("auditEvents", "byEntityId", projectId);
}

export async function clearAllSynapseData() {
  await Promise.all([
    clearStore("cohorts"),
    clearStore("cohortMembers"),
    clearStore("agentRuns"),
    clearStore("projects"),
    clearStore("workflowTemplates"),
    clearStore("tasks"),
    clearStore("metricPoints"),
    clearStore("auditEvents"),
    clearStore("workspaces"),
    clearStore("telemetryEvents"),
  ]);
}

export function makeId(prefix: string) {
  return `${prefix}-${uuid()}`;
}