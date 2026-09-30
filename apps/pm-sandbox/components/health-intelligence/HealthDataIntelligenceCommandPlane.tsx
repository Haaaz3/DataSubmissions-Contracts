"use client";

import { useEffect, useMemo, useState } from "react";
import {
  hdiCrossProgramOpportunities,
  hdiObligations,
  type HdiCrossProgramOpportunity,
  type HdiObligation,
  type HdiObligationId,
} from "@/data/synthetic/healthIntelligenceObligations";
import { mockContracts } from "@/lib/mockData";
import { vbcFinancialSummary } from "@/lib/contracts/vbcFinancials";
import { portfolioMoney } from "@/lib/health-intelligence/portfolioSummary";
import { signedMoney } from "@/lib/health-intelligence/financialEnvelope";
import PortfolioExecutiveSummary from "@/components/health-intelligence/PortfolioExecutiveSummary";
import { programMeasureCatalogs } from "@/data/reference/programQualityMeasures";
import { modelViewKeys } from "@/data/synthetic/modelProgram";
import ProgramOverview from "@/components/health-intelligence/ProgramOverview";
import HdiContractDetail from "@/components/health-intelligence/HdiContractDetail";
import SharedMeasurePatientList from "@/components/health-intelligence/SharedMeasurePatientList";
import { measurePatientHref, measurePatientState, parseMeasurePatientState, type MeasurePatientListState, type MeasurePatientStatus } from "@/lib/health-intelligence/measurePopulation";
import SharedMeasureExplorer from "@/components/health-intelligence/SharedMeasureExplorer";
import MeasureImpactMetrics from "@/components/health-intelligence/MeasureImpactMetrics";
import { sharedMeasureFamilies, type SharedMeasureFamily, type MeasureObligation } from "@/data/synthetic/sharedMeasures";

type HdiView = "overview" | "program" | "contract" | "worklist" | "action" | "measure-patients";
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

function WorkspaceNavigation({ view, selected, onNavigate }: { view: HdiView; selected: HdiObligation; onNavigate: (next: HdiView) => void }) {
  const items: Array<{ id: HdiView; label: string; helper: string }> = [
    { id: "overview", label: "Portfolio", helper: "All obligations" },
    { id: "program", label: "Programs", helper: "Program scorecards" },
    { id: "worklist", label: "Worklists", helper: "Open practice work" },
    { id: "action", label: "Action center", helper: "Operational detail" },
  ];
  const navView = view === "contract" ? "program" : view === "measure-patients" ? "worklist" : view;
  const current = items.find((item) => item.id === navView) ?? items[0];
  return <section className="rounded-xl border border-[#dce5e7] bg-white shadow-sm" aria-label="HDI workspace navigation">
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2 text-xs"><button type="button" onClick={() => onNavigate("overview")} className="font-bold text-[#176b75] hover:underline">HDI Command Center</button><span className="text-slate-300">/</span><span className="truncate font-semibold text-slate-700">{current.label}</span>{view !== "overview" && <><span className="text-slate-300">/</span><span className="truncate text-slate-500">{view === "measure-patients" ? "Shared measures" : selected.shortTitle}</span></>}</div>
      <nav className="flex flex-wrap items-center gap-1" aria-label="HDI sections">{items.map((item) => <button key={item.id} type="button" onClick={() => onNavigate(item.id)} aria-current={navView === item.id ? "page" : undefined} className={`rounded-lg px-3 py-2 text-left transition ${navView === item.id ? "bg-[#213a40] text-white" : "text-slate-600 hover:bg-[#f1f6f5] hover:text-[#176b75]"}`}><span className="block text-[11px] font-bold">{item.label}</span><span className={`mt-0.5 block text-[9px] ${navView === item.id ? "text-white/70" : "text-slate-400"}`}>{item.helper}</span></button>)}</nav>
    </div>
    {view !== "overview" && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-[#f8fbfa] px-4 py-2 text-[10px] font-semibold text-slate-500"><span>You are here: <strong className="text-slate-700">{current.label}</strong>{view === "program" || view === "contract" || view === "worklist" || view === "action" ? <span> · {selected.title}</span> : null}</span><button type="button" onClick={() => onNavigate("overview")} className="text-[#176b75] hover:underline">Return to portfolio overview →</button></div>}
  </section>;
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

function GoalRing({ projected, target, unit }: { projected: number; target: number; unit: string }) {
  const attainment = Math.min(100, Math.max(0, (projected / Math.max(1, target)) * 100));
  const color = projected >= target ? "#2d8a78" : "#ed9b3b";
  return <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${color} ${attainment}%, #e8edf2 0)` }} aria-label={`${projected}${unit.includes("%") ? " percent" : " points"}; target ${target}`}>
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-700">{projected}{unit.includes("%") ? "%" : " pts"}</div>
  </div>;
}

function ContractReconciliation({ onOpenProgram }: { onOpenProgram: (id: HdiObligationId) => void }) {
  const totals = vbcFinancialSummary(mockContracts);
  const steps = [
    { label: "Medical budget", value: portfolioMoney(totals.benchmarkSpend), detail: "Benchmark PMPM × member months" },
    { label: "Medical expense", value: portfolioMoney(totals.actualSpend), detail: "Current PMPM × member months" },
    { label: "Projected settlement", value: signedMoney(totals.projected), detail: "After sharing, quality gates and caps" },
    { label: "With actions", value: signedMoney(totals.withActions), detail: "Same contract terms" },
    { label: "Settlement improvement", value: signedMoney(totals.improvement), detail: "Change from current projection" },
  ];
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold text-slate-900">VBC settlement</h3><button type="button" onClick={() => onOpenProgram("vbc-contracts")} className="text-xs font-semibold text-[#176b75] hover:underline">Open payer contracts →</button></div>
    <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{steps.map(step => <div key={step.label}><dt className="text-xs text-slate-500">{step.label}</dt><dd className="mt-2 text-xl font-bold text-slate-900">{step.value}</dd><dd className="mt-1 text-[11px] text-slate-500">{step.detail}</dd></div>)}</dl>
    <p className="mt-4 text-[11px] text-slate-500">PY {totals.year} · {totals.count} contracts · Illustrative annual provider settlements. Medical expense and settlement are separate amounts.</p>
  </section>;
}

function MeasurePulseTable({ onOpenPatientWorklist }: { onOpenPatientWorklist: (measure: string) => void }) {
  const rows = hdiObligations.flatMap((obligation) => obligation.workItems.map((item) => ({ obligation, item }))).sort((a, b) => b.item.impact - a.item.impact).slice(0, 6);
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Operational drivers</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Program work</h3></div><span className="text-[11px] font-semibold text-slate-500">Select a row for detail</span></div><div className="mt-4 overflow-x-auto"><div className="min-w-[680px]"><div className="grid grid-cols-[minmax(220px,1.4fr)_110px_120px_140px_95px] gap-3 border-b border-slate-100 pb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400"><span>Driver / program</span><span>Modeled forecast</span><span>Trajectory</span><span>Modeled impact</span><span>Due</span></div><div className="divide-y divide-slate-100">{rows.map(({ obligation, item }) => <button key={item.id} type="button" onClick={() => onOpenPatientWorklist(item.driver)} className="grid w-full grid-cols-[minmax(220px,1.4fr)_110px_120px_140px_95px] items-center gap-3 py-3 text-left hover:bg-[#f8fbfa]"><span className="min-w-0"><span className="block truncate text-xs font-bold text-slate-800">{item.driver}</span><span className="mt-0.5 block truncate text-[10px] text-slate-500">{obligation.shortTitle} · {item.practice}</span></span><span className="text-xs font-semibold text-slate-700">{obligation.forecast.current}{obligation.forecast.unit.includes("%") ? "%" : " pts"} <span className="text-slate-300">→</span> {obligation.forecast.target}{obligation.forecast.unit.includes("%") ? "%" : " pts"}</span><span><MiniTrend values={trajectory(obligation)} target={obligation.forecast.target} label={`${item.driver} trajectory`} /></span><span className="text-xs font-bold text-emerald-700">{money(item.impact)}</span><span className={`text-xs font-semibold ${item.dueInDays <= 21 ? "text-red-700" : "text-slate-600"}`}>{item.dueInDays}d <span className="text-[#176b75]">↗</span></span></button>)}</div></div></div></section>;
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
      <div className="mt-5 border-t border-[#dbe9e4] pt-4"><p className="text-xs text-slate-500">Forecast now</p><p className="mt-1 text-sm font-semibold text-slate-800">{obligation.forecast.current}{obligation.forecast.unit.includes("%") ? "%" : " pts"} current · {obligation.forecast.projected}{obligation.forecast.unit.includes("%") ? "%" : " pts"} projected</p></div>
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

function AttentionQueue({ onOpenPatientWorklist }: { onOpenPatientWorklist: (measure: string) => void }) {
  const workItems = hdiObligations.flatMap((obligation) => obligation.workItems.map((item) => ({ ...item, obligation })) ).sort((a, b) => b.impact - a.impact).slice(0, 4);
  const maxImpact = Math.max(...workItems.map((item) => item.impact), 1);
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Action queue</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Highest-value work</h3></div><span className="rounded-full bg-[#fff6e7] px-2.5 py-1 text-[11px] font-semibold text-[#8b5b1a]">Impact-ranked</span></div><div className="mt-4 grid grid-cols-2 gap-3">{workItems.map((item, index) => <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="flex items-start justify-between gap-2"><div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#2d8a78 ${Math.round((item.impact / maxImpact) * 100)}%, #dbe9e4 0)` }}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#285954]">{index + 1}</span></div><p className="text-right text-sm font-bold text-emerald-700">{money(item.impact)}</p></div><button type="button" onClick={() => onOpenPatientWorklist(item.driver)} className="mt-3 block truncate text-left text-xs font-bold text-slate-900 hover:text-[#176b75]">{item.driver} ↗</button><p className="mt-1 truncate text-[10px] text-slate-500">{item.obligation.shortTitle} · {item.dueInDays}d</p><button type="button" onClick={() => onOpenPatientWorklist(item.driver)} className="mt-2 text-[10px] font-semibold text-[#176b75] hover:underline">Open detail</button></div>)}</div></section>;
}

function ObligationCard({ obligation, opportunities, expanded, onToggle, onOpenProgram, onWorklist, onOpenDataSubmissions, onOpenPatientWorklist }: { obligation: HdiObligation; opportunities: HdiCrossProgramOpportunity[]; expanded: boolean; onToggle: () => void; onOpenProgram: () => void; onWorklist: (id: HdiObligationId) => void; onOpenDataSubmissions?: () => void; onOpenPatientWorklist: (measure: string) => void }) {
  const topWork = [...obligation.workItems].sort((a, b) => b.impact - a.impact)[0];
  const nextDue = Math.min(...obligation.workItems.map((item) => item.dueInDays));
  const gap = obligation.forecast.target - obligation.forecast.projected;
  return <article className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${expanded ? "border-[#8ebdb0] ring-2 ring-[#e8f3ef]" : "border-[#e2e7ee]"}`}>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#28737a]">{obligation.shortTitle}</p><button type="button" onClick={onOpenProgram} className="mt-0.5 block truncate text-left text-base font-bold tracking-tight text-slate-900 hover:text-[#176b75]">{obligation.title}</button><p className="mt-0.5 truncate text-[11px] text-slate-500">{obligation.category} · {obligation.deadline}</p></div><div className="flex shrink-0 items-center gap-1.5"><button type="button" onClick={onToggle} className={`rounded-full px-2 py-1 text-[10px] font-bold ${gap > 0 ? "bg-[#fff4df] text-[#9b641d]" : "bg-[#e8f3ef] text-[#285954]"}`}>{gap > 0 ? `${gap} pt gap` : "Target met"}</button><button type="button" onClick={onToggle} aria-expanded={expanded} className="text-[10px] font-semibold text-[#176b75] hover:underline">{expanded ? "Hide" : "Details"} ↘</button></div></div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-y border-slate-100 py-2.5"><div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Total risk</p><p className="mt-0.5 text-sm font-bold text-amber-700">{money(obligation.atRiskDollars)}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Impacted lives</p><p className="mt-0.5 text-sm font-bold text-slate-900">{whole(obligation.lives)}</p></div><div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Recoverable</p><p className="mt-0.5 text-sm font-bold text-emerald-700">{money(obligation.recoverableDollars)}</p></div></div>
      <div className="mt-3 grid grid-cols-[56px_minmax(0,1fr)_110px] items-center gap-3"><GoalRing projected={obligation.forecast.projected} target={obligation.forecast.target} unit={obligation.forecast.unit} /><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{obligation.forecast.unit}</p><p className="mt-0.5 truncate text-xs font-semibold text-slate-700"><span className="text-[#f36d6d]">{obligation.forecast.current}{obligation.forecast.unit.includes("%") ? "%" : " pts"}</span><span className="px-1 text-slate-300">→</span><span className="text-[#5270e8]">{obligation.forecast.projected}{obligation.forecast.unit.includes("%") ? "%" : " pts"}</span><span className="px-1 text-slate-300">·</span>{obligation.forecast.target}{obligation.forecast.unit.includes("%") ? "%" : " pts"} goal</p><p className="mt-0.5 text-[10px] font-semibold text-slate-500">Next due {nextDue}d</p></div><div><p className="mb-0.5 text-right text-[9px] font-bold uppercase tracking-wide text-slate-400">YTD trend</p><MiniTrend values={trajectory(obligation)} target={obligation.forecast.target} /></div></div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => onOpenPatientWorklist(topWork.driver)} className="min-w-0 truncate text-left text-xs font-bold text-[#176b75] hover:underline">{topWork.driver} · {money(topWork.impact)} ↗</button><button type="button" onClick={onOpenProgram} className="shrink-0 rounded-lg bg-[#285954] px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-[#1f4b47]">Open overview →</button></div>
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
  const [patientList, setPatientList] = useState<MeasurePatientListState | null>(null);
  const [view, setView] = useState<HdiView>("overview");
  const [lens, setLens] = useState<HdiLens>("enterprise");
  const [selectedId, setSelectedId] = useState<HdiObligationId>("cms-team");
  const [expandedId, setExpandedId] = useState<HdiObligationId | null>(null);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("team-readmit-1");
  const [startedActions, setStartedActions] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [measureContext, setMeasureContext] = useState<{ family: SharedMeasureFamily; obligation: MeasureObligation } | null>(null);
  const [expandedMeasureId, setExpandedMeasureId] = useState("blood-pressure");

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedProgram = params.get("program") as HdiObligationId | null;
      const requestedView = params.get("view") as HdiView | null;
      setPatientList(requestedView === "measure-patients" ? parseMeasurePatientState(params) : null);
      if (requestedProgram && hdiObligations.some((obligation) => obligation.id === requestedProgram)) setSelectedId(requestedProgram);
      const family = sharedMeasureFamilies.find(item => item.id === params.get("measureFamily"));
      const obligation = family?.obligations.find(item => item.id === params.get("measureObligation") && item.programId === requestedProgram && (item.contractId ? params.get("contract") === item.contractId && requestedView === "contract" : requestedView === "program"));
      setMeasureContext(family && obligation ? { family, obligation } : null);
      if (family) setExpandedMeasureId(family.id);
      const requestedContract = params.get("contract");
      if (requestedContract) setSelectedContractId(requestedContract);
      if (requestedView && ["overview", "program", "contract", "worklist", "action", "measure-patients"].includes(requestedView)) setView(requestedView);
      else if (requestedContract) setView("contract");
      else if (requestedProgram) setView("program");
      else setView("overview");
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const selected = useMemo(() => hdiObligations.find((obligation) => obligation.id === selectedId) ?? hdiObligations[0], [selectedId]);
  const selectedWork = useMemo(() => selected.workItems.find((item) => item.id === selectedWorkId) ?? selected.workItems[0], [selected, selectedWorkId]);
  const opportunitiesFor = (id: HdiObligationId) => hdiCrossProgramOpportunities.filter((opportunity) => opportunity.obligationIds.includes(id));

  const navigate = (nextView: HdiView, programId?: HdiObligationId) => {
    setMeasureContext(null);
    setView(nextView);
    if (programId) setSelectedId(programId);
    const url = new URL(window.location.href);
    if (programId) url.searchParams.set("program", programId);
    else if (nextView === "overview") url.searchParams.delete("program");
    if (nextView !== "contract") url.searchParams.delete("contract");
    url.searchParams.delete("measureFamily");
    url.searchParams.delete("measureObligation");
    for (const key of ["gapStatus", "q", "provider", "page", "measure", "context", "source", ...modelViewKeys]) url.searchParams.delete(key);
    url.searchParams.set("view", nextView);
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const toggleObligation = (id: HdiObligationId) => {
    setSelectedId(id);
    setExpandedId((current) => current === id ? null : id);
    setNotice(null);
  };
  const openProgram = (id: HdiObligationId) => {
    setSelectedId(id);
    setExpandedId(null);
    setNotice(null);
    navigate("program", id);
  };
  const closeProgram = () => {
    navigate("overview");
  };
  const openContract = (contractId: string) => {
    setMeasureContext(null);
    setSelectedId("vbc-contracts");
    setSelectedContractId(contractId);
    setNotice(null);
    const url = new URL(window.location.href);
    url.searchParams.set("program", "vbc-contracts");
    url.searchParams.set("view", "contract");
    url.searchParams.set("contract", contractId);
    url.searchParams.delete("measureFamily");
    url.searchParams.delete("measureObligation");
    window.history.pushState(null, "", url);
    setView("contract");
  };
  const changePatientList = (next: MeasurePatientListState, replace = false) => {
    setPatientList(next);
    setMeasureContext(null);
    setView("measure-patients");
    setExpandedMeasureId(next.familyId);
    if (replace) window.history.replaceState(null, "", measurePatientHref(next));
    else window.history.pushState(null, "", measurePatientHref(next));
  };
  const openMeasurePatients = (familyId: string, obligationId = "all", status: MeasurePatientStatus = "all") => {
    changePatientList(measurePatientState(familyId, obligationId, status));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openMeasureObligation = (family: SharedMeasureFamily, obligation: MeasureObligation) => {
    if (obligation.contractId) openContract(obligation.contractId);
    else openProgram(obligation.programId);
    setMeasureContext({ family, obligation });
    setExpandedMeasureId(family.id);
    const url = new URL(window.location.href);
    url.searchParams.set("measureFamily", family.id);
    url.searchParams.set("measureObligation", obligation.id);
    window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const returnToSharedMeasures = () => {
    navigate("overview");
    requestAnimationFrame(() => {
      const section = document.getElementById("shared-measures");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      section?.focus({ preventScroll: true });
    });
  };
  const closeContract = () => {
    setSelectedContractId(null);
    navigate("program", "vbc-contracts");
  };
  const openWorklist = (id: HdiObligationId) => {
    setSelectedId(id);
    const next = hdiObligations.find((obligation) => obligation.id === id);
    if (next?.workItems[0]) setSelectedWorkId(next.workItems[0].id);
    navigate("worklist", id);
    setNotice(null);
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
    const normalized = measure.trim().toLowerCase();
    const publishedOwner = hdiObligations.find(program => program.workItems.some(item => item.driver.toLowerCase() === normalized && item.qualityMeasureKey && programMeasureCatalogs[program.id].measures.some(entry => entry.key === item.qualityMeasureKey)));
    if (publishedOwner) {
      openProgram(publishedOwner.id);
      if (publishedOwner.id === "cms-team" || publishedOwner.id === "ambulatory-specialty-model") {
        const url = new URL(window.location.href);
        url.searchParams.set("section", "quality");
        const item = publishedOwner.workItems.find(item => item.driver.toLowerCase() === normalized);
        if (item?.qualityMeasureKey) url.searchParams.set("qualityMeasure", item.qualityMeasureKey);
        window.history.replaceState(null, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
        setNotice(null);
      } else {
        const item = publishedOwner.workItems.find(item => item.driver.toLowerCase() === normalized);
        const url = new URL(window.location.href);
        if (item?.qualityMeasureKey) url.searchParams.set("qualityMeasure", item.qualityMeasureKey);
        window.history.replaceState(null, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
        setNotice(null);
      }
      requestAnimationFrame(() => { document.getElementById("program-quality-measures")?.scrollIntoView({ behavior: "smooth" }); });
      return;
    }
    const family = sharedMeasureFamilies.find(item => item.name.toLowerCase() === normalized || item.definitions.some(definition => definition.name.toLowerCase() === normalized || definition.id.toLowerCase() === normalized));
    if (family) { openMeasurePatients(family.id); return; }
    const supported = ["Medication Adherence", "Follow-up after ED", "Post Discharge Follow-up", "A1c Control", "Colorectal Screening", "Breast Screening", "COPD Management", "Transportation"];
    const mappedMeasure = supported.find(item => item.toLowerCase() === normalized);
    if (!mappedMeasure) { setNotice(`No patient list is configured for ${measure}.`); return; }
    if (onOpenPatientWorklist) { onOpenPatientWorklist(mappedMeasure); return; }
    const params = new URLSearchParams({ product: "pm-sandbox", measure: mappedMeasure, source: "hdi-worklist", context: measure });
    window.location.assign(`/population?${params}`);
  };
  const startAction = () => {
    if (!startedActions.includes(selectedWork.id)) setStartedActions((current) => [...current, selectedWork.id]);
    setNotice(`${selectedWork.title} is now in progress for ${selectedWork.owner}.`);
  };

  return <div className="space-y-6 pb-16">
    <section className="overflow-hidden rounded-2xl bg-[#213a40] text-white shadow-sm">
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 sm:px-6"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-white/10 text-[10px] font-bold tracking-[0.18em]">HDI</span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d3e4df]">Oracle Health</p><h1 className="text-base font-semibold tracking-tight">HDI Command Center</h1></div></div><p className="hidden text-xs text-white/60 xl:block">Hyperion Health System <span className="px-1 text-white/35">·</span> PY 2026 obligation portfolio</p><div className="ml-auto flex flex-wrap items-center gap-2"><div className="flex items-center gap-1 rounded-lg bg-[#142b31] p-1 text-[10px] font-semibold"><button type="button" onClick={() => setLens("enterprise")} className={`rounded-md px-2.5 py-1.5 ${lens === "enterprise" ? "bg-[#faf7f0] text-[#213a40]" : "text-white/75 hover:text-white"}`}>Finance & contracting</button><button type="button" onClick={() => setLens("quality")} className={`rounded-md px-2.5 py-1.5 ${lens === "quality" ? "bg-[#faf7f0] text-[#213a40]" : "text-white/75 hover:text-white"}`}>Quality executive</button></div><nav className="flex gap-0.5 text-[10px] font-semibold" aria-label="HDI workspace views"><button type="button" onClick={() => navigate("overview")} className={`rounded-md px-2.5 py-1.5 ${view === "overview" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Portfolio</button><button type="button" onClick={() => navigate("program", selected.id)} className={`rounded-md px-2.5 py-1.5 ${view === "program" || view === "contract" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Programs</button><button type="button" onClick={() => navigate("worklist", selected.id)} className={`rounded-md px-2.5 py-1.5 ${view === "worklist" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Worklists</button><button type="button" onClick={() => navigate("action", selected.id)} className={`rounded-md px-2.5 py-1.5 ${view === "action" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}>Actions</button></nav></div></div>
    </section>

    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</div>}

    <WorkspaceNavigation view={view} selected={selected} onNavigate={(nextView) => navigate(nextView, nextView === "overview" ? undefined : selected.id)} />

    {view === "overview" && <div className="space-y-5">
      <section><h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Portfolio performance</h2></section>
      <PortfolioExecutiveSummary onOpenProgram={openProgram} onOpenWorklist={openWorklist} />

      <details className="rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer text-sm font-semibold text-[#176b75]">Program worklists</summary><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{hdiObligations.map((obligation) => <ObligationCard key={obligation.id} obligation={obligation} opportunities={opportunitiesFor(obligation.id)} expanded={expandedId === obligation.id} onToggle={() => toggleObligation(obligation.id)} onOpenProgram={() => openProgram(obligation.id)} onWorklist={openWorklist} onOpenDataSubmissions={obligation.id === "mips-mvp" ? openMipsDashboard : undefined} onOpenPatientWorklist={openPatientWorklist} />)}</div></details>

      <SharedMeasureExplorer initialExpandedId={expandedMeasureId} onOpenObligation={openMeasureObligation} onOpenPatients={openMeasurePatients} />

      <AttentionQueue onOpenPatientWorklist={openPatientWorklist} />

      <ContractReconciliation onOpenProgram={openProgram} />

      <MeasurePulseTable onOpenPatientWorklist={openPatientWorklist} />

      <details className="rounded-2xl border border-[#e3deda] bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3"><span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Shared opportunity detail</span><span className="mt-1 block text-base font-semibold text-slate-900">All cross-program pathways</span></span><span className="rounded-full bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#285954]">{hdiCrossProgramOpportunities.length} pathways · {money(hdiCrossProgramOpportunities.reduce((sum, opportunity) => sum + opportunity.recoverableDollars, 0))} recoverable</span></summary><div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-medium text-slate-500">Select a measure or evidence signal to open the patient worklist.</p><div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">{hdiCrossProgramOpportunities.map((opportunity) => <article key={opportunity.id} className="rounded-xl border border-slate-200 bg-[#fbfaf8] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-slate-900">{opportunity.title}</h4><p className="mt-1 text-xs text-slate-500">{money(opportunity.recoverableDollars)} recoverable · {whole(opportunity.affectedLives)} lives touched</p></div><RelationshipBadge relationship={opportunity.relationship} /></div><div className="mt-3 flex flex-wrap gap-1.5">{opportunity.measureSet.map((measure) => <button key={measure} type="button" onClick={() => openPatientWorklist(measure)} className="group rounded-md bg-white px-2 py-1 text-left text-[11px] text-slate-700 ring-1 ring-slate-200 hover:bg-[#e8f3ef] hover:text-[#176b75]">{measure} <span className="text-[#176b75] opacity-0 group-hover:opacity-100">↗</span></button>)}</div><div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200 pt-3">{opportunity.sharedEvidence.slice(0, 4).map((evidence) => <button key={evidence} type="button" onClick={() => openPatientWorklist(opportunity.measureSet[0])} className="rounded-md bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-[#e8f3ef] hover:text-[#176b75]">{evidence} ↗</button>)}</div></article>)}</div></div></details>
    </div>}

    {view === "measure-patients" && (patientList ? <SharedMeasurePatientList key={patientList.familyId} state={patientList} onChange={changePatientList} onBack={returnToSharedMeasures} /> : <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Patient list unavailable</h2><p className="mt-2 text-sm text-slate-500">The measure or obligation filter is invalid.</p><button type="button" onClick={returnToSharedMeasures} className="mt-3 text-sm font-semibold text-[#176b75]">Back to shared measures</button></section>)}

    {measureContext && (view === "program" || view === "contract") && <aside className="rounded-xl border border-[#b5d1ca] bg-[#f5fbf8] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#28737a]">Shared measure context</p><p className="mt-1 text-base font-bold text-slate-900">{measureContext.family.name} · {measureContext.obligation.definitionId}</p><p className="mt-1 text-xs text-slate-600">{measureContext.obligation.label} · illustrative MY 2026 mapping</p></div><button type="button" onClick={returnToSharedMeasures} className="rounded-lg border border-[#b5d1ca] bg-white px-3 py-2 text-xs font-semibold text-[#176b75]">← Back to shared measures</button></div>
      <MeasureImpactMetrics impact={measureContext.obligation.impact} direction={measureContext.family.definitions.find(item => item.id === measureContext.obligation.definitionId)!.direction} onOpenPatients={status => openMeasurePatients(measureContext.family.id, measureContext.obligation.id, status)} />
      <p className="mt-3 text-sm text-slate-700"><strong>Action:</strong> {measureContext.family.nextAction}</p><p className="mt-1 text-xs leading-5 text-slate-500">{view === "contract" ? "Contract" : "Program"} overview. Counts above open measure-filtered patient lists.</p>
    </aside>}

    {view === "program" && <ProgramOverview obligation={selected} opportunities={opportunitiesFor(selected.id)} onBack={closeProgram} onWorklist={openWorklist} onOpenDataSubmissions={selected.id === "mips-mvp" ? openMipsDashboard : undefined} onOpenPatientWorklist={openPatientWorklist} onOpenContract={openContract} />}

    {view === "contract" && selectedContractId && <HdiContractDetail contractId={selectedContractId} onBack={closeContract} onOpenPatientWorklist={openPatientWorklist} />}

    {view === "worklist" && <section className="space-y-6"><Breadcrumbs selected={selected} view={view} onOverview={() => navigate("overview")} onWorklist={() => navigate("worklist", selected.id)} /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Operational worklist</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{selected.shortTitle} worklist</h2><p className="mt-2 text-sm text-slate-500">{selected.workItems.length} work items · {opportunitiesFor(selected.id).length} shared paths</p></div><button type="button" onClick={() => navigate("overview")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to portfolio</button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Metric label="Open actions" value={whole(selected.workItems.length)} detail="Across practice owners" tone="text-[#176b75]" /><Metric label="Modeled impact" value={money(selected.workItems.reduce((sum, item) => sum + item.impact, 0))} detail="If work lands on time" tone="text-emerald-700" /><Metric label="Next deadline" value={`${Math.min(...selected.workItems.map((item) => item.dueInDays))} days`} detail="Earliest practice action" tone="text-red-700" /></div><div className="overflow-hidden rounded-2xl border border-[#e3deda] bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h3 className="font-semibold text-slate-900">Practice action queue</h3><p className="mt-1 text-xs text-slate-500">Select a driver to view its definition or configured patient list.</p></div><div className="divide-y divide-slate-100">{selected.workItems.map((item) => <div key={item.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1.5fr)_180px_110px_160px_auto] lg:items-center"><div><h4 className="font-semibold text-slate-900">{item.title}</h4><p className="mt-1 text-xs text-slate-500">{item.practice} · {item.market} · {item.owner}</p><p className="mt-2 text-xs text-slate-500">{item.evidence}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Driver</p><button type="button" onClick={() => openPatientWorklist(item.driver)} className="mt-1 text-left text-sm font-semibold text-[#176b75] hover:underline">{item.driver} ↗</button></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Due</p><p className={`mt-1 text-sm font-semibold ${item.dueInDays <= 21 ? "text-red-700" : "text-slate-700"}`}>{item.dueInDays} days</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Impact</p><p className="mt-1 text-sm font-semibold text-emerald-700">{money(item.impact)}</p></div><button type="button" onClick={() => openPatientWorklist(item.driver)} className="rounded-xl border border-[#b5d1ca] bg-[#f5fbf8] px-3 py-2 text-xs font-semibold text-[#285954] hover:bg-[#e8f3ef]">Open detail →</button></div>)}</div></div></section>}

    {view === "action" && <section className="space-y-6"><Breadcrumbs selected={selected} view={view} onOverview={() => navigate("overview")} onWorklist={() => navigate("worklist", selected.id)} /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Operational detail</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{selectedWork.title}</h2><p className="mt-2 text-sm text-slate-500">{selected.shortTitle} · {selectedWork.practice} · owner {selectedWork.owner}</p></div><div className="rounded-lg bg-[#e8f3ef] px-3 py-2 text-xs font-semibold text-[#285954]">{startedActions.includes(selectedWork.id) ? "Action in progress" : "Ready to review"}</div></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-6"><div className="rounded-2xl border border-[#e3deda] bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-slate-900">Why this work is here</h3><div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs text-slate-500">{selectedWork.evidence}</span><button type="button" onClick={() => openPatientWorklist(selectedWork.driver)} className="rounded-lg bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#285954] hover:bg-[#dbe9e4]">Open patient list ↗</button><span className="text-xs font-semibold text-emerald-700">{money(selectedWork.impact)} opportunity</span></div><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Work type</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.actionType}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Practice</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.practice}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Due</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.dueInDays} days</p></div></div></div><div className="rounded-2xl border border-[#b5d1ca] bg-[#f5fbf8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Dashboard handoff</p><h3 className="mt-2 text-xl font-bold text-slate-900">{selected.id === "mips-mvp" ? "MIPS performance dashboard" : selectedWork.actionLabel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{selected.id === "mips-mvp" ? "Scorecard and patient detail in Data Submissions." : "Patient list and detailed analytics in Quality."}</p>{selected.id === "mips-mvp" ? <button type="button" onClick={openMipsDashboard} className="mt-6 rounded-xl bg-[#285954] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f4b47]">Open MIPS performance dashboard <span className="ml-2">→</span></button> : <button type="button" onClick={openDetailedAnalytics} className="mt-6 rounded-xl bg-[#285954] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f4b47]">Open detailed analytics <span className="ml-2">→</span></button>}</div></div><aside className="h-fit rounded-2xl border border-[#e3deda] bg-[#f8fbfa] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Context</p><h3 className="mt-2 text-xl font-bold text-slate-900">{selectedWork.actionLabel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Select a measure or patient list to continue.</p><button type="button" onClick={() => navigate("worklist", selected.id)} className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Return to worklist</button><div className="mt-5 border-t border-[#dbe9e4] pt-4 text-xs text-slate-500"><p>Measure family</p><p className="mt-1 font-semibold text-slate-700">{selectedWork.driver}</p><p className="mt-3">Forecast source</p><p className="mt-1 font-semibold text-slate-700">{selected.sponsor} · {selected.deadline}</p></div></aside></div></section>}
  </div>;
}
