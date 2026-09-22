import { openDB, type IDBPDatabase, type IDBPTransaction } from "idb";
import { Cohort, CohortMember } from "@/lib/models/cohort";
import { AgentRun } from "@/lib/models/agent";
import {
  AuditEvent,
  MetricPoint,
  Project,
  Task,
  WorkflowTemplate,
} from "@/lib/models/project";
import { TelemetryEvent } from "@/lib/models/telemetry";
import { SynapseWorkspace } from "@/lib/models/workspace";

const DB_NAME = "synapseai-projects";
const DB_VERSION = 4;

function ensureIndex(
  db: IDBPDatabase<unknown>,
  transaction: IDBPTransaction<unknown, string[], "versionchange">,
  storeName: string,
  indexName: string,
  keyPath: string
) {
  const store = db.objectStoreNames.contains(storeName)
    ? transaction.objectStore(storeName)
    : db.createObjectStore(storeName, { keyPath: "id" });

  if (!store.indexNames.contains(indexName)) {
    store.createIndex(indexName, keyPath, { unique: false });
  }
}

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, transaction) {
      if (!db.objectStoreNames.contains("cohorts")) {
        db.createObjectStore("cohorts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("cohortMembers")) {
        db.createObjectStore("cohortMembers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("agentRuns")) {
        db.createObjectStore("agentRuns", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("workflowTemplates")) {
        db.createObjectStore("workflowTemplates", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("tasks")) {
        db.createObjectStore("tasks", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("metricPoints")) {
        db.createObjectStore("metricPoints", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("auditEvents")) {
        db.createObjectStore("auditEvents", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("workspaces")) {
        db.createObjectStore("workspaces", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("telemetryEvents")) {
        db.createObjectStore("telemetryEvents", { keyPath: "id" });
      }

      ensureIndex(db, transaction, "cohortMembers", "byCohortId", "cohortId");
      ensureIndex(db, transaction, "agentRuns", "byCohortId", "cohortId");
      ensureIndex(db, transaction, "workflowTemplates", "byProjectId", "projectId");
      ensureIndex(db, transaction, "tasks", "byProjectId", "projectId");
      ensureIndex(db, transaction, "metricPoints", "byProjectId", "projectId");
      ensureIndex(db, transaction, "auditEvents", "byEntityId", "entityId");
    },
  });
}

export async function putAll<T>(store: string, items: T[]) {
  const db = await getDb();
  const tx = db.transaction(store, "readwrite");
  for (const item of items) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getAll<T>(store: string): Promise<T[]> {
  const db = await getDb();
  return db.getAll(store);
}

export async function getAllByIndex<T>(
  store: string,
  index: string,
  value: string
): Promise<T[]> {
  const db = await getDb();
  return db.getAllFromIndex(store, index, value);
}

export async function getById<T>(store: string, id: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get(store, id);
}

export async function deleteById(store: string, id: string) {
  const db = await getDb();
  return db.delete(store, id);
}

export async function clearStore(store: string) {
  const db = await getDb();
  return db.clear(store);
}

export type StorageCollections = {
  cohorts: Cohort;
  cohortMembers: CohortMember;
  agentRuns: AgentRun;
  projects: Project;
  workflowTemplates: WorkflowTemplate;
  tasks: Task;
  metricPoints: MetricPoint;
  auditEvents: AuditEvent;
  workspaces: SynapseWorkspace;
  telemetryEvents: TelemetryEvent;
};