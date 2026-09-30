import { describe, expect, it } from "vitest";
import { programMeasureCatalogs, publishedMeasuresFor } from "../data/reference/programQualityMeasures";
import { hdiObligations } from "../data/synthetic/healthIntelligenceObligations";

describe("published quality measure requirements", () => {
  it("keeps TEAM PY1 claims HWR, PSI 90 and THA/TKA separate from later measures", () => {
    const measures = publishedMeasuresFor("cms-team", 2026);
    expect(measures.map(item => item.id)).toEqual(["CMIT 356", "CMIT 135", "CMIT 1618"]);
    expect(measures[0].name).toContain("Claims Data Only");
    expect(measures[0].period).toBe("Jul 1, 2024–Jun 30, 2025");
    expect(measures[2].applicability).toBe("Inpatient lower extremity joint replacement");
    expect(measures.some(item => /CHF|COPD/.test(item.name))).toBe(false);
  });
  it("uses the published TEAM PY2/PY3 sets without inventing TBD measurement periods", () => {
    const py2 = publishedMeasuresFor("cms-team", 2027);
    expect(py2.map(item => item.id)).toEqual(["CMIT 356", "CMIT 1618", "CMIT 134", "CMIT 1518", "CMIT 1788"]);
    expect(py2[0].name).toContain("Hybrid");
    expect(py2.filter(item => item.period.includes("TBD"))).toHaveLength(3);
    expect(publishedMeasuresFor("cms-team", 2028).map(item => item.id)).toContain("CMIT 1797");
    expect(publishedMeasuresFor("cms-team", 2029)).toEqual([]);
  });
  it("starts ASM in 2027 and separates cohorts and the unfinalized utilization measure", () => {
    expect(publishedMeasuresFor("ambulatory-specialty-model", 2026)).toEqual([]);
    const measures = publishedMeasuresFor("ambulatory-specialty-model", 2027);
    expect(measures.filter(item => item.group === "Heart failure").map(item => item.id)).toEqual(["MIPS 492", "MIPS 008", "MIPS 005", "MIPS 236", "MIPS 377"]);
    expect(measures.filter(item => item.group === "Low back pain" && !item.pending).map(item => item.id)).toEqual(["MIPS 238", "MIPS 134", "MIPS 128", "MIPS 220"]);
    expect(measures.filter(item => item.pending)).toHaveLength(1);
    expect(measures.find(item => item.id === "MIPS 492")?.name).toContain("Modified for ASM");
  });
  it("distinguishes Stars rating years, inverse glycemic rates and state-specific Medicaid obligations", () => {
    const stars = publishedMeasuresFor("ma-stars", 2026);
    expect(stars.find(item => item.id === "C12")?.note).toContain("not the Stars result");
    expect(stars.every(item => item.period.includes("2024"))).toBe(true);
    const core = publishedMeasuresFor("medicaid-vbp", 2026);
    expect(core.find(item => item.id === "CBP-AD")?.group).toContain("Voluntary");
    expect(core.find(item => item.id === "CDF-AD")?.group).toContain("Mandatory");
    expect(programMeasureCatalogs["medicaid-vbp"].note).toContain("unconfigured");
  });
  it("resolves modeled work references to the owning program's published set", () => {
    for (const program of hdiObligations) {
      const catalog = programMeasureCatalogs[program.id];
      const measures = publishedMeasuresFor(program.id, catalog.years[0]);
      for (const item of program.workItems) if (item.qualityMeasureKey) expect(measures.some(measure => measure.key === item.qualityMeasureKey && !measure.pending)).toBe(true);
      expect(new Set(catalog.measures.map(item => item.key)).size).toBe(catalog.measures.length);
      for (const measure of catalog.measures) expect(new URL(measure.source).hostname).toMatch(/^(www\.)?(cms\.gov|medicaid\.gov|ecqi\.healthit\.gov)$/);
    }
  });
});
