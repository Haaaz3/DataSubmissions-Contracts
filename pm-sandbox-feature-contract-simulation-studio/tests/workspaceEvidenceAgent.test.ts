import { describe, expect, it } from "vitest";
import { getScriptedAgentResult } from "@/data/synthetic/agentResults";
import { WorkspaceBlockSchema } from "@/lib/models/workspace";

describe("workspace persistence compatibility for Evidence-Based agent", () => {
  it("accepts usMap visuals produced by evidence_therapy_trial", () => {
    const result = getScriptedAgentResult({
      agentId: "evidence_therapy_trial",
      prompt: "Find trial-ready candidates and evidence-based therapy opportunities",
      routeContext: "/quality",
    });

    const usMapVisual = result.visuals.find((visual) => visual.type === "usMap");
    expect(usMapVisual).toBeDefined();

    const parsed = WorkspaceBlockSchema.parse({
      id: "ws-block-test",
      type: "chart",
      title: usMapVisual?.title ?? "Evidence map",
      description: usMapVisual?.description,
      chartType: "usMap",
      chartData: usMapVisual?.data ?? [{ label: "CA", value: 1 }],
    });

    expect(parsed.chartType).toBe("usMap");
  });
});
