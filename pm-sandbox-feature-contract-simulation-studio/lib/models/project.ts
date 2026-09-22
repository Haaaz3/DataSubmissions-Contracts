import { z } from "zod";
import { GoalTypeSchema } from "./cohort";

export const ProjectStatusSchema = z.enum(["draft", "active", "paused", "completed"]);
export const ProjectTypeSchema = z.enum(["standard", "autonomous"]);
export const ExecutionModeSchema = z.enum(["manual", "approval_required", "autonomous"]);
export const AutonomousProjectStatusSchema = z.enum([
  "executed",
  "monitoring",
  "needs_review",
  "escalated",
  "completed",
]);

export const KPITrendDirectionSchema = z.enum(["up", "down"]);

export const KPISchema = z.object({
  key: z.string(),
  displayName: z.string(),
  baseline: z.number(),
  target: z.number(),
  direction: KPITrendDirectionSchema,
});

export const ProjectCharterSchema = z.object({
  goalStatement: z.string(),
  primaryKPI: KPISchema,
  secondaryKPIs: z.array(KPISchema),
  timeframe: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  owners: z.object({
    executiveSponsor: z.string().optional(),
    clinicalOwner: z.string().optional(),
    opsOwner: z.string().optional(),
    analyticsOwner: z.string().optional(),
  }),
  leadingIndicators: z.array(KPISchema),
  assumptions: z.array(z.string()),
});

export const CohortSnapshotSchema = z.object({
  cohortId: z.string(),
  cohortVersionHash: z.string(),
  sizeAtStart: z.number(),
  definitionFrozen: z.boolean(),
  frozenAt: z.string(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  goalType: GoalTypeSchema,
  status: ProjectStatusSchema,
  cohortSnapshot: CohortSnapshotSchema,
  savedViewSnapshot: z.object({
    synapseRunId: z.string(),
    agentId: z.string(),
    agentDisplayName: z.string(),
    savedAt: z.string(),
    summaryMarkdown: z.string(),
    drivers: z.array(z.object({ label: z.string(), value: z.string(), evidenceRefIds: z.array(z.string()) })),
    segments: z.array(z.object({ name: z.string(), size: z.number(), rationale: z.string(), evidenceRefIds: z.array(z.string()) })),
    workflows: z.array(z.object({ title: z.string(), ownerRole: z.string(), slas: z.array(z.string()), metrics: z.array(z.string()) })),
    telemetry: z.array(z.object({ metricKey: z.string(), displayName: z.string(), cadence: z.string(), freshness: z.string(), limitations: z.array(z.string()) })),
    citations: z.array(z.object({ id: z.string(), label: z.string(), excerpt: z.string() })),
  }),
  sharing: z.object({
    visibility: z.enum(["private", "shared"]),
    shares: z.array(
      z.object({
        shareId: z.string(),
        createdAt: z.string(),
        createdBy: z.string(),
        permission: z.enum(["view", "edit"]),
        sharedWithUserId: z.string().optional(),
      })
    ),
  }),
  charter: ProjectCharterSchema,
  projectType: ProjectTypeSchema.optional(),
  executionMode: ExecutionModeSchema.optional(),
  autonomousStatus: AutonomousProjectStatusSchema.optional(),
  originPage: z.string().optional(),
  originAgentId: z.string().optional(),
  supportingAgentIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  checkpoints: z
    .object({
      cadence: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
      nextReviewDate: z.string().optional(),
      lastReviewDate: z.string().optional(),
    })
    .optional(),
  governance: z
    .object({
      maxAutomatedMembersPerDay: z.number().optional(),
      maxAutomatedStaffHoursPerWeek: z.number().optional(),
      allowedChannels: z.array(z.string()).optional(),
      minimumConfidence: z.number().optional(),
      requireApprovalForHighCostActions: z.boolean().optional(),
    })
    .optional(),
  createdFromAgentRunId: z.string().optional(),
  projectOrigin: z.enum(["manual", "opportunity", "agent_run"]).optional(),
  sourceContractId: z.string().optional(),
  sourceOpportunityTitle: z.string().optional(),
  sourceWorkspaceId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WorkflowTemplateSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: z.enum([
    "ed_frequent_utilizer",
    "ed_diversion",
    "toc_readmission_bundle",
    "post_acute_network",
    "screening_campaign",
    "provider_panel_microcampaign",
    "diabetes_control",
    "diabetes_complication_overlay",
  ]),
  title: z.string(),
  description: z.string(),
  ownerRole: z.string(),
  SLAs: z.array(
    z.object({
      name: z.string(),
      hours: z.number().int().optional(),
      days: z.number().int().optional(),
    })
  ),
  evidenceRequired: z.array(z.string()),
  metricsLinked: z.array(z.string()),
  status: z.enum(["draft", "active", "retired"]),
});

export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  workflowTemplateId: z.string(),
  title: z.string(),
  assignedRole: z.string(),
  dueDate: z.string(),
  status: z.enum(["todo", "in_progress", "blocked", "done"]),
  reasonCode: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MetricPointSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  metricKey: z.string(),
  date: z.string(),
  value: z.number(),
  confidence: z.number().min(0).max(1),
  freshness: z.enum(["real_time", "daily", "weekly", "monthly", "claims_lagged"]),
  notes: z.string().optional(),
});

export const AuditEventSchema = z.object({
  id: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  eventType: z.string(),
  timestamp: z.string(),
  actor: z.string(),
  details: z.string(),
});

export type KPI = z.infer<typeof KPISchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type MetricPoint = z.infer<typeof MetricPointSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;