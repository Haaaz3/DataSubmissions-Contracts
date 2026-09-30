import { describe, expect, it } from "vitest";
import { sharedMeasureFamilies } from "../data/synthetic/sharedMeasures";
import { countMeasurePrograms, filterSharedMeasures } from "../lib/health-intelligence/sharedMeasures";

describe("shared measure discovery", () => {
  it("finds a specific CQM without including HEDIS obligations as identical results", () => {
    const results = filterSharedMeasures(sharedMeasureFamilies, " CMS165V14 ", "all");
    expect(results.map(result => result.family.id)).toEqual(["blood-pressure"]);
    expect(results[0].obligations.map(item => item.definitionId)).toEqual(["CMS165v14"]);
    // Retain the reference definition for comparison after filtering.
    expect(results[0].family.definitions.map(item => item.id)).toEqual(["CBP", "CMS165v14"]);
  });

  it("intersects the query and program on the same obligation", () => {
    expect(filterSharedMeasures(sharedMeasureFamilies, "CMS165", "ma-stars")).toEqual([]);
    const results = filterSharedMeasures(sharedMeasureFamilies, "blood pressure", "vbc-contracts");
    expect(results[0].obligations.map(item => item.contractId)).toEqual(["comm-001", "comm-002"]);
    expect(countMeasurePrograms(results[0].obligations)).toBe(1);
  });

  it("finds a contract across families and handles no matches", () => {
    const results = filterSharedMeasures(sharedMeasureFamilies, "Aetna", "all");
    expect(results).toHaveLength(4);
    expect(results.every(result => result.obligations.length === 1 && result.obligations[0].contractId === "comm-001")).toBe(true);
    expect(filterSharedMeasures(sharedMeasureFamilies, "no such measure", "all")).toEqual([]);
    expect(filterSharedMeasures([], "", "all")).toEqual([]);
  });
});
