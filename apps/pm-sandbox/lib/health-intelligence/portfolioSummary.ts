import { hdiObligations, type HdiObligation, type HdiObligationId } from "@/data/synthetic/healthIntelligenceObligations";

export const portfolioMetricContext: Record<HdiObligationId, { label: string; unit: "%" | "pts"; year: number; basis: string }> = {
  "cms-team": { label: "Composite quality score", unit: "pts", year: 2026, basis: "Modeled program exposure across two hospitals. The TEAM detail uses a separate 732-episode participant scenario." },
  "vbc-contracts": { label: "Contracts meeting quality gate", unit: "%", year: 2026, basis: "Aggregated modeled sharing caps and settlements from the same 16 payer contracts used in the detailed view." },
  "mips-mvp": { label: "MIPS score", unit: "pts", year: 2026, basis: "Modeled payment exposure and recovery estimate. Score improvement alone is not a dollar-to-point conversion." },
  "ma-stars": { label: "Measure attainment", unit: "%", year: 2026, basis: "Modeled plan quality exposure. The displayed attainment rate is an internal indicator, not a CMS star rating." },
  "medicaid-vbp": { label: "Quality gate", unit: "%", year: 2026, basis: "Illustrative state-program exposure; state and contract payment terms remain unconfigured." },
  "hospital-quality": { label: "Submission readiness", unit: "%", year: 2026, basis: "Modeled hospital reporting exposure. Readiness reflects submission preparation, not clinical quality outcomes." },
  "ambulatory-specialty-model": { label: "Preparation readiness", unit: "%", year: 2027, basis: "Future-year planning scenario. Readiness is not an ASM performance score or payment forecast." },
};
export type PortfolioFilter = "all" | "below" | "meets";
export type PortfolioSort = "opportunity" | "risk" | "deadline";
export function portfolioTotals(programs: HdiObligation[]) {
  return {
    count: programs.length,
    risk: programs.reduce((sum, p) => sum + p.atRiskDollars, 0),
    opportunity: programs.reduce((sum, p) => sum + p.recoverableDollars, 0),
    currentBelow: programs.filter(p => p.forecast.current < p.forecast.target).length,
    forecastBelow: programs.filter(p => p.forecast.projected < p.forecast.target).length,
    forecastMeets: programs.filter(p => p.forecast.projected >= p.forecast.target).length,
    dueSoon: programs.flatMap(p => p.workItems).filter(item => item.dueInDays <= 30).length,
  };
}
export function nextProgramDeadline(program: HdiObligation) {
  return program.workItems.length ? Math.min(...program.workItems.map(item => item.dueInDays)) : null;
}
export function portfolioRows(programs: HdiObligation[], filter: PortfolioFilter, sort: PortfolioSort) {
  return programs.filter(program => filter === "all" || (filter === "below" ? program.forecast.projected < program.forecast.target : program.forecast.projected >= program.forecast.target))
    .sort((a, b) => sort === "risk" ? b.atRiskDollars - a.atRiskDollars : sort === "deadline" ? (nextProgramDeadline(a) ?? Infinity) - (nextProgramDeadline(b) ?? Infinity) : b.recoverableDollars - a.recoverableDollars);
}
export function portfolioForYear(year: "all" | "2026" | "2027") {
  return hdiObligations.filter(program => year === "all" || portfolioMetricContext[program.id].year === Number(year));
}
export function dollarAxisMaximum(programs: HdiObligation[]) {
  return Math.max(500_000, Math.ceil(Math.max(0, ...programs.flatMap(p => [p.atRiskDollars, p.recoverableDollars])) / 500_000) * 500_000);
}
export function portfolioMoney(value: number) {
  if (Math.abs(value) >= 1_000_000_000) return "$" + (value / 1_000_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "B";
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toLocaleString("en-US", { maximumFractionDigits: 0 })}K`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
