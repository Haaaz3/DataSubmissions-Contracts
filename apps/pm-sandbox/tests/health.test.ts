import { describe, expect, it } from "vitest";
import { evaluateProjectHealth } from "@/lib/metrics/health";
import { demoProjects } from "@/data/synthetic/projects";
import { generateMetricPoints } from "@/lib/metrics/generator";

describe("Project health scoring", () => {
  it("returns a valid status", () => {
    const project = demoProjects[0];
    const points = generateMetricPoints(project, 8);
    const result = evaluateProjectHealth(project, points, []);
    expect(["On Track", "At Risk", "Off Track"]).toContain(result.status);
  });
});