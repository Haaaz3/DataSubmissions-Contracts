import { z } from "zod";
import { SynapseAgentId } from "@/lib/synapseai/agentRegistry";

const SynapseAgentIdSchema = z.string() as z.ZodType<SynapseAgentId>;

export const WorkspaceShareSchema = z.object({
  visibility: z.enum(["private", "shared"]),
  sharedWith: z.array(z.string()),
});

export const WorkspaceKpiSchema = z.object({
  label: z.string(),
  value: z.string(),
  trend: z.enum(["up", "down", "flat"]).optional(),
});

export const WorkspaceChartDatumSchema = z.object({
  label: z.string(),
  value: z.number(),
  valueSecondary: z.number().optional(),
  valueTertiary: z.number().optional(),
});

export const WorkspaceBlockSchema = z.object({
  id: z.string(),
  type: z.enum(["summary", "kpi", "chart", "insight", "actions", "next_questions"]),
  title: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  items: z.array(z.string()).optional(),
  kpis: z.array(WorkspaceKpiSchema).optional(),
  chartType: z.enum(["bar", "stackedBar", "donut", "sparkline", "line", "radar", "polarArea", "wordCloud", "geo", "usMap"]).optional(),
  seriesLabels: z.array(z.string()).optional(),
  chartData: z.array(WorkspaceChartDatumSchema).optional(),
});

export const WorkspaceContributionSchema = z.object({
  id: z.string(),
  agentId: SynapseAgentIdSchema,
  prompt: z.string(),
  routeContext: z.string(),
  createdAt: z.string(),
  influencedBlockIds: z.array(z.string()),
  notes: z.string(),
});

export const WorkspaceLayoutSectionIdSchema = z.enum([
  "summary",
  "kpis",
  "trend",
  "visuals",
  "insights",
  "actions",
  "next_questions",
  "timeline",
]);

export const WorkspaceLayoutSchema = z.object({
  sectionOrder: z.array(WorkspaceLayoutSectionIdSchema),
  hiddenSections: z.array(WorkspaceLayoutSectionIdSchema),
});

export const WorkspaceGoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["active", "planned", "blocked", "complete"]),
  kpiLabel: z.string().optional(),
  baselineValue: z.number().optional(),
  currentValue: z.number().optional(),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
  direction: z.enum(["up", "down"]).optional(),
  targetDate: z.string().optional(),
  owner: z.string().optional(),
  successMetric: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SynapseWorkspaceSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  status: z.enum(["draft", "active"]),
  originAgentId: SynapseAgentIdSchema,
  contributingAgentIds: z.array(SynapseAgentIdSchema),
  sourcePrompts: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastRefreshedAt: z.string(),
  share: WorkspaceShareSchema,
  layout: WorkspaceLayoutSchema.optional(),
  goals: z.array(WorkspaceGoalSchema).default([]),
  blocks: z.array(WorkspaceBlockSchema),
  contributions: z.array(WorkspaceContributionSchema),
});

export type SynapseWorkspace = z.infer<typeof SynapseWorkspaceSchema>;
export type SynapseWorkspaceBlock = z.infer<typeof WorkspaceBlockSchema>;
export type SynapseWorkspaceContribution = z.infer<typeof WorkspaceContributionSchema>;
export type WorkspaceGoal = z.infer<typeof WorkspaceGoalSchema>;
