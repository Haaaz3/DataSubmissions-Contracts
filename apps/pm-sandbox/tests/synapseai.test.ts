import { describe, expect, it } from "vitest";
import { buildSynapseRun } from "@/lib/synapseai/orchestrator";

describe("SynapseAI orchestrator", () => {
  it("is deterministic for the same prompt", () => {
    const runA = buildSynapseRun("cohort-ed-utilizers", "Why high ED?", "contract_performance");
    const runB = buildSynapseRun("cohort-ed-utilizers", "Why high ED?", "contract_performance");
    expect(runA.output.summaryMarkdown).toEqual(runB.output.summaryMarkdown);
    expect(runA.output.drivers).toEqual(runB.output.drivers);
  });
});