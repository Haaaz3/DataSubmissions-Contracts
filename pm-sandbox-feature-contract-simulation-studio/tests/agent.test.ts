import { describe, expect, it } from "vitest";
import { runCohortAgent } from "@/lib/agent/runCohortAgent";

describe("SynapseAI agent", () => {
  it("produces deterministic output for same cohort", () => {
    const runA = runCohortAgent("cohort-ed-utilizers", "Analyze cohort");
    const runB = runCohortAgent("cohort-ed-utilizers", "Analyze cohort");

    expect(runA.summaryMarkdown).toEqual(runB.summaryMarkdown);
    expect(runA.drivers).toEqual(runB.drivers);
    expect(runA.segments).toEqual(runB.segments);
    expect(runA.recommendedWorkflows).toEqual(runB.recommendedWorkflows);
  });
});