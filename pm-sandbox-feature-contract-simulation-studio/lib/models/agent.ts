import { z } from "zod";

export const EvidenceRefSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const DriverSchema = z.object({
  label: z.string(),
  value: z.string(),
  evidenceRefs: z.array(z.string()),
});

export const SegmentSchema = z.object({
  name: z.string(),
  size: z.number().int(),
  rationale: z.string(),
  evidenceRefs: z.array(z.string()),
});

export const WorkflowTemplateRecommendationSchema = z.object({
  type: z.string(),
  title: z.string(),
  description: z.string(),
  reason: z.string(),
});

export const TelemetryMetricSchema = z.object({
  key: z.string(),
  label: z.string(),
  cadence: z.enum(["daily", "weekly", "monthly", "claims_lagged"]),
  definition: z.string(),
  limitations: z.string().optional(),
});

export const SynapseStepSchema = z.object({
  name: z.string(),
  status: z.enum(["pending", "running", "complete"]),
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
});

export const SynapseOutputSchema = z.object({
  summaryMarkdown: z.string(),
  drivers: z.array(DriverSchema),
  segments: z.array(SegmentSchema),
  recommendedWorkflows: z.array(WorkflowTemplateRecommendationSchema),
  telemetryPlan: z.array(TelemetryMetricSchema),
  projectCharterDraft: z.object({
    goalStatement: z.string(),
    primaryKPI: z.object({
      key: z.string(),
      displayName: z.string(),
      baseline: z.number(),
      target: z.number(),
      direction: z.enum(["up", "down"]),
    }),
    leadingIndicators: z.array(z.object({
      key: z.string(),
      displayName: z.string(),
      baseline: z.number(),
      target: z.number(),
      direction: z.enum(["up", "down"]),
    })),
    timeframeDays: z.number(),
    assumptions: z.array(z.string()),
  }),
  confidence: z.number().min(0).max(1),
  limitations: z.array(z.string()),
  citations: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      excerpt: z.string(),
    })
  ),
});

export const SynapseAIRunSchema = z.object({
  id: z.string(),
  cohortId: z.string(),
  prompt: z.string(),
  createdAt: z.string(),
  agentName: z.literal("SynapseAI"),
  agentId: z.string(),
  agentDisplayName: z.string(),
  steps: z.array(SynapseStepSchema),
  output: SynapseOutputSchema,
});

export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;
export type Driver = z.infer<typeof DriverSchema>;
export type Segment = z.infer<typeof SegmentSchema>;
export type WorkflowTemplateRecommendation = z.infer<typeof WorkflowTemplateRecommendationSchema>;
export type TelemetryMetric = z.infer<typeof TelemetryMetricSchema>;
export type SynapseStep = z.infer<typeof SynapseStepSchema>;
export type SynapseOutput = z.infer<typeof SynapseOutputSchema>;
export type SynapseAIRun = z.infer<typeof SynapseAIRunSchema>;

// Legacy synthetic agent run shape used by runCohortAgent + related tests.
export interface AgentRun {
  id: string;
  cohortId: string;
  prompt: string;
  createdAt: string;
  summaryMarkdown: string;
  drivers: Driver[];
  segments: Segment[];
  recommendedWorkflows: WorkflowTemplateRecommendation[];
  telemetryPlan: TelemetryMetric[];
  confidence: number;
  assumptions: string[];
  limitations: string[];
  citations: Array<{
    id: string;
    label: string;
    excerpt: string;
  }>;
}