import { describe, expect, it } from "vitest";
import { sharedMeasureFamilies } from "../data/synthetic/sharedMeasures";
import { calculateMeasureImpact, countMeasurePrograms, filterSharedMeasures } from "../lib/health-intelligence/sharedMeasures";

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

describe("measure impact", () => {
  const financial = { poolDollars: 200000, weightPercent: 25, poolLabel: "Example pool" };

  it("calculates patients needed for a higher-is-better target and discloses the allocation", () => {
    expect(calculateMeasureImpact({ eligible: 600, numerator: 432, targetPercent: 80, financial }, "Higher is better")).toEqual({
      rate: 72, openGaps: 168, patientsToTarget: 48, gapPoints: 8, targetMet: false, allocatedDollars: 50000, exposureDollars: 50000,
    });
  });

  it("removes patients from the adverse numerator for lower-is-better measures", () => {
    const impact = { eligible: 450, numerator: 108, targetPercent: 15, financial };
    const result = calculateMeasureImpact(impact, "Lower is better");
    expect(result.patientsToTarget).toBe(41);
    expect(result.openGaps).toBe(108);
    expect(result.gapPoints).toBe(9);
    expect(calculateMeasureImpact({ ...impact, numerator: 68 }, "Lower is better").targetMet).toBe(false);
    expect(calculateMeasureImpact({ ...impact, numerator: 67 }, "Lower is better").exposureDollars).toBe(0);
  });

  it("rounds higher-is-better thresholds up to a whole patient", () => {
    expect(calculateMeasureImpact({ eligible: 61, numerator: 42, targetPercent: 70, financial: null }, "Higher is better").patientsToTarget).toBe(1);
  });

  it("keeps remaining clinical gaps when the performance target has been met", () => {
    expect(calculateMeasureImpact({ eligible: 500, numerator: 420, targetPercent: 80, financial }, "Higher is better")).toMatchObject({ openGaps: 80, patientsToTarget: 0, gapPoints: 0, targetMet: true, exposureDollars: 0, allocatedDollars: 50000 });
    expect(calculateMeasureImpact({ eligible: 360, numerator: 54, targetPercent: 15, financial }, "Lower is better")).toMatchObject({ openGaps: 54, patientsToTarget: 0, targetMet: true });
  });

  it("keeps missing financial modeling distinct from zero exposure and empty populations", () => {
    expect(calculateMeasureImpact({ eligible: 100, numerator: 50, targetPercent: 80, financial: null }, "Higher is better")).toMatchObject({ exposureDollars: null, allocatedDollars: null, patientsToTarget: 30 });
    expect(calculateMeasureImpact({ eligible: 0, numerator: 0, targetPercent: 80, financial }, "Higher is better")).toMatchObject({ rate: null, targetMet: null, patientsToTarget: null, exposureDollars: null });
  });

  it("rejects impossible populations and allocations", () => {
    expect(() => calculateMeasureImpact({ eligible: 10, numerator: 11, targetPercent: 80, financial }, "Higher is better")).toThrow();
    expect(() => calculateMeasureImpact({ eligible: 10, numerator: 5, targetPercent: 101, financial }, "Higher is better")).toThrow();
    expect(() => calculateMeasureImpact({ eligible: 10, numerator: 5, targetPercent: 80, financial: { ...financial, weightPercent: 101 } }, "Higher is better")).toThrow();
  });

  it("does not allocate the same obligation pool beyond 100% across measure examples", () => {
    const weights: Record<string, number> = {};
    for (const family of sharedMeasureFamilies) for (const obligation of family.obligations) {
      weights[obligation.id] = (weights[obligation.id] ?? 0) + (obligation.impact.financial?.weightPercent ?? 0);
    }
    expect(Object.values(weights).every(weight => weight <= 100)).toBe(true);
  });
});
