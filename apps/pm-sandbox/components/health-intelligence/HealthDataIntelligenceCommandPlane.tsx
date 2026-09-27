"use client";

import { Fragment, useMemo, useState } from "react";
import {
  hdiCrossProgramOpportunities,
  hdiExecutiveMetrics,
  hdiObligations,
  type HdiCrossProgramOpportunity,
  type HdiObligation,
  type HdiObligationId,
} from "@/data/synthetic/healthIntelligenceObligations";

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

function ForecastBar({ obligation }: { obligation: HdiObligation }) {
  const projected = Math.min(100, obligation.forecast.projected);
  const target = Math.max(0, Math.min(100, obligation.forecast.target));
  return <div className="mt-3">
    <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div className="absolute inset-y-0 left-0 rounded-full bg-[#2d7e78]" style={{ width: `${projected}%` }} />
      <div className="absolute -top-1 h-4 w-0.5 bg-slate-900" style={{ left: `${target}%` }} title={`Target ${target}%`} />
    </div>
    <div className="mt-1 flex justify-between text-[10px] text-slate-500"><span>Current {obligation.forecast.current}%</span><span>Target {target}%</span><span>Forecast {projected}%</span></div>
  </div>;
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

function OpportunityLandscape({ onWorklist }: { onWorklist: (id: HdiObligationId) => void }) {
  const maxExposure = Math.max(...hdiObligations.map((obligation) => obligation.atRiskDollars), 1);
  return <section className="order-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Opportunity landscape</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Where the portfolio can move together</h3></div><p className="text-xs text-slate-500">Click a bar to open its worklist</p></div>
    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between"><div><h4 className="text-sm font-semibold text-slate-900">Exposure vs. recoverable value</h4><p className="mt-0.5 text-[11px] text-slate-500">Green is modeled recovery inside the amber exposure.</p></div><div className="flex gap-3 text-[10px] text-slate-500"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />exposure</span><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />recoverable</span></div></div><div className="mt-5 space-y-3">{hdiObligations.map((obligation) => { const exposureWidth = Math.max(8, (obligation.atRiskDollars / maxExposure) * 100); const recoverableWidth = Math.min(100, (obligation.recoverableDollars / obligation.atRiskDollars) * 100); return <button key={obligation.id} type="button" onClick={() => onWorklist(obligation.id)} className="block w-full text-left"><div className="mb-1 flex items-center justify-between gap-3 text-[11px]"><span className="font-semibold text-slate-700">{obligation.shortTitle}</span><span className="tabular-nums text-slate-500">{money(obligation.atRiskDollars)} <span className="text-slate-300">/</span> <span className="font-semibold text-emerald-700">{money(obligation.recoverableDollars)}</span></span></div><div className="h-2.5 rounded-full bg-slate-100"><div className="relative h-2.5 rounded-full bg-amber-300" style={{ width: `${exposureWidth}%` }}><div className="absolute inset-y-0 left-0 rounded-full bg-emerald-500" style={{ width: `${recoverableWidth}%` }} /></div></div></button>; })}</div></article>
      <article className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"><div className="flex items-center justify-between"><div><h4 className="text-sm font-semibold text-slate-900">Leverage by shared intervention</h4><p className="mt-0.5 text-[11px] text-slate-500">Fewer interventions, more obligation lift.</p></div><span className="rounded-full bg-[#e8f3ef] px-2.5 py-1 text-[11px] font-semibold text-[#285954]">{hdiCrossProgramOpportunities.length} pathways</span></div><div className="mt-4 space-y-2.5">{hdiCrossProgramOpportunities.map((opportunity, index) => <button key={opportunity.id} type="button" onClick={() => onWorklist(opportunity.obligationIds[0])} className="group flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-left transition hover:border-[#b5d1ca] hover:bg-[#f5fbf8]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#213a40] text-xs font-bold text-white">0{index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800 group-hover:text-[#176b75]">{opportunity.title}</span><span className="mt-1 block text-[10px] text-slate-500">{opportunity.obligationIds.length} programs · {money(opportunity.recoverableDollars)} recoverable</span></span><span className="text-sm font-semibold text-[#176b75]">→</span></button>)}</div></article>
    </div>
  </section>;
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
  const [expandedId, setExpandedId] = useState<HdiObligationId | null>("cms-team");
  const [selectedWorkId, setSelectedWorkId] = useState<string>("team-readmit-1");
  const [startedActions, setStartedActions] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = useMemo(() => hdiObligations.find((obligation) => obligation.id === selectedId) ?? hdiObligations[0], [selectedId]);
  const selectedWork = useMemo(() => selected.workItems.find((item) => item.id === selectedWorkId) ?? selected.workItems[0], [selected, selectedWorkId]);
  const sharedMeasureCount = new Set(hdiCrossProgramOpportunities.flatMap((opportunity) => opportunity.measureSet)).size;
  const opportunitiesFor = (id: HdiObligationId) => hdiCrossProgramOpportunities.filter((opportunity) => opportunity.obligationIds.includes(id));

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

    {view === "overview" && <><div className="flex flex-col gap-6">
      <section className="order-1 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Enterprise outlook</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Find the work that moves more than one program.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Select a measure to move from enterprise exposure to the patient worklist.</p></div><div className="rounded-xl border border-[#e3deda] bg-white px-4 py-3 text-right shadow-sm"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Lens</p><p className="mt-1 text-sm font-semibold text-slate-900">{lens === "enterprise" ? "Materiality and recoverable value" : "Quality attainment and evidence"}</p></div></section>
      <section className="order-1 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"><Metric label="Obligations monitored" value={whole(hdiExecutiveMetrics.obligations)} detail={`${hdiExecutiveMetrics.programs} program families`} /><Metric label="At-risk dollars" value={money(hdiExecutiveMetrics.atRiskDollars)} detail={`${hdiObligations.length} programs with modeled exposure`} tone="text-amber-700" /><Metric label="Recoverable next 90 days" value={money(hdiExecutiveMetrics.recoverableDollars)} detail="Modeled opportunity" tone="text-emerald-700" /><Metric label="Cross-program opportunities" value={whole(hdiCrossProgramOpportunities.length)} detail="Click a measure for patients" tone="text-[#176b75]" /><Metric label="Measure alignments" value={whole(sharedMeasureCount)} detail="Patient lists by measure" /></section>

      <OpportunityLandscape onWorklist={openObligationDestination} />

      <details className="order-4 rounded-2xl border border-[#e3deda] bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3"><span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Shared opportunity detail</span><span className="mt-1 block text-base font-semibold text-slate-900">Cross-program opportunities</span></span><span className="rounded-full bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#285954]">{hdiCrossProgramOpportunities.length} pathways · {money(hdiCrossProgramOpportunities.reduce((sum, opportunity) => sum + opportunity.recoverableDollars, 0))} recoverable</span></summary><div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-medium text-slate-500">Select a measure to open the patient worklist.</p><div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">{hdiCrossProgramOpportunities.map((opportunity) => <article key={opportunity.id} className="rounded-xl border border-slate-200 bg-[#fbfaf8] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-slate-900">{opportunity.title}</h4><p className="mt-1 text-xs text-slate-500">{money(opportunity.recoverableDollars)} recoverable · {whole(opportunity.affectedLives)} lives touched</p></div><RelationshipBadge relationship={opportunity.relationship} /></div><div className="mt-3 flex flex-wrap gap-1.5">{opportunity.measureSet.map((measure) => <button key={measure} type="button" onClick={() => openPatientWorklist(measure)} className="group rounded-md bg-white px-2 py-1 text-left text-[11px] text-slate-700 ring-1 ring-slate-200 hover:bg-[#e8f3ef] hover:text-[#176b75]">{measure} <span className="text-[#176b75] opacity-0 group-hover:opacity-100">↗</span></button>)}</div><div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3"><div className="flex flex-wrap gap-1.5">{opportunity.sharedEvidence.slice(0, 3).map((evidence) => <button key={evidence} type="button" onClick={() => openPatientWorklist(opportunity.measureSet[0])} className="rounded-md bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-[#e8f3ef] hover:text-[#176b75]">{evidence}</button>)}</div><button type="button" onClick={() => openWorklist(opportunity.obligationIds[0])} className="shrink-0 rounded-lg border border-[#b5d1ca] bg-white px-3 py-1.5 text-xs font-semibold text-[#285954] hover:bg-[#e8f3ef]">Open worklist →</button></div></article>)}</div></div></details>

      <section className="order-5 rounded-2xl border border-[#e3deda] bg-[#f8fbfa] p-4"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Work cues</span><span className="rounded-full bg-[#e8f3ef] px-2.5 py-1 text-[11px] font-semibold text-[#285954]">Shared measure family</span><span className="rounded-full bg-[#fff6e7] px-2.5 py-1 text-[11px] font-semibold text-[#8b5b1a]">Related opportunity</span><span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-semibold text-[#4d5e9c]">Evidence reuse</span><span className="ml-auto text-[11px] font-medium text-slate-500">Select a measure to open patients ↗</span></div></section>

      <section className="order-2 rounded-2xl border border-[#e3deda] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-900">Enterprise obligation portfolio</h3><p className="mt-1 text-xs text-slate-500">Expand an obligation, then select a measure to open patients.</p></div><button type="button" onClick={() => setView("worklist")} className="text-xs font-semibold text-[#176b75] hover:underline">Open all worklists →</button></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="border-b border-slate-100 text-[11px] uppercase tracking-[0.1em] text-slate-400"><tr><th className="pb-3 font-semibold">Obligation</th><th className="pb-3 font-semibold">Forecast</th><th className="pb-3 font-semibold">At risk</th><th className="pb-3 font-semibold">Overlap</th><th className="pb-3" /></tr></thead><tbody className="divide-y divide-slate-100">{hdiObligations.map((obligation) => { const overlaps = opportunitiesFor(obligation.id); const expanded = expandedId === obligation.id; return <Fragment key={obligation.id}>
        <tr key={obligation.id} className="group"><td className="py-4"><button type="button" aria-expanded={expanded} onClick={() => toggleObligation(obligation.id)} className="flex items-start gap-3 text-left"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold transition ${expanded ? "border-[#285954] bg-[#285954] text-white" : "border-slate-300 text-slate-500"}`}>{expanded ? "−" : "+"}</span><span><p className="font-semibold text-slate-900 group-hover:text-[#176b75]">{obligation.title}</p><p className="mt-1 text-xs text-slate-500">{obligation.category} · {obligation.scope}</p></span></button></td><td className="w-52 py-4 pr-5"><span className="text-xs font-semibold text-slate-700">{obligation.forecast.projected} {obligation.forecast.unit}</span><ForecastBar obligation={obligation} /></td><td className="py-4 font-semibold text-amber-700">{money(obligation.atRiskDollars)}</td><td className="py-4"><p className="font-semibold text-[#285954]">{overlaps.length} {overlaps.length === 1 ? "opportunity" : "opportunities"}</p><p className="mt-1 text-xs text-slate-500">{obligation.workItems.length} linked actions</p></td><td className="py-4 text-right"><button type="button" aria-label={`${expanded ? "Collapse" : "Expand"} ${obligation.title}`} onClick={() => toggleObligation(obligation.id)} className="text-xs font-semibold text-[#176b75]">{expanded ? "Collapse" : "Expand"}</button></td></tr>
        {expanded && <tr key={`${obligation.id}-details`}><td colSpan={5} className="bg-[#fbfaf8] px-5 py-5"><ExpandedObligation obligation={obligation} opportunities={overlaps} onWorklist={openWorklist} onOpenDataSubmissions={obligation.id === "mips-mvp" ? openMipsDashboard : undefined} onOpenPatientWorklist={openPatientWorklist} /></td></tr>}
      </Fragment>; })}</tbody></table></div></section>
    </div></>}

    {view === "worklist" && <section className="space-y-6"><Breadcrumbs selected={selected} view={view} onOverview={() => setView("overview")} onWorklist={() => setView("worklist")} /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Operational worklist</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{selected.shortTitle} worklist</h2><p className="mt-2 text-sm text-slate-500">{selected.workItems.length} work items · {opportunitiesFor(selected.id).length} shared paths</p></div><button type="button" onClick={() => setView("overview")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to portfolio</button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Metric label="Open actions" value={whole(selected.workItems.length)} detail="Across practice owners" tone="text-[#176b75]" /><Metric label="Modeled impact" value={money(selected.workItems.reduce((sum, item) => sum + item.impact, 0))} detail="If work lands on time" tone="text-emerald-700" /><Metric label="Next deadline" value={`${Math.min(...selected.workItems.map((item) => item.dueInDays))} days`} detail="Earliest practice action" tone="text-red-700" /></div><div className="overflow-hidden rounded-2xl border border-[#e3deda] bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h3 className="font-semibold text-slate-900">Practice action queue</h3><p className="mt-1 text-xs text-slate-500">Select a measure to open the patient worklist.</p></div><div className="divide-y divide-slate-100">{selected.workItems.map((item) => <div key={item.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1.5fr)_180px_110px_160px_auto] lg:items-center"><div><h4 className="font-semibold text-slate-900">{item.title}</h4><p className="mt-1 text-xs text-slate-500">{item.practice} · {item.market} · {item.owner}</p><p className="mt-2 text-xs text-slate-500">{item.evidence}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Focus measure</p><button type="button" onClick={() => openPatientWorklist(item.driver)} className="mt-1 text-left text-sm font-semibold text-[#176b75] hover:underline">{item.driver} ↗</button></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Due</p><p className={`mt-1 text-sm font-semibold ${item.dueInDays <= 21 ? "text-red-700" : "text-slate-700"}`}>{item.dueInDays} days</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Impact</p><p className="mt-1 text-sm font-semibold text-emerald-700">{money(item.impact)}</p></div><button type="button" onClick={() => openPatientWorklist(item.driver)} className="rounded-xl border border-[#b5d1ca] bg-[#f5fbf8] px-3 py-2 text-xs font-semibold text-[#285954] hover:bg-[#e8f3ef]">Open patient list →</button></div>)}</div></div></section>}

    {view === "action" && <section className="space-y-6"><Breadcrumbs selected={selected} view={view} onOverview={() => setView("overview")} onWorklist={() => setView("worklist")} /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Operational detail</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{selectedWork.title}</h2><p className="mt-2 text-sm text-slate-500">{selected.shortTitle} · {selectedWork.practice} · owner {selectedWork.owner}</p></div><div className="rounded-lg bg-[#e8f3ef] px-3 py-2 text-xs font-semibold text-[#285954]">{startedActions.includes(selectedWork.id) ? "Action in progress" : "Ready to review"}</div></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-6"><div className="rounded-2xl border border-[#e3deda] bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-slate-900">Why this work is here</h3><div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs text-slate-500">{selectedWork.evidence}</span><button type="button" onClick={() => openPatientWorklist(selectedWork.driver)} className="rounded-lg bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#285954] hover:bg-[#dbe9e4]">Open patient list ↗</button><span className="text-xs font-semibold text-emerald-700">{money(selectedWork.impact)} opportunity</span></div><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Work type</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.actionType}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Practice</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.practice}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Due</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.dueInDays} days</p></div></div></div><div className="rounded-2xl border border-[#b5d1ca] bg-[#f5fbf8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Dashboard handoff</p><h3 className="mt-2 text-xl font-bold text-slate-900">{selected.id === "mips-mvp" ? "MIPS performance dashboard" : selectedWork.actionLabel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{selected.id === "mips-mvp" ? "Scorecard and patient detail in Data Submissions." : "Patient list and detailed analytics in Quality."}</p>{selected.id === "mips-mvp" ? <button type="button" onClick={openMipsDashboard} className="mt-6 rounded-xl bg-[#285954] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f4b47]">Open MIPS performance dashboard <span className="ml-2">→</span></button> : <button type="button" onClick={openDetailedAnalytics} className="mt-6 rounded-xl bg-[#285954] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f4b47]">Open detailed analytics <span className="ml-2">→</span></button>}</div></div><aside className="h-fit rounded-2xl border border-[#e3deda] bg-[#f8fbfa] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Context</p><h3 className="mt-2 text-xl font-bold text-slate-900">{selectedWork.actionLabel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Select a measure or patient list to continue.</p><button type="button" onClick={() => setView("worklist")} className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Return to worklist</button><div className="mt-5 border-t border-[#dbe9e4] pt-4 text-xs text-slate-500"><p>Measure family</p><p className="mt-1 font-semibold text-slate-700">{selectedWork.driver}</p><p className="mt-3">Forecast source</p><p className="mt-1 font-semibold text-slate-700">{selected.sponsor} · {selected.deadline}</p></div></aside></div></section>}
  </div>;
}
