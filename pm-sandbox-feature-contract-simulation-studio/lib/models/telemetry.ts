import { z } from "zod";

export const TelemetryEventSchema = z.object({
  id: z.string(),
  eventName: z.string(),
  occurredAt: z.string(),
  page: z.string().optional(),
  module: z.string().optional(),
  userId: z.string().optional(),
  userRole: z.string().optional(),
  contractId: z.string().optional(),
  workspaceId: z.string().optional(),
  projectId: z.string().optional(),
  opportunityTitle: z.string().optional(),
  originAgentId: z.string().optional(),
  contributingAgentIds: z.array(z.string()).optional(),
  projectOrigin: z.enum(["manual", "opportunity", "agent_run"]).optional(),
  properties: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;
