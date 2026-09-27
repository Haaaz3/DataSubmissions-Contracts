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
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Portfolio performance</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Current, forecast, and target by obligation</h3></div><div className="flex flex-wrap gap-3 text-[10px] font-semibold text-slate-500"><span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#f36d6d]" />current</span><span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#5270e8]" />forecast</span><span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-[#f5c86a]" />target</span></div></div>
    <div className="mt-5 grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      <div className="flex h-56 flex-col justify-between pb-7 text-[10px] text-slate-400"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
      <div className="relative h-56 border-b border-l border-slate-200 bg-[linear-gradient(to_bottom,transparent_24%,#edf1f5_25%,transparent_26%,transparent_49%,#edf1f5_50%,transparent_51%,transparent_74%,#edf1f5_75%,transparent_76%)]">
        <div className="absolute inset-0 flex items-end justify-around gap-1 px-2 sm:gap-3 sm:px-4">{hdiObligations.map((obligation) => <button key={obligation.id} type="button" onClick={() => onWorklist(obligation.id)} className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-1 rounded-t-lg px-1 pt-3 hover:bg-slate-50" aria-label={`Open ${obligation.title}`}><span className="relative h-full w-2.5 max-w-5 rounded-t-md bg-[#f36d6d] transition group-hover:bg-[#ef5b5b]" style={{ height: `${Math.max(8, obligation.forecast.current)}%` }} /><span className="relative h-full w-2.5 max-w-5 rounded-t-md bg-[#5270e8] transition group-hover:bg-[#415ed2]" style={{ height: `${Math.max(8, obligation.forecast.projected)}%` }} /><span className="absolute h-0.5 w-8 max-w-[72%] rounded-full bg-[#f5c86a]" style={{ bottom: `${obligation.forecast.target}%` }} title={`Target ${obligation.forecast.target}%`} /><span className="absolute bottom-0 translate-y-6 truncate text-[9px] font-semibold text-slate-500 group-hover:text-[#176b75] sm:text-[10px]">{obligation.shortTitle}</span></button>)}</div>
      </div>
    </div>
    <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{hdiObligations.map((obligation) => <button key={`${obligation.id}-delta`} type="button" onClick={() => onWorklist(obligation.id)} className="rounded-lg bg-slate-50 px-2.5 py-2 text-left hover:bg-[#f1f8f5]"><p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">{obligation.shortTitle}</p><p className="mt-1 text-xs font-semibold text-slate-800">{obligation.forecast.projected}% forecast</p><p className={`mt-0.5 text-[10px] font-semibold ${obligation.forecast.projected >= obligation.forecast.target ? "text-emerald-700" : "text-amber-700"}`}>{obligation.forecast.projected >= obligation.forecast.target ? "At target" : `${obligation.forecast.target - obligation.forecast.projected} pts to target`}</p></button>)}</div>
  </section>;
}

function AttentionQueue({ onOpenPatientWorklist }: { onOpenPatientWorklist: (measure: string) => void }) {
  const workItems = hdiObligations.flatMap((obligation) => obligation.workItems.map((item) => ({ ...item, obligation })) ).sort((a, b) => b.impact - a.impact).slice(0, 4);
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Highest-value work</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Where to focus next</h3></div><span className="rounded-full bg-[#fff6e7] px-2.5 py-1 text-[11px] font-semibold text-[#8b5b1a]">Ranked by modeled impact</span></div><div className="mt-4 divide-y divide-slate-100">{workItems.map((item, index) => <div key={item.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#213a40] text-xs font-bold text-white">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{item.obligation.shortTitle} · {item.practice} · {item.dueInDays} days</p></div><div className="text-right"><p className="text-sm font-bold text-emerald-700">{money(item.impact)}</p><button type="button" onClick={() => onOpenPatientWorklist(item.driver)} className="text-[11px] font-semibold text-[#176b75] hover:underline">Open patients ↗</button></div></div>)}</div></section>;
}

function ObligationCard({ obligation, opportunities, expanded, onToggle, onWorklist, onOpenDataSubmissions, onOpenPatientWorklist }: { obligation: HdiObligation; opportunities: HdiCrossProgramOpportunity[]; expanded: boolean; onToggle: () => void; onWorklist: (id: HdiObligationId) => void; onOpenDataSubmissions?: () => void; onOpenPatientWorklist: (measure: string) => void }) {
  const topWork = [...obligation.workItems].sort((a, b) => b.impact - a.impact)[0];
  const nextDue = Math.min(...obligation.workItems.map((item) => item.dueInDays));
  const gap = obligation.forecast.target - obligation.forecast.projected;
  return <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${expanded ? "border-[#8ebdb0] ring-2 ring-[#e8f3ef]" : "border-[#e2e7ee]"}`}>
    <div className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">{obligation.category}</p><button type="button" onClick={onToggle} className="mt-1 text-left text-lg font-bold tracking-tight text-slate-900 hover:text-[#176b75]">{obligation.title}</button><p className="mt-1 text-xs text-slate-500">{obligation.scope} · {obligation.deadline}</p></div><button type="button" onClick={onToggle} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-[#176b75] hover:bg-[#f1f8f5]">{expanded ? "Hide detail" : "View detail"}</button></div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">At risk</p><p className="mt-1 text-lg font-bold text-amber-700">{money(obligation.atRiskDollars)}</p></div><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Recoverable</p><p className="mt-1 text-lg font-bold text-emerald-700">{money(obligation.recoverableDollars)}</p></div><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Lives</p><p className="mt-1 text-lg font-bold text-slate-900">{whole(obligation.lives)}</p></div><div className="rounded-xl bg-[#f7f9fc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Next due</p><p className="mt-1 text-lg font-bold text-slate-900">{nextDue}d</p></div></div>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{obligation.forecast.unit}</p><p className="mt-1 text-sm font-semibold text-slate-800"><span className="text-[#f36d6d]">{obligation.forecast.current}% current</span><span className="px-1.5 text-slate-300">→</span><span className="text-[#5270e8]">{obligation.forecast.projected}% forecast</span><span className="px-1.5 text-slate-300">·</span><span className="text-slate-600">{obligation.forecast.target}% target</span></p></div><p className={`text-xs font-semibold ${gap > 0 ? "text-amber-700" : "text-emerald-700"}`}>{gap > 0 ? `${gap} pts to target` : "At target"}</p></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#5270e8]" style={{ width: `${Math.max(8, obligation.forecast.projected)}%` }} /><div className="relative -mt-2 h-2 w-0.5 bg-slate-900" style={{ marginLeft: `${Math.min(98, obligation.forecast.target)}%` }} /></div>
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
  const [expandedId, setExpandedId] = useState<HdiObligationId | null>("cms-team");
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"><AttentionQueue onOpenPatientWorklist={openPatientWorklist} /><section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Shared leverage</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">One intervention, multiple obligations</h3></div><span className="rounded-full bg-[#e8f3ef] px-2.5 py-1 text-[11px] font-semibold text-[#285954]">{hdiCrossProgramOpportunities.length} pathways</span></div><div className="mt-4 space-y-3">{hdiCrossProgramOpportunities.slice(0, 3).map((opportunity) => <div key={opportunity.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{opportunity.title}</p><p className="mt-1 text-xs text-slate-500">{opportunity.obligationIds.length} obligations · {money(opportunity.recoverableDollars)} recoverable · {whole(opportunity.affectedLives)} lives</p></div><RelationshipBadge relationship={opportunity.relationship} /></div><div className="mt-2 flex flex-wrap gap-1.5">{opportunity.measureSet.slice(0, 2).map((measure) => <button key={measure} type="button" onClick={() => openPatientWorklist(measure)} className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-[#176b75] ring-1 ring-slate-200 hover:bg-[#e8f3ef]">{measure} ↗</button>)}</div></div>)}</div></section></div>

      <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Obligation portfolio</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Performance at a glance</h3><p className="mt-1 text-xs text-slate-500">Every card pairs financial exposure, performance trajectory, and the next highest-value measure.</p></div><button type="button" onClick={() => setView("worklist")} className="text-xs font-semibold text-[#176b75] hover:underline">Open all worklists →</button></div><div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">{hdiObligations.map((obligation) => <ObligationCard key={obligation.id} obligation={obligation} opportunities={opportunitiesFor(obligation.id)} expanded={expandedId === obligation.id} onToggle={() => toggleObligation(obligation.id)} onWorklist={openWorklist} onOpenDataSubmissions={obligation.id === "mips-mvp" ? openMipsDashboard : undefined} onOpenPatientWorklist={openPatientWorklist} />)}</div></section>

      <details className="rounded-2xl border border-[#e3deda] bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3"><span><span className="block text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Shared opportunity detail</span><span className="mt-1 block text-base font-semibold text-slate-900">All cross-program pathways</span></span><span className="rounded-full bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#285954]">{hdiCrossProgramOpportunities.length} pathways · {money(hdiCrossProgramOpportunities.reduce((sum, opportunity) => sum + opportunity.recoverableDollars, 0))} recoverable</span></summary><div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-medium text-slate-500">Select a measure or evidence signal to open the patient worklist.</p><div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">{hdiCrossProgramOpportunities.map((opportunity) => <article key={opportunity.id} className="rounded-xl border border-slate-200 bg-[#fbfaf8] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-sm font-semibold text-slate-900">{opportunity.title}</h4><p className="mt-1 text-xs text-slate-500">{money(opportunity.recoverableDollars)} recoverable · {whole(opportunity.affectedLives)} lives touched</p></div><RelationshipBadge relationship={opportunity.relationship} /></div><div className="mt-3 flex flex-wrap gap-1.5">{opportunity.measureSet.map((measure) => <button key={measure} type="button" onClick={() => openPatientWorklist(measure)} className="group rounded-md bg-white px-2 py-1 text-left text-[11px] text-slate-700 ring-1 ring-slate-200 hover:bg-[#e8f3ef] hover:text-[#176b75]">{measure} <span className="text-[#176b75] opacity-0 group-hover:opacity-100">↗</span></button>)}</div><div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200 pt-3">{opportunity.sharedEvidence.slice(0, 4).map((evidence) => <button key={evidence} type="button" onClick={() => openPatientWorklist(opportunity.measureSet[0])} className="rounded-md bg-white px-2 py-1 text-[11px] text-slate-600 ring-1 ring-slate-200 hover:bg-[#e8f3ef] hover:text-[#176b75]">{evidence} ↗</button>)}</div></article>)}</div></div></details>
    </div>}

    {view === "worklist" && <section className="space-y-6"><Breadcrumbs selected={selected} view={view} onOverview={() => setView("overview")} onWorklist={() => setView("worklist")} /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Operational worklist</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{selected.shortTitle} worklist</h2><p className="mt-2 text-sm text-slate-500">{selected.workItems.length} work items · {opportunitiesFor(selected.id).length} shared paths</p></div><button type="button" onClick={() => setView("overview")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Back to portfolio</button></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Metric label="Open actions" value={whole(selected.workItems.length)} detail="Across practice owners" tone="text-[#176b75]" /><Metric label="Modeled impact" value={money(selected.workItems.reduce((sum, item) => sum + item.impact, 0))} detail="If work lands on time" tone="text-emerald-700" /><Metric label="Next deadline" value={`${Math.min(...selected.workItems.map((item) => item.dueInDays))} days`} detail="Earliest practice action" tone="text-red-700" /></div><div className="overflow-hidden rounded-2xl border border-[#e3deda] bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-4"><h3 className="font-semibold text-slate-900">Practice action queue</h3><p className="mt-1 text-xs text-slate-500">Select a measure to open the patient worklist.</p></div><div className="divide-y divide-slate-100">{selected.workItems.map((item) => <div key={item.id} className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1.5fr)_180px_110px_160px_auto] lg:items-center"><div><h4 className="font-semibold text-slate-900">{item.title}</h4><p className="mt-1 text-xs text-slate-500">{item.practice} · {item.market} · {item.owner}</p><p className="mt-2 text-xs text-slate-500">{item.evidence}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Focus measure</p><button type="button" onClick={() => openPatientWorklist(item.driver)} className="mt-1 text-left text-sm font-semibold text-[#176b75] hover:underline">{item.driver} ↗</button></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Due</p><p className={`mt-1 text-sm font-semibold ${item.dueInDays <= 21 ? "text-red-700" : "text-slate-700"}`}>{item.dueInDays} days</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Impact</p><p className="mt-1 text-sm font-semibold text-emerald-700">{money(item.impact)}</p></div><button type="button" onClick={() => openPatientWorklist(item.driver)} className="rounded-xl border border-[#b5d1ca] bg-[#f5fbf8] px-3 py-2 text-xs font-semibold text-[#285954] hover:bg-[#e8f3ef]">Open patient list →</button></div>)}</div></div></section>}

    {view === "action" && <section className="space-y-6"><Breadcrumbs selected={selected} view={view} onOverview={() => setView("overview")} onWorklist={() => setView("worklist")} /><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#28737a]">Operational detail</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{selectedWork.title}</h2><p className="mt-2 text-sm text-slate-500">{selected.shortTitle} · {selectedWork.practice} · owner {selectedWork.owner}</p></div><div className="rounded-lg bg-[#e8f3ef] px-3 py-2 text-xs font-semibold text-[#285954]">{startedActions.includes(selectedWork.id) ? "Action in progress" : "Ready to review"}</div></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="space-y-6"><div className="rounded-2xl border border-[#e3deda] bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-slate-900">Why this work is here</h3><div className="mt-3 flex flex-wrap items-center gap-3"><span className="text-xs text-slate-500">{selectedWork.evidence}</span><button type="button" onClick={() => openPatientWorklist(selectedWork.driver)} className="rounded-lg bg-[#e8f3ef] px-3 py-1.5 text-xs font-semibold text-[#285954] hover:bg-[#dbe9e4]">Open patient list ↗</button><span className="text-xs font-semibold text-emerald-700">{money(selectedWork.impact)} opportunity</span></div><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Work type</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.actionType}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Practice</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.practice}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] uppercase tracking-wide text-slate-400">Due</p><p className="mt-1 font-semibold text-slate-800">{selectedWork.dueInDays} days</p></div></div></div><div className="rounded-2xl border border-[#b5d1ca] bg-[#f5fbf8] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Dashboard handoff</p><h3 className="mt-2 text-xl font-bold text-slate-900">{selected.id === "mips-mvp" ? "MIPS performance dashboard" : selectedWork.actionLabel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{selected.id === "mips-mvp" ? "Scorecard and patient detail in Data Submissions." : "Patient list and detailed analytics in Quality."}</p>{selected.id === "mips-mvp" ? <button type="button" onClick={openMipsDashboard} className="mt-6 rounded-xl bg-[#285954] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f4b47]">Open MIPS performance dashboard <span className="ml-2">→</span></button> : <button type="button" onClick={openDetailedAnalytics} className="mt-6 rounded-xl bg-[#285954] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1f4b47]">Open detailed analytics <span className="ml-2">→</span></button>}</div></div><aside className="h-fit rounded-2xl border border-[#e3deda] bg-[#f8fbfa] p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#28737a]">Context</p><h3 className="mt-2 text-xl font-bold text-slate-900">{selectedWork.actionLabel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Select a measure or patient list to continue.</p><button type="button" onClick={() => setView("worklist")} className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Return to worklist</button><div className="mt-5 border-t border-[#dbe9e4] pt-4 text-xs text-slate-500"><p>Measure family</p><p className="mt-1 font-semibold text-slate-700">{selectedWork.driver}</p><p className="mt-3">Forecast source</p><p className="mt-1 font-semibold text-slate-700">{selected.sponsor} · {selected.deadline}</p></div></aside></div></section>}
  </div>;
}
