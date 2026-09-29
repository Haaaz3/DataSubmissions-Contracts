"use client";

import { useMemo, useState } from "react";
import {
  hdiCrossProgramOpportunities,
  hdiExecutiveMetrics,
  hdiObligations,
  type HdiCrossProgramOpportunity,
  type HdiObligation,
  type HdiObligationId,
} from "@/data/synthetic/healthIntelligenceObligations";
import { healthSystemSnapshot } from "@/data/synthetic/healthSystemObligations";

type HdiView = "overview" | "worklist" | "action";
type HdiLens = "enterprise" | "quality";

const money = (value: number) => value >= 1000000 ? `$${(value / 1000000).toFixed(1)}M` : `$${Math.round(value / 1000)}K`;
const whole = (value: number) => value.toLocaleString("en-US");

function RelationshipBadge({ relationship }: { relationship: HdiCrossProgramOpportunity["relationship"] }) {
  const styles = {
    "Shared measure family": "bg-[#e8f3ef] text-[#285954] ring-[#b5d1ca]",
    "Related opportunity": "bg-[#fff6e7] text-[#8b5b1a] ring-[#ecd39c]",
    "Evidence reuse": "bg-[#eef2ff] text-[#4d5e9c] ring-[#cfd6f5]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${styles[relationship]}`}>{relationship}</span>;
}

function Breadcrumbs({ selected, view, onOverview, onWorklist }: { selected: HdiObligation; view: HdiView; onOverview: () => void; onWorklist: () => void }) {
  return <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
    <button type="button" onClick={onOverview} className="font-semibold text-[#176b75] hover:underline">Enterprise outlook</button>
    {view !== "overview" && <><span>/</span><span className="font-semibold text-slate-900">{selected.shortTitle}</span></>}
    {view === "action" && <><span>/</span><button type="button" onClick={onWorklist} className="font-semibold text-[#176b75] hover:underline">Worklist</button><span>/</span><span className="font-semibold text-slate-900">Operational detail</span></>}
  </div>;
}

function Metric({ label, value, detail, tone = "text-slate-900" }: { label: string; value: string; detail: string; tone?: string }) {
  return <div className="rounded-2xl border border-[#e3deda] bg-white p-5 shadow-sm">
    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className={`mt-2 text-3xl font-bold tracking-tight ${tone}`}>{value}</p>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
  </div>;
}

function trajectory(obligation: HdiObligation) {
  const delta = obligation.forecast.projected - obligation.forecast.current;
  return [
    obligation.forecast.current - Math.round(delta * 0.7),
    obligation.forecast.current - Math.round(delta * 0.4),
    obligation.forecast.current - Math.round(delta * 0.2),
    obligation.forecast.current,
    obligation.forecast.current + Math.round(delta * 0.55),
    obligation.forecast.projected,
  ];
}

function MiniTrend({ values, target, label = "Directional trajectory" }: { values: number[]; target?: number; label?: string }) {
  const width = 150;
  const height = 38;
  const allValues = target === undefined ? values : [...values, target];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * (width - 8) + 4},${height - 5 - ((value - min) / range) * (height - 12)}`).join(" ");
  const targetY = target === undefined ? undefined : height - 5 - ((target - min) / range) * (height - 12);
  return <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" role="img" aria-label={label}>
    {targetY !== undefined && <line x1="4" x2={width - 4} y1={targetY} y2={targetY} stroke="#cbd5e1" strokeDasharray="3 3" />}
    <polyline points={points} fill="none" stroke="#5270e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {values.slice(-1).map((value, index) => <circle key={`${value}-${index}`} cx={width - 4} cy={height - 5 - ((value - min) / range) * (height - 12)} r="3.5" fill="#5270e8" stroke="white" strokeWidth="1.5" />)}
  </svg>;
}

function GoalRing({ projected, target }: { projected: number; target: number }) {
  const attainment = Math.min(100, Math.max(0, (projected / Math.max(1, target)) * 100));
  const color = projected >= target ? "#2d8a78" : "#ed9b3b";
  return <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${attainment}%, #e8edf2 0)` }} aria-label={`${Math.round(attainment)} percent of target`}>
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-700">{projected}%</div>
  </div>;
}

function ContractReconciliation({ onOpenWorklist }: { onOpenWorklist: (id: HdiObligationId) => void }) {
  const contract = hdiObligations.find((obligation) => obligation.id === "vbc-contracts") ?? hdiObligations[0];
  const steps = [
    { label: "Benchmark spend", value: "$337.2M", detail: "Target PMPM × lives" },
    { label: "Actual spend", value: "$325.3M", detail: "12.0M below benchmark" },
    { label: "Gross savings", value: "$11.9M", detail: "3.0% of benchmark" },
    { label: "Quality share", value: "40%", detail: "2 of 6 gates met" },
    { label: "Expected recovery", value: money(contract.recoverableDollars), detail: "Current VBC forecast" },
  ];
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Contract economics</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">VBC reconciliation signal</h3></div><button type="button" onClick={() => onOpenWorklist("vbc-contracts")} className="text-xs font-semibold text-[#176b75] hover:underline">Open contract detail →</button></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]"><div className="rounded-xl bg-[#f5fbf8] p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#28737a]">Estimate</p><p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">{money(contract.recoverableDollars)}</p><p className="mt-1 text-xs text-slate-500">forecast recoverable</p><div className="mt-4 border-t border-[#dbe9e4] pt-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Potential at risk</p><p className="mt-1 text-lg font-bold text-amber-700">{money(contract.atRiskDollars)}</p></div></div><div className="relative overflow-x-auto"><div className="min-w-[620px]"><div className="absolute left-7 right-7 top-8 h-px bg-[#b5d1ca]" /><div className="relative grid grid-cols-5 gap-3">{steps.map((step, index) => <button type="button" key={step.label} onClick={() => onOpenWorklist("vbc-contracts")} className="group text-left"><div className="flex items-center gap-2"><span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-[#2d8a78] text-[10px] font-bold text-white shadow-sm">{index + 1}</span><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{index === steps.length - 1 ? "Outcome" : "Step"}</span></div><p className="mt-3 text-sm font-bold text-slate-900 group-hover:text-[#176b75]">{step.value}</p><p className="mt-1 text-[11px] font-semibold text-slate-700">{step.label}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{step.detail}</p></button>)}</div></div></div></div>
  </section>;
}

function MeasurePulseTable({ onOpenPatientWorklist }: { onOpenPatientWorklist: (measure: string) => void }) {
  const rows = hdiObligations.flatMap((obligation) => obligation.workItems.map((item) => ({ obligation, item }))).sort((a, b) => b.item.impact - a.item.impact).slice(0, 6);
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Measure pulse</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">The measures moving the portfolio</h3></div><span className="text-[11px] font-semibold text-slate-500">Click any row to open patients</span></div><div className="mt-4 overflow-x-auto"><div className="min-w-[680px]"><div className="grid grid-cols-[minmax(220px,1.4fr)_110px_120px_140px_95px] gap-3 border-b border-slate-100 pb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400"><span>Measure / obligation</span><span>Current → target</span><span>Trajectory</span><span>Modeled impact</span><span>Due</span></div><div className="divide-y divide-slate-100">{rows.map(({ obligation, item }) => <button key={item.id} type="button" onClick={() => onOpenPatientWorklist(item.driver)} className="grid w-full grid-cols-[minmax(220px,1.4fr)_110px_120px_140px_95px] items-center gap-3 py-3 text-left hover:bg-[#f8fbfa]"><span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-800">{item.driver}</span><span className="mt-0.5 block truncate text-[10px] text-slate-500">{obligation.shortTitle} · {item.practice}</span></span><span className="text-xs font-semibold text-slate-700">{obligation.forecast.current}% <span className="text-slate-300">→</span> {obligation.forecast.target}%</span><span><MiniTrend values={trajectory(obligation)} target={obligation.forecast.target} label={`${item.driver} trajectory`} /></span><span className="text-xs font-bold text-emerald-700">{money(item.impact)}</span><span className={`text-xs font-semibold ${item.dueInDays <= 21 ? "text-red-700" : "text-slate-600"}`}>{item.dueInDays}d <span className="text-[#176b75]">↗</span></span></button>)}</div></div></div></section>;
}

function ExpandedObligation({ obligation, opportunities, onWorklist, onOpenDataSubmissions, onOpenPatientWorklist }: { obligation: HdiObligation; opportunities: HdiCrossProgramOpportunity[]; onWorklist: (id: HdiObligationId) => void; onOpenDataSubmissions?: () => void; onOpenPatientWorklist: (measure: string) => void }) {
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
    <div className="rounded-xl border border-[#dbe9e4] bg-[#f8fbfa] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#28737a]">Obligation detail</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <div><dt className="text-xs text-slate-500">Sponsor</dt><dd className="mt-1 font-semibold text-slate-800">{obligation.sponsor}</dd></div>
        <div><dt className="text-xs text-slate-500">Deadline</dt><dd className="mt-1 font-semibold text-slate-800">{obligation.deadline}</dd></div>
        <div><dt className="text-xs text-slate-500">Scope</dt><dd className="mt-1 font-semibold text-slate-800">{obligation.scope}</dd></div>
        <div><dt className="text-xs text-slate-500">Forecast measure</dt><dd className="mt-1 font-semibold text-slate-800">{obligation.forecast.unit}</dd></div>
      </dl>
      <div className="mt-5 border-t border-[#dbe9e4] pt-4"><p className="text-xs text-slate-500">Forecast now</p><p className="mt-1 text-sm font-semibold text-slate-800">{obligation.forecast.current}% current · {obligation.forecast.projected}% projected</p></div>
      <button type="button" onClick={() => obligation.id === "mips-mvp" && onOpenDataSubmissions ? onOpenDataSubmissions() : onWorklist(obligation.id)} className="mt-5 w-full rounded-xl bg-[#285954] px-4 py-3 text-left text-sm font-semibold text-white hover:bg-[#1f4b47]">{obligation.id === "mips-mvp" ? "Open MIPS performance dashboard" : "Open coordinated worklist"} <span className="float-right">→</span></button>
    </div>
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#28737a]">Shared measures and related opportunities</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{opportunities.length} paths · Select a measure to open its patient worklist</p>
      <div className="mt-4 space-y-3">{opportunities.map((opportunity) => <div key={opportunity.id} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold text-slate-900">{opportunity.title}</h4><p className="mt-1 text-xs text-slate-500">{money(opportunity.recoverableDollars)} recoverable · {whole(opportunity.affectedLives)} lives</p></div><RelationshipBadge relationship={opportunity.relationship} /></div>
        <div className="mt-3 flex flex-wrap gap-2">{opportunity.measureSet.map((measure) => <button key={measure} type="button" onClick={() => onOpenPatientWorklist(measure)} className="group rounded-lg bg-slate-50 px-2.5 py-1.5 text-left text-xs text-slate-700 ring-1 ring-transparent transition hover:bg-[#e8f3ef] hover:text-[#176b75] hover:ring-[#b5d1ca]"><span>{measure}</span><span className="ml-1 text-[#176b75] opacity-0 transition group-hover:opacity-100">↗</span></button>)}</div>
        <div className="mt-3 border-t border-slate-100 pt-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Evidence in worklist</p><div className="mt-2 flex flex-wrap gap-1.5">{opportunity.sharedEvidence.map((evidence) => <button key={evidence} type="button" onClick={() => onOpenPatientWorklist(opportunity.measureSet[0])} className="rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:bg-[#e8f3ef] hover:text-[#176b75]">{evidence}</button>)}</div></div>
      </div>)}</div>
    </div>
  </div>;
}

function PortfolioPerformanceChart({ onWorklist }: { onWorklist: (id: HdiObligationId) => void }) {
  const maxRisk = Math.max(...hdiObligations.map((obligation) => obligation.atRiskDollars), 1);
  const maxGap = Math.max(...hdiObligations.map((obligation) => Math.max(0, obligation.forecast.target - obligation.forecast.projected)), 1);
  const focus = [...hdiObligations].sort((a, b) => b.atRiskDollars - a.atRiskDollars).slice(0, 3);
  const shortLabels: Record<HdiObligationId, string> = { "cms-team": "CMS TEAM", "vbc-contracts": "VBC", "mips-mvp": "MIPS", "ma-stars": "MA Stars", "medicaid-vbp": "Medicaid", "hospital-quality": "Hospital" };
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Portfolio signal map</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Financial exposure vs. performance gap</h3></div><div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#ef6c6c]" />below target</span><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#2d8a78]" />at target</span><span>Bubble size = lives</span></div></div>
    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_190px]">
      <div className="min-w-0"><div className="relative h-[270px] overflow-hidden rounded-xl border border-slate-100 bg-[#fbfcfd]"><svg viewBox="0 0 760 270" className="h-full w-full" role="img" aria-label="Clickable map of obligation financial exposure and performance gap"><line x1="54" y1="224" x2="730" y2="224" stroke="#cbd5e1" strokeWidth="1" /><line x1="54" y1="34" x2="54" y2="224" stroke="#cbd5e1" strokeWidth="1" />{[0.25, 0.5, 0.75].map((fraction) => <line key={fraction} x1="54" y1={224 - fraction * 190} x2="730" y2={224 - fraction * 190} stroke="#e8edf2" strokeDasharray="3 5" />)}{[0.25, 0.5, 0.75].map((fraction) => <line key={`v-${fraction}`} x1={54 + fraction * 676} y1="34" x2={54 + fraction * 676} y2="224" stroke="#f0f3f6" strokeDasharray="3 5" />)}<text x="54" y="252" fontSize="10" fill="#64748b">0 pts to target</text><text x="650" y="252" fontSize="10" fill="#64748b">{maxGap}+ pts</text><text x="10" y="42" fontSize="10" fill="#64748b">{money(maxRisk)}</text><text x="18" y="228" fontSize="10" fill="#64748b">$0</text><text x="58" y="20" fontSize="10" fill="#94a3b8">value at risk</text>{hdiObligations.map((obligation) => { const gap = Math.max(0, obligation.forecast.target - obligation.forecast.projected); const cx = 54 + (gap / maxGap) * 676; const cy = 224 - (obligation.atRiskDollars / maxRisk) * 190; const radius = Math.min(25, Math.max(11, 9 + Math.sqrt(obligation.lives / 5000))); const fill = gap > 0 ? "#ef6c6c" : "#2d8a78"; return <g key={obligation.id} role="button" tabIndex={0} aria-label={`Open ${obligation.title}`} onClick={() => onWorklist(obligation.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onWorklist(obligation.id); }} className="cursor-pointer"><circle cx={cx} cy={cy} r={radius + 5} fill="white" opacity="0.9" /><circle cx={cx} cy={cy} r={radius} fill={fill} opacity="0.92" stroke="white" strokeWidth="2" /><text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="white">{shortLabels[obligation.id]}</text><title>{`${obligation.title}: ${money(obligation.atRiskDollars)} at risk · ${gap} pts to target`}</title></g>; })}</svg></div><div className="mt-2 flex justify-between px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><span>Closer to target</span><span>More performance gap →</span></div></div>
      <div className="space-y-2.5"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Largest decision signals</p>{focus.map((obligation) => <button key={obligation.id} type="button" onClick={() => onWorklist(obligation.id)} className="w-full rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-left hover:border-[#b5d1ca] hover:bg-[#f1f8f5]"><div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-800">{obligation.shortTitle}</span><span className="text-xs font-bold text-amber-700">{money(obligation.atRiskDollars)}</span></div><p className="mt-1 text-[11px] text-slate-500">{obligation.forecast.projected}% forecast · {Math.max(0, obligation.forecast.target - obligation.forecast.projected)} pts to target</p><span className="mt-2 block text-[10px] font-semibold text-[#176b75]">Open obligation →</span></button>)}</div>
    </div>
  </section>;
}

function AttentionQueue({ onOpenPatientWorklist }: { onOpenPatientWorklist: (measure: string) => void }) {
  const workItems = hdiObligations.flatMap((obligation) => obligation.workItems.map((item) => ({ ...item, obligation })) ).sort((a, b) => b.impact - a.impact).slice(0, 4);
  const maxImpact = Math.max(...workItems.map((item) => item.impact), 1);
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Action queue</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Highest-value work</h3></div><span className="rounded-full bg-[#fff6e7] px-2.5 py-1 text-[11px] font-semibold text-[#8b5b1a]">Impact-ranked</span></div><div className="mt-4 grid grid-cols-2 gap-3">{workItems.map((item, index) => <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="flex items-start justify-between gap-2"><div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#2d8a78 ${Math.round((item.impact / maxImpact) * 100)}%, #dbe9e4 0)` }}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#285954]">{index + 1}</span></div><p className="text-right text-sm font-bold text-emerald-700">{money(item.impact)}</p></div><button type="button" onClick={() => onOpenPatientWorklist(item.driver)} className="mt-3 block truncate text-left text-xs font-bold text-slate-900 hover:text-[#176b75]">{item.driver} ↗</button><p className="mt-1 truncate text-[10px] text-slate-500">{item.obligation.shortTitle} · {item.dueInDays}d</p><button type="button" onClick={() => onOpenPatientWorklist(item.driver)} className="mt-2 text-[10px] font-semibold text-[#176b75] hover:underline">Open patients</button></div>)}</div></section>;
}

function SharedMeasureMap({ onOpenPatientWorklist }: { onOpenPatientWorklist: (measure: string) => void }) {
  const columns: Array<{ id: HdiObligationId; label: string }> = [{ id: "cms-team", label: "TEAM" }, { id: "vbc-contracts", label: "VBC" }, { id: "mips-mvp", label: "MIPS" }, { id: "ma-stars", label: "MA" }, { id: "medicaid-vbp", label: "STATE" }, { id: "hospital-quality", label: "HOSP" }];
  const labels: Record<string, string> = { "transitions-readmissions": "Transitions", "medication-continuity": "Medication", "ed-follow-up": "ED follow-up", "digital-evidence": "Evidence" };
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Shared measure map</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Measures that travel across obligations</h3></div><span className="text-[11px] font-semibold text-slate-500">Select a dot to open patients</span></div><div className="mt-5 overflow-x-auto"><div className="min-w-[620px]"><div className="grid grid-cols-[minmax(120px,1fr)_repeat(6,42px)_74px] items-center gap-2 border-b border-slate-100 pb-2 text-[9px] font-bold uppercase tracking-wide text-slate-400"><span>Measure family</span>{columns.map((column) => <span key={column.id} className="text-center">{column.label}</span>)}<span className="text-right">Lives</span></div><div className="divide-y divide-slate-100">{hdiCrossProgramOpportunities.map((opportunity) => <div key={opportunity.id} className="grid grid-cols-[minmax(120px,1fr)_repeat(6,42px)_74px] items-center gap-2 py-3"><div><p className="text-xs font-bold text-slate-800">{labels[opportunity.id] ?? opportunity.title}</p><p className="mt-0.5 text-[10px] text-slate-500">{money(opportunity.recoverableDollars)} recoverable</p></div>{columns.map((column) => { const linked = opportunity.obligationIds.includes(column.id); return linked ? <button key={column.id} type="button" onClick={() => onOpenPatientWorklist(opportunity.measureSet[0])} className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#2d8a78] text-[10px] font-bold text-white shadow-sm hover:bg-[#176b75]" aria-label={`Open ${labels[opportunity.id]} patients for ${column.label}`}>✓</button> : <span key={column.id} className="mx-auto h-2 w-2 rounded-full bg-slate-200" />; })}<span className="text-right text-xs font-semibold text-slate-700">{whole(opportunity.affectedLives)}</span></div>)}</div></div></div></section>;
}

function ObligationCard({ obligation, opportunities, expanded, onToggle, onWorklist, onOpenDataSubmissions, onOpenPatientWorklist }: { obligation: HdiObligation; opportunities: HdiCrossProgramOpportunity[]; expanded: boolean; onToggle: () => void; onWorklist: (id: HdiObligationId) => void; onOpenDataSubmissions?: () => void; onOpenPatientWorklist: (measure: string) => void }) {
  const topWork = [...obligation.workItems].sort((a, b) => b.impact - a.impact)[0];
  const nextDue = Math.min(...obligation.workItems.map((item) => item.dueInDays));
  const gap = obligation.forecast.target - obligation.forecast.projected;
  return <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${expanded ? "border-[#8ebdb0] ring-2 ring-[#e8f3ef]" : "border-[#e2e7ee]"}`}>
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">{obligation.category}</p><button type="button" onClick={onToggle} className="mt-1 text-left text-lg font-bold tracking-tight text-slate-900 hover:text-[#176b75]">{obligation.title}</button><p className="mt-1 text-xs text-slate-500">{obligation.scope} · {obligation.deadline}</p></div><button type="button" onClick={onToggle} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#176b75] hover:bg-[#f1f8f5]">{expanded ? "Hide detail" : "View detail"}</button></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">At risk</p><p className="mt-1 text-lg font-bold text-amber-700">{money(obligation.atRiskDollars)}</p></div><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Recoverable</p><p className="mt-1 text-lg font-bold text-emerald-700">{money(obligation.recoverableDollars)}</p></div><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Lives</p><p className="mt-1 text-lg font-bold text-slate-900">{whole(obligation.lives)}</p></div><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Next due</p><p className="mt-1 text-lg font-bold text-slate-900">{nextDue}d</p></div></div>
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_150px] items-end gap-4"><div><div className="flex items-center gap-3"><GoalRing projected={obligation.forecast.projected} target={obligation.forecast.target} /><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{obligation.forecast.unit}</p><p className="mt-1 text-sm font-semibold text-slate-800"><span className="text-[#f36d6d]">{obligation.forecast.current}% current</span><span className="px-1.5 text-slate-300">→</span><span className="text-[#5270e8]">{obligation.forecast.projected}% forecast</span><span className="px-1.5 text-slate-300">·</span><span className="text-slate-600">{obligation.forecast.target}% target</span></p><p className={`mt-1 text-xs font-semibold ${gap > 0 ? "text-amber-700" : "text-emerald-700"}`}>{gap > 0 ? `${gap} pts to target` : "At target"}</p></div></div></div><div><p className="mb-1 text-right text-[9px] font-bold uppercase tracking-wide text-slate-400">Trajectory</p><MiniTrend values={trajectory(obligation)} target={obligation.forecast.target} /></div></div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Highest-value driver</p><button type="button" onClick={() => onOpenPatientWorklist(topWork.driver)} className="mt-1 truncate text-left text-sm font-semibold text-[#176b75] hover:underline">{topWork.driver} ↗</button><p className="mt-0.5 text-xs text-slate-500">{money(topWork.impact)} modeled impact · {topWork.dueInDays} days</p></div><button type="button" onClick={() => obligation.id === "mips-mvp" && onOpenDataSubmissions ? onOpenDataSubmissions() : onWorklist(obligation.id)} className="rounded-xl bg-[#285954] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1f4b47]">{obligation.id === "mips-mvp" ? "Open performance" : "Open worklist"} <span className="ml-1">→</span></button></div>
    </div>
    {expanded && <div className="border-t border-[#dbe9e4] bg-[#fbfaf8] px-5 py-5 sm:px-6"><ExpandedObligation obligation={obligation} opportunities={opportunities} onWorklist={onWorklist} onOpenDataSubmissions={onOpenDataSubmissions} onOpenPatientWorklist={onOpenPatientWorklist} /></div>}
  </article>;
}

type HdiCommandPlaneProps = {
  onOpenDataSubmissions?: (target: { program: string; route: string; scenario?: string }) => void;
  onOpenPmAnalytics?: () => void;
  onOpenPatientWorklist?: (measure: string) => void;
};

export default function HealthDataIntelligenceCommandPlane({ onOpenDataSubmissions, onOpenPmAnalytics, onOpenPatientWorklist }: HdiCommandPlaneProps) {
  const [view, setView] = useState<HdiView>("overview");
  const [lens, setLens] = useState<HdiLens>("enterprise");
  const [selectedId, setSelectedId] = useState<HdiObligationId>("cms-team");
  const [expandedId, setExpandedId] = useState<HdiObligationId | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("team-readmit-1");
  const [startedActions, setStartedActions] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = useMemo(() => hdiObligations.find((obligation) => obligation.id === selectedId) ?? hdiObligations[0], [selectedId]);
  const selectedWork = useMemo(() => selected.workItems.find((item) => item.id === selectedWorkId) ?? selected.workItems[0], [selected, selectedWorkId]);
  const opportunitiesFor = (id: HdiObligationId) => hdiCrossProgramOpportunities.filter((opportunity) => opportunity.obligationIds.includes(id));
  const attentionCount = hdiObligations.filter((obligation) => obligation.forecast.projected < obligation.forecast.target || Math.min(...obligation.workItems.map((item) => item.dueInDays)) <= 30).length;

  const toggleObligation = (id: HdiObligationId) => {
    setSelectedId(id);
    setExpandedId((current) => current === id ? null : id);
    setNotice(null);
  };
  const openWorklist = (id: HdiObligationId) => {
    setSelectedId(id);
    const next = hdiObligations.find((obligation) => obligation.id === id);
    if (next?.workItems[0]) setSelectedWorkId(next.workItems[0].id);
    setView("worklist");
    setNotice(null);
  };
  const openObligationDestination = (id: HdiObligationId) => {
    if (id === "mips-mvp" && onOpenDataSubmissions) {
      onOpenDataSubmissions({ program: "MIPS", route: "performance", scenario: "mips-performance" });
      return;
    }
    openWorklist(id);
  };
  const openMipsDashboard = () => {
    if (onOpenDataSubmissions) {
      onOpenDataSubmissions({ program: "MIPS", route: "performance", scenario: "mips-performance" });
      return;
    }
    setNotice("The MIPS performance dashboard is available in Data Submissions.");
  };
  const openDetailedAnalytics = () => {
    if (onOpenPmAnalytics) {
      onOpenPmAnalytics();
      return;
    }
    startAction();
  };
  const openPatientWorklist = (measure: string) => {
    if (onOpenPatientWorklist) {
      onOpenPatientWorklist(measure);
      return;
    }
    const normalized = measure.toLowerCase();
    const mappedMeasure = normalized.includes("medication") || normalized.includes("adherence")
      ? "Medication Adherence"
      : normalized.includes("ed") || normalized.includes("follow-up")
      ? "Follow-up after ED"
      : normalized.includes("evidence") || normalized.includes("ecqm") || normalized.includes("cqm")
      ? "A1c Control"
      : "Post Discharge Follow-up";
    const params = new URLSearchParams({ product: "pm-sandbox", measure: mappedMeasure, source: "hdi-shared-measure", context: measure });
    window.location.assign(`/population?${params.toString()}`);
  };
  const startAction = () => {
    if (!startedActions.includes(selectedWork.id)) setStartedActions((current) => [...current, selectedWork.id]);
    setNotice(`${selectedWork.title} is now in progress for ${selectedWork.owner}.`);
  };

  return <div className="space-y-6 pb-16">
    <section className="overflow-hidden rounded-3xl bg-[#213a40] text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/15 px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-xs font-bold tracking-[0.18em]">HDI</span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d3e4df]">Oracle Health</p><h1 className="text-xl font-semibold tracking-tight">HDI Command Center</h1></div></div>
        <div className="flex items-center gap-2 rounded-xl bg-[#142b31] p-1 text-xs font-semibold"><button type="button" onClick={() => setLens("enterprise")} className={`rounded-lg px-3 py-2 ${lens === "enterprise" ? "bg-[#faf7f0] text-[#213a40]" : "text-white/75 hover:text-white"}`}>Finance & contracting</button><button type="button" onClick={() => setLens("quality")} className={`rounded-lg px-3 py-2 ${lens === "quality" ? "bg-[#faf7f0] text-[#213a40]" : "text-white/75 hover:text-white"}`}>Quality executive</button></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 sm:px-8"><p className="text-sm text-white/75">Hyperion Health System <span className="px-1 text-white/35">·</span> PY 2026 enterprise obligation portfolio</p><nav className="flex gap-1 text-xs font-semibold" aria-label="HDI workspace views"><button type="button" onClick={() => setView("overview")} className={`rounded-lg px-3 py-2 ${view === "overview" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Overview</button><button type="button" onClick={() => setView("worklist")} className={`rounded-lg px-3 py-2 ${view === "worklist" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Obligation worklist</button><button type="button" onClick={() => setView("action")} className={`rounded-lg px-3 py-2 ${view === "action" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Action center</button></nav></div>
    </section>

    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</div>}

    {view === "overview" && <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Executive home</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Portfolio-wide performance across cost, quality, utilization, and obligations.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">A single operating view for finance, contracting, quality, and care teams. Select any obligation, driver, or measure to move directly into the work that changes performance.</p></div><div className="rounded-xl border border-[#e3deda] bg-white px-4 py-3 text-right shadow-sm"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Active lens</p><p className="mt-1 text-sm font-semibold text-slate-900">{lens === "enterprise" ? "Finance & contracting" : "Quality executive"}</p></div></section>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Active obligations" value={whole(hdiObligations.length)} detail={`${hdiExecutiveMetrics.obligations} linked measures · ${hdiExecutiveMetrics.programs} program families`} /><Metric label="Attributed lives" value={whole(healthSystemSnapshot.attributedLives)} detail={`${healthSystemSnapshot.markets} markets · ${healthSystemSnapshot.hospitals} hospitals`} /><Metric label="Obligations needing attention" value={whole(attentionCount)} detail="Below target or with work due in 30 days" tone="text-amber-700" /><Metric label="Recoverable opportunity" value={money(hdiExecutiveMetrics.recoverableDollars)} detail={`${money(hdiExecutiveMetrics.atRiskDollars)} total value at risk`} tone="text-emerald-700" /></section>

      <PortfolioPerformanceChart onWorklist={openObligationDestination} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"><AttentionQueue onOpenPatientWorklist={openPatientWorklist} /><SharedMeasureMap onOpenPatientWorklist={openPatientWorklist} /></div>

      <ContractReconciliation onOpenWorklist={openWorklist} />

      <MeasurePulseTable onOpenPatientWorklist={openPatientWorklist} />

      <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Obligation portfolio</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Performance at a glance</h3><p className="mt-1 text-xs text-slate-500">Every card pairs financial exposure, performance trajectory, and the next highest-value measure.</p></div><button type="button" onClick={() => setView("worklist")} className="text-xs font-semibold text-[#176b75] hover:underline">Open all worklists →</button></div><div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">{hdiObligations.map((obligation) => <ObligationCard key={obligation.id} obligation={obligation} opportunities={opportunitiesFor(obligation.id)} expanded={expandedId === obligation.id} onToggle={() => toggleObligation(obligation.id)} onWorklist={openWorklist} onOpenDataSubmissions={obligation.id === "mips-mvp" ? openMipsDashboard : undefined} onOpenPatientWorklist={openPatientWorklist} />)}</div></section>

      <details className="rounded-2xl border border-[#e3deda] bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3"><span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Shared opportunity detail</span><span className="mt-1 block text-base font-semibold text-slate-900">All cross-program pathways</span></span><span className="rounded-full bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#285954]">{hdiCrossProgramOpportunities.length} pathways · {money(hdiCrossProgramOpportunities.reduce((sum, opportunity) => sum + opportunity.recoverableDollars, 0))} recoverable</span></summary><div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-medium text-slate-500">Select a measure or evidence signal to open the patient worklist.</p><div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">{hdiCrossProgramOpportunities.map((opportunity) => <article key={opportunity.id} className="rounded-xl border border-slate-200 bg-[#fbfaf8] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-slate-900">{opportunity.title}</h4><p className="mt-1 text-xs text-slate-500">{money(opportunity.recoverableDollars)} recoverable · {whole(opportunity.affectedLives)} lives touched</p></div><RelationshipBadge relationship={opportunity.relationship} /></div><div className="mt-3 flex flex-wrap gap-1.5">{opportunity.measureSet.map((measure) => <button key={measure} type="button" onClick={() => openPatientWorklist(measure)} className="group rounded-md bg-white px-2 py-1 text-left text-[11px] text-slate-700 ring-1 ring-slate-200 hover:bg-[#e8f3ef] hover:text-[#176b75]">{measure} <span className="text-[#176b75] opacity-0 group-hover:opacity-100">↗</span></button>)}</div><div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200 pt-3">{opportunity.sharedEvidence.slice(0, 4).map((evidence) => <button key={evidence} type="button" onClick={() => openPatientWorklist(opportunity.measureSet[0])} className="rounded-md bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-[#e8f3ef] hover:text-[#176b75]">{evidence} ↗</button>)}</div></article>)}</div></div></details>
    </div>}

    {view === "worklist" && <section className="space-y-6"><Breadcrumbs selected={selected} view={view} onOverview={() => setView("overview")} onWorklist={() => setView("worklist")} /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Operational worklist</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{selected.shortTitle} worklist</h2><p className="mt-2 text-sm text-slate-500">{selected.workItems.length} work items · {opportunitiesFor(selected.id).length} shared paths</p></div><button type="button" onClick={() => setView("overview")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to portfolio</button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Metric label="Open actions" value={whole(selected.workItems.length)} detail="Across practice owners" tone="text-[#176b75]" /><Metric label="Modeled impact" value={money(selected.workItems.reduce((sum, item) => sum + item.impact, 0))} detail="If work lands on time" tone="text-emerald-700" /><Metric label="Next deadline" value={`${Math.min(...selected.workItems.map((item) => item.dueInDays))} days`} detail="Earliest practice action" tone="text-red-700" /></div><div className="overflow-hidden rounded-2xl border border-[#e3deda] bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h3 className="font-semibold text-slate-900">Practice action queue</h3><p className="mt-1 text-xs text-slate-500">Select a measure to open the patient worklist.</p></div><div className="divide-y divide-slate-100">{selected.workItems.map((item) => <div key={item.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1.5fr)_180px_110px_160px_auto] lg:items-center"><div><h4 className="font-semibold text-slate-900">{item.title}</h4><p className="mt-1 text-xs text-slate-500">{item.practice} · {item.market} · {item.owner}</p><p className="mt-2 text-xs text-slate-500">{item.evidence}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Focus measure</p><button type="button" onClick={() => openPatientWorklist(item.driver)} className="mt-1 text-left text-sm font-semibold text-[#176b75] hover:underline">{item.driver} ↗</button></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Due</p><p className={`mt-1 text-sm font-semibold ${item.dueInDays <= 21 ? "text-red-700" : "text-slate-700"}`}>{item.dueInDays} days</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Impact</p><p className="mt-1 text-sm font-semibold text-emerald-700">{money(item.impact)}</p></div><button type="button" onClick={() => openPatientWorklist(item.driver)} className="rounded-xl border border-[#b5d1ca] bg-[#f5fbf8] px-3 py-2 text-xs font-semibold text-[#285954] hover:bg-[#e8f3ef]">Open patient list →</button></div>)}</div></div></section>}

    {view === "action" && <section className="space-y-6"><Breadcrumbs selected={selected} view={view} onOverview={() => setView("overview")} onWorklist={() => setView("worklist")} /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Operational detail</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{selectedWork.title}</h2><p className="mt-2 text-sm text-slate-500">{selected.shortTitle} · {selectedWork.practice} · owner {selectedWork.owner}</p></div><div className="rounded-lg bg-[#e8f3ef] px-3 py-2 text-xs font-semibold text-[#285954]">{startedActions.includes(selectedWork.id) ? "Action in progress" : "Ready to review"}</div></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-6"><div className="rounded-2xl border border-[#e3deda] bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-slate-900">Why this work is here</h3><div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs text-slate-500">{selectedWork.evidence}</span><button type="button" onClick={() => openPatientWorklist(selectedWork.driver)} className="rounded-lg bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#285954] hover:bg-[#dbe9e4]">Open patient list ↗</button><span className="text-xs font-semibold text-emerald-700">{money(selectedWork.impact)} opportunity</span></div><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Work type</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.actionType}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Practice</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.practice}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Due</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.dueInDays} days</p></div></div></div><div className="rounded-2xl border border-[#b5d1ca] bg-[#f5fbf8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Dashboard handoff</p><h3 className="mt-2 text-xl font-bold text-slate-900">{selected.id === "mips-mvp" ? "MIPS performance dashboard" : selectedWork.actionLabel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{selected.id === "mips-mvp" ? "Scorecard and patient detail in Data Submissions." : "Patient list and detailed analytics in Quality."}</p>{selected.id === "mips-mvp" ? <button type="button" onClick={openMipsDashboard} className="mt-6 rounded-xl bg-[#285954] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f4b47]">Open MIPS performance dashboard <span className="ml-2">→</span></button> : <button type="button" onClick={openDetailedAnalytics} className="mt-6 rounded-xl bg-[#285954] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f4b47]">Open detailed analytics <span className="ml-2">→</span></button>}</div></div><aside className="h-fit rounded-2xl border border-[#e3deda] bg-[#f8fbfa] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Context</p><h3 className="mt-2 text-xl font-bold text-slate-900">{selectedWork.actionLabel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Select a measure or patient list to continue.</p><button type="button" onClick={() => setView("worklist")} className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Return to worklist</button><div className="mt-5 border-t border-[#dbe9e4] pt-4 text-xs text-slate-500"><p>Measure family</p><p className="mt-1 font-semibold text-slate-700">{selectedWork.driver}</p><p className="mt-3">Forecast source</p><p className="mt-1 font-semibold text-slate-700">{selected.sponsor} · {selected.deadline}</p></div></aside></div></section>}
  </div>;
}
