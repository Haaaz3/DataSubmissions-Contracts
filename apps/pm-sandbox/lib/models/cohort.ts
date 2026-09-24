import { z } from "zod";

export const GoalTypeSchema = z.enum([
  "ed_utilization",
  "readmissions",
  "cancer_screening",
  "diabetes",
]);

export const CohortDefinitionSchema = z.object({
  inclusionCriteria: z.array(z.string().min(1)),
  exclusionCriteria: z.array(z.string().min(1)),
  timeframeDays: z.number().int().positive(),
});

export const CohortSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  goalType: GoalTypeSchema,
  definition: CohortDefinitionSchema,
  size: z.number().int().positive(),
  churnRate: z.number().min(0).max(1),
  createdAt: z.string(),
  dataFreshness: z.enum(["daily", "weekly", "monthly"]),
  keyMetricLabel: z.string(),
  keyMetricValue: z.number(),
  trend: z.enum(["up", "down", "flat"]),
});

export const RiskTierSchema = z.enum(["low", "medium", "high"]);

export const CohortMemberSignalsSchema = z.object({
  edVisits6m: z.number().int().optional(),
  recentDischarge: z.boolean().optional(),
  openGaps: z.array(z.string()).optional(),
  lastA1c: z.number().nullable().optional(),
  a1cDate: z.string().nullable().optional(),
});

export const CohortMemberSchema = z.object({
  id: z.string(),
  cohortId: z.string(),
  riskTier: RiskTierSchema,
  segments: z.array(z.string()),
  signals: CohortMemberSignalsSchema,
});

export type GoalType = z.infer<typeof GoalTypeSchema>;
export type CohortDefinition = z.infer<typeof CohortDefinitionSchema>;
export type Cohort = z.infer<typeof CohortSchema>;
export type CohortMember = z.infer<typeof CohortMemberSchema>;