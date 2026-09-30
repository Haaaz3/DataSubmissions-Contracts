import { describe, expect, it } from "vitest";
import { sharedMeasureFamilies } from "../data/synthetic/sharedMeasures";
import { buildMeasurePopulation } from "../lib/health-intelligence/measurePopulation";
import { measureTrendData, summarizeMeasurePopulation } from "../lib/health-intelligence/measureOverview";

const family = sharedMeasureFamilies[0];
const patients = buildMeasurePopulation(family);

describe("measure overview", () => {
  it("counts people once and prioritizes whole-patient target workload", () => {
    const result = summarizeMeasurePopulation(family, family.obligations, patients);
    expect(result).toMatchObject({ eligible: 21900, open: 5332, shared: 3200, sharedOpen: 0 });
    expect(result.priority).toMatchObject({ obligation: { id: "medicaid-quality" }, impact: { patientsToTarget: 420, gapPoints: 5 } });
  });

  it("recalculates eligibility, gaps and overlap for the shown obligation subset", () => {
    const result = summarizeMeasurePopulation(family, family.obligations.slice(0, 2), patients);
    expect(result).toMatchObject({ eligible: 1100, open: 248, shared: 0, sharedOpen: 0 });
    expect(result.priority?.obligation.id).toBe("aetna-commercial");
    expect(summarizeMeasurePopulation(family, [family.obligations[1]], patients).priority).toBeNull();
    expect(summarizeMeasurePopulation(family, [], patients)).toEqual({ eligible: 0, open: 0, shared: 0, sharedOpen: 0, priority: null });
  });

  it("deduplicates open gaps while keeping overlapping results separate", () => {
    const diabetes = sharedMeasureFamilies[1];
    const cohort = buildMeasurePopulation(diabetes);
    const result = summarizeMeasurePopulation(diabetes, diabetes.obligations, cohort);
    expect(result.sharedOpen).toBe(120);
    expect(result.open).toBe(4050);
    expect(result.priority?.impact.patientsToTarget).toBe(490);
  });
});

describe("compact trend scale", () => {
  it("zooms to observed rates with padding rather than extending to the target", () => {
    const result = measureTrendData(family.obligations[0]);
    expect(result).toMatchObject({ first: 66, last: 72, delta: 6, min: 65, max: 73 });
    expect(result.max).toBeLessThan(family.obligations[0].impact.targetPercent);
  });

  it("keeps flat and boundary rates on a nonzero scale inside 0–100", () => {
    for (const rate of [0, 50, 100]) {
      const result = measureTrendData({ ...family.obligations[0], history: [{ month: "Sep 2026", eligible: 100, numerator: rate }] });
      expect(result.delta).toBe(0);
      expect(result.min).toBeLessThan(result.max);
      expect(result.min).toBeGreaterThanOrEqual(0);
      expect(result.max).toBeLessThanOrEqual(100);
      expect(result.min).toBeLessThanOrEqual(rate);
      expect(result.max).toBeGreaterThanOrEqual(rate);
    }
  });

  it("retains missing snapshots as missing rather than zero performance", () => {
    const result = measureTrendData({ ...family.obligations[0], history: [{ month: "Sep 2026", eligible: 0, numerator: 0 }] });
    expect(result).toMatchObject({ first: null, last: null, delta: null, min: 0, max: 100 });
    expect(result.points[0].rate).toBeNull();
  });
});
