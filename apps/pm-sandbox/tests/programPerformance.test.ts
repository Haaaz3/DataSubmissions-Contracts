import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React, { createElement } from "react";
(globalThis as typeof globalThis & { React: typeof React }).React = React;
import ProgramOverview from "@/components/health-intelligence/ProgramOverview";
import { hdiObligations } from "@/data/synthetic/healthIntelligenceObligations";
import { mipsScore, programQualityResults, qualityGap, qualityPriority } from "@/data/synthetic/programPerformance";
import { publishedMeasuresFor } from "@/data/reference/programQualityMeasures";
import { portfolioFinancialScenarios } from "@/data/synthetic/portfolioFinancialScenarios";
import { mockContracts } from "@/lib/mockData";
import { contractFinancials, costAmount } from "@/lib/contracts/vbcFinancials";

describe("Program performance", () => {
  it("keeps the MIPS four-category scores consistent with the portfolio and payment direction", () => {
    const mips = hdiObligations.find(row => row.id === "mips-mvp")!;
    expect(mipsScore("current")).toBeCloseTo(mips.forecast.current);
    expect(mipsScore("forecast")).toBeCloseTo(mips.forecast.projected);
    expect(mipsScore("current")).toBeGreaterThan(75);
    expect(portfolioFinancialScenarios["mips-mvp"]!.projected).toBeGreaterThan(0);
  });
  it("covers every selected published measure without confusing poor control and controlled rates", () => {
    for (const id of ["mips-mvp", "ma-stars", "medicaid-vbp", "hospital-quality"] as const) {
      const rows = programQualityResults(id);
      expect(rows.map(r => r.key)).toEqual(publishedMeasuresFor(id, 2026).map(r => r.key));
      for (const row of rows) {
        expect(row.history.at(-1)).toEqual(row.current);
        expect(row.reviewCount).toBeLessThanOrEqual(row.eligible);
        expect(row.action.length).toBeGreaterThan(10);
      }
    }
    const poorControl = programQualityResults("mips-mvp").find(r => r.key === "qpp-001")!;
    const controlled = programQualityResults("ma-stars").find(r => r.key === "stars-C12")!;
    expect(poorControl.lower).toBe(true);
    expect(controlled.lower).toBe(false);
    expect(qualityGap(poorControl)).toBe(4);
    expect(qualityGap(controlled)).toBe(7);
    expect(qualityPriority({ ...controlled, current: 90 })).toBe(0);
  });
  it("renders performance and drivers before actionable quality, with reference requirements last", () => {
    for (const id of ["mips-mvp", "ma-stars", "medicaid-vbp", "hospital-quality"] as const) {
      const html = renderToStaticMarkup(createElement(ProgramOverview, {
        obligation: hdiObligations.find(row => row.id === id)!, opportunities: [],
        onBack() {}, onWorklist() {}, onOpenPatientWorklist() {},
      }));
      expect(html.indexOf("Program performance overview")).toBeLessThan(html.indexOf('aria-label="Quality performance"'));
      expect(html.indexOf("Review worklist")).toBeLessThan(html.indexOf("Published requirements and sources"));
      expect(html).not.toContain("Recovery is included in risk");
    }
  });
  it("normalizes per-year contracts without changing settlements", () => {
    const contract = mockContracts.find(row => row.expenseBasis === "pmpy")!;
    const result = contractFinancials(contract);
    expect(costAmount(result.current.actualSpend, result.memberMonths, "pmpy")).toBe(contract.currentPmpm * 12);
    expect(contractFinancials({ ...contract, expenseBasis: "pmpm" }).projected).toBe(result.projected);
  });
});
