"use client";

import { Fragment, useState } from "react";
import type { HdiObligation, HdiObligationId } from "@/data/synthetic/healthIntelligenceObligations";
import FinancialEnvelope from "./FinancialEnvelope";
import { portfolioFinancialScenarios } from "@/data/synthetic/portfolioFinancialScenarios";
import { financialSummary, improvement, signedMoney } from "@/lib/health-intelligence/financialEnvelope";
import { healthSystemSnapshot } from "@/data/synthetic/healthSystemObligations";
import { nextProgramDeadline, portfolioForYear, portfolioMetricContext, portfolioTotals, type PortfolioFilter } from "@/lib/health-intelligence/portfolioSummary";

const rowButton = "rounded-md px-2 py-1.5 text-xs font-semibold text-[#176b75] hover:bg-[#eaf4f1] focus-visible:outline-2 focus-visible:outline-[#176b75]";

function PerformanceBullet({ program }: { program: HdiObligation }) {
  const { label, unit } = portfolioMetricContext[program.id];
  const { current, projected, target } = program.forecast;
  const suffix = unit === "%" ? "%" : " pts";
  const position = (value: number) => `${Math.max(0, Math.min(100, value))}%`;
  return <div className="min-w-[225px]"><p className="text-[11px] font-semibold text-slate-700">{label}</p><div role="img" aria-label={`${label}: current ${current}${suffix}, forecast ${projected}${suffix}, internal target ${target}${suffix}. Scale zero to 100.`} className="relative my-2 h-5"><div className="absolute inset-x-0 top-1.5 h-2 rounded-sm bg-slate-100" /><div className="absolute left-0 top-1.5 h-2 rounded-sm bg-[#d3e5e8]" style={{ width: position(projected) }} /><span className="absolute top-1 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-[#236f7e] shadow-sm" style={{ left: position(current) }} /><span className="absolute top-1 h-3 w-3 -translate-x-1/2 rotate-45 border-2 border-[#236f7e] bg-white" style={{ left: position(projected) }} /><span className="absolute top-0 h-5 w-0.5 -translate-x-1/2 bg-slate-700" style={{ left: position(target) }} /></div><div className="flex items-center justify-between gap-2 text-[10px] tabular-nums text-slate-500"><span>Current <strong className="font-semibold text-slate-700">{current}{suffix}</strong></span><span>Forecast <strong className="font-semibold text-[#176b75]">{projected}{suffix}</strong></span><span>Target <strong className="font-semibold text-slate-700">{target}{suffix}</strong></span></div></div>;
}

export default function PortfolioExecutiveSummary({ onOpenProgram, onOpenWorklist }: { onOpenProgram: (id: HdiObligationId) => void; onOpenWorklist: (id: HdiObligationId) => void }) {
  const [year, setYear] = useState<"2026" | "2027">("2026");
  const [filter, setFilter] = useState<PortfolioFilter>("all");
  const [sort, setSort] = useState<"opportunity" | "settlement" | "deadline">("opportunity");
  const [expanded, setExpanded] = useState<HdiObligationId | null>(null);
  const programs = portfolioForYear(year);
  const totals = portfolioTotals(programs);
  const financials = financialSummary(programs, Number(year));
  const scenarioFor = (program: HdiObligation) => {
    const scenario = portfolioFinancialScenarios[program.id];
    return scenario?.year === Number(year) ? scenario : undefined;
  };
  const rows = programs.filter(program => filter === "all" || (filter === "below" ? program.forecast.projected < program.forecast.target : program.forecast.projected >= program.forecast.target)).sort((a, b) => {
    if (sort === "deadline") return (nextProgramDeadline(a) ?? Infinity) - (nextProgramDeadline(b) ?? Infinity);
    const left = scenarioFor(a), right = scenarioFor(b);
    if (!left) return right ? 1 : 0;
    if (!right) return -1;
    return sort === "settlement" ? left.projected - right.projected : improvement(right) - improvement(left);
  });
  const axisMaximum = Math.max(1, ...programs.flatMap(program => { const scenario = scenarioFor(program); return scenario ? [Math.abs(scenario.downside), scenario.upside] : []; }));
  return <section className="space-y-4" aria-label="Portfolio executive summary">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">Illustrative scenarios</span><span>{totals.count} {totals.count === 1 ? "program" : "programs"} · As of {healthSystemSnapshot.asOf}</span></div>
      <label className="text-xs font-semibold text-slate-600">Program year<select value={year} onChange={event => { setYear(event.target.value as typeof year); setFilter("all"); setExpanded(null); }} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"><option value="2026">2026</option><option value="2027">2027 · ASM</option></select></label>
    </div>
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="financial-outlook-title">
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 id="financial-outlook-title" className="text-base font-bold text-slate-900">Financial outlook</h3><span className="text-xs text-slate-500">{year} program year · USD</span></div>
      {financials ? <>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div><h4 className="text-xs font-semibold text-slate-600">Projected net settlement</h4><p className={"mt-2 text-3xl font-bold tracking-tight tabular-nums " + (financials.projected < 0 ? "text-[#985216]" : "text-[#176b75]")}>{signedMoney(financials.projected)}</p><p className="mt-1 text-xs text-slate-500">At current performance</p></div>
          <div><h4 className="text-xs font-semibold text-slate-600">With improvement actions</h4><p className={"mt-2 text-3xl font-bold tracking-tight tabular-nums " + (financials.withActions < 0 ? "text-[#985216]" : "text-[#176b75]")}>{signedMoney(financials.withActions)}</p><p className="mt-1 text-xs text-slate-500">Alternative settlement scenario</p></div>
          <div><h4 className="text-xs font-semibold text-slate-600">Improvement opportunity</h4><p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-[#176b75]">{signedMoney(improvement(financials))}</p><p className="mt-1 text-xs text-slate-500">Change from the current projection</p></div>
        </div>
        <FinancialEnvelope scenario={financials} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <p><span className="font-bold text-slate-900">●</span> Projected settlement <span className="ml-3 font-bold text-[#176b75]">◇</span> With actions</p>
          <button type="button" className={rowButton} onClick={() => { setSort("opportunity"); setFilter("all"); document.getElementById("portfolio-program-table")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>View obligations ↓</button>
        </div>
        <details className="text-[11px] leading-5 text-slate-500"><summary className="cursor-pointer font-semibold text-[#176b75]">Scenario basis · {financials.count} programs modeled{financials.missing ? " · " + financials.missing + " not modeled" : ""}</summary><p className="mt-2">Illustrative annual financial ranges and settlement assumptions. Negative amounts are repayments or reduced payments; positive amounts are earnings or additional payments. Totals assume distinct payment streams in the selected program year; actual payment dates may differ. Quality scores and readiness percentages are not converted into dollars.</p><p className="mt-1">Improvement = settlement with actions − projected settlement. It is a scenario, not a guarantee. Envelope endpoints are scenario limits, not an expected-loss estimate or confidence interval. These examples are separate from the program-detail financial models.</p></details>
      </> : <div className="py-7"><p className="text-xl font-semibold text-slate-800">Financial envelope not modeled</p><p className="mt-2 text-sm text-slate-500">ASM preparation metrics are available below. Downside, upside and settlement projections have not been configured for {year}.</p></div>}
    </section>
    <section id="portfolio-program-table" className="scroll-mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-labelledby="portfolio-performance-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div><h3 id="portfolio-performance-title" className="text-base font-bold text-slate-900">Obligation performance</h3><p className="mt-1 text-xs text-slate-500">{rows.length} of {totals.count} programs · {totals.forecastBelow} forecast below target · {totals.dueSoon} work items due within 30 days</p></div>
        <div className="flex flex-wrap items-center gap-3"><div className="flex gap-1 rounded-lg bg-slate-100 p-1" aria-label="Forecast filter">{([ ["all", "All"], ["below", "Below target"], ["meets", "Meets target"] ] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={"rounded-md px-3 py-1.5 text-[11px] font-semibold " + (filter === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900")}>{label}</button>)}</div><label className="text-[11px] text-slate-500">Sort<select value={sort} onChange={event => setSort(event.target.value as typeof sort)} className="ml-2 rounded-md border border-slate-200 bg-white p-2 text-[11px] text-slate-700"><option value="opportunity">Improvement opportunity</option><option value="settlement">Projected settlement</option><option value="deadline">Next work due</option></select></label></div>
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 bg-[#fbfcfd] px-5 py-2 text-[10px] text-slate-500"><span>{financials ? "Financial scale: " + signedMoney(-axisMaximum) + " to " + signedMoney(axisMaximum) + " · ● Projected · ◇ With actions · │ $0" : "Financial estimates unavailable"}</span><span><span className="font-bold text-[#236f7e]">●</span> Current <span className="ml-3 font-bold text-[#236f7e]">◇</span> Forecast <span className="ml-3 font-bold text-slate-700">│</span> Internal target · Performance 0–100</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] table-fixed text-left"><thead className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="w-[19%] px-5 py-3">Obligation</th><th className="w-[33%] px-4 py-3">Financial envelope</th><th className="w-[27%] px-4 py-3">Performance</th><th className="w-[11%] px-4 py-3">Forecast gap</th><th className="w-[10%] px-4 py-3">Work due</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(program => {
        const context = portfolioMetricContext[program.id];
        const scenario = scenarioFor(program);
        const gap = program.forecast.target - program.forecast.projected;
        const due = nextProgramDeadline(program);
        return <Fragment key={program.id}><tr className="align-middle hover:bg-slate-50/70">
          <td className="px-5 py-4"><button type="button" onClick={() => onOpenProgram(program.id)} className="text-left text-sm font-bold text-[#176b75] hover:underline" aria-label={"Open " + program.shortTitle + " overview"}>{program.shortTitle === "AMBULATORY SPECIALTY" ? "ASM" : program.shortTitle} →</button><p className="mt-1 text-[10px] text-slate-500">{context.year} · {scenario ? "Illustrative scenario" : "Preparation"}</p><button type="button" aria-expanded={expanded === program.id} aria-controls={expanded === program.id ? "basis-" + program.id : undefined} onClick={() => setExpanded(expanded === program.id ? null : program.id)} className="mt-1 text-[10px] font-semibold text-slate-500 hover:text-[#176b75]">{expanded === program.id ? "−" : "+"} Basis</button></td>
          <td className="px-4 py-4">{scenario ? <FinancialEnvelope scenario={scenario} compact axisMaximum={axisMaximum} /> : <span className="text-xs text-slate-500">Not modeled</span>}</td>
          <td className="px-4 py-4"><PerformanceBullet program={program} /></td>
          <td className="px-4 py-4"><p className={"text-xs font-bold " + (gap > 0 ? "text-[#a65714]" : "text-[#176b75]")}>{gap > 0 ? gap + (context.unit === "%" ? " pp below" : " pts below") : gap < 0 ? Math.abs(gap) + (context.unit === "%" ? " pp above" : " pts above") : "Target met"}</p><p className="mt-1 text-[10px] text-slate-500">{gap > 0 ? "Forecast shortfall" : "At forecast"}</p></td>
          <td className="px-4 py-4">{due !== null ? <button type="button" className={rowButton + " -ml-2 " + (due <= 30 ? "!text-[#a65714]" : "")} onClick={() => onOpenWorklist(program.id)} aria-label={"Open " + program.shortTitle + " worklist, next due in " + due + " days"}>{due} days →</button> : <span className="text-xs text-slate-500">No open work</span>}<p className="text-[10px] text-slate-500">{program.workItems.length} work items</p></td>
        </tr>
          {expanded === program.id && <tr id={"basis-" + program.id}><td colSpan={5} className="bg-[#f6faf9] px-5 py-4"><div className="grid gap-4 md:grid-cols-2"><div><h4 className="text-xs font-bold text-slate-800">{program.shortTitle} · Scenario basis</h4><p className="mt-1 text-xs leading-5 text-slate-600">{scenario ? "Illustrative financial assumptions for this overview; not a customer forecast or a conversion of quality scores. Program-detail models use separate examples." : context.basis}</p><p className="mt-1 text-[11px] text-slate-500">{program.scope} · {program.deadline}</p></div><div className="text-xs leading-5 text-slate-600">{scenario ? <><p>Range: {signedMoney(scenario.downside)} to {signedMoney(scenario.upside)}. Projected: {signedMoney(scenario.projected)}.</p><p>With actions: {signedMoney(scenario.withActions)}. Improvement: {signedMoney(improvement(scenario))}.</p><p className="mt-1 text-[11px] text-slate-500">Improvement is the change between settlement scenarios, not a share of maximum downside.</p></> : <p>No financial envelope configured.</p>}</div></div></td></tr>}
        </Fragment>;
      })}{!rows.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">No programs match this forecast filter.</td></tr>}</tbody></table></div>
      <p className="border-t border-slate-200 bg-[#fbfcfd] px-5 py-3 text-[11px] leading-5 text-slate-500">Financial amounts are illustrative annual settlement scenarios. Performance uses each program’s own metric and internal target.</p>
    </section>
  </section>;
}
