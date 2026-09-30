"use client";

import { useMemo, useState } from "react";
import VbcFinancialSummary from "./VbcFinancialSummary";
import { useExpenseBasis } from "@/lib/contracts/useExpenseBasis";
import PmpmTrendChart from "@/components/charts/PmpmTrendChart";
import QualityGauge from "@/components/charts/QualityGauge";
import { mockContracts } from "@/lib/mockData";
import type { Contract } from "@/types/contract";

type PopulationFilter = "all" | "changed" | "numerator" | "denominator" | "exclusion";

type MeasureRow = {
  id: string;
  name: string;
  code: string;
  current: number;
  target: number;
  population: number;
  gap: number;
  lift: number;
  reason: string;
  evidence: string;
};

type PatientRow = {
  id: string;
  provider: string;
  specialty: string;
  status: "Open gap" | "Met" | "Excluded";
  outcome: "Numerator" | "Denominator" | "Exclusion";
  change: string;
  evidence: string;
};

const whole = (value: number) => value.toLocaleString("en-US");

function statusStyles(status: Contract["status"]) {
  if (status === "On Track") return "bg-emerald-50 text-emerald-700";
  if (status === "At Risk") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function qualityMeasures(contract: Contract): MeasureRow[] {
  const lives = contract.attributedLives;
  const base = Math.max(12, Math.round(lives * 0.08));
  const qualityOffset = Math.max(-3, Math.round((contract.qualityScore - 70) / 10));
  return [
    { id: "readmissions", name: "Hospital-wide all-cause readmission", code: "CMS 466 / HWR", current: Math.max(58, contract.qualityScore - 8 + qualityOffset), target: 85, population: Math.round(lives * 0.78), gap: base + 36, lift: 3.4, reason: "Post-discharge follow-up gap", evidence: "Index discharge · 48-hour outreach · medication reconciliation" },
    { id: "depression", name: "Screening for depression and follow-up plan", code: "CMS2v15 / M1368", current: Math.max(62, contract.qualityScore + 4), target: 85, population: Math.round(lives * 0.32), gap: base + 8, lift: 1.2, reason: "Documentation capture", evidence: "Screening result · follow-up plan · encounter note" },
    { id: "blood-pressure", name: "Controlling high blood pressure", code: "CMS165v14 / APP Plus", current: Math.max(60, contract.qualityScore + 2), target: 85, population: Math.round(lives * 0.27), gap: base + 2, lift: 0.9, reason: "Attribution + vitals feed", evidence: "Latest BP · attributed encounter · medication fill" },
    { id: "colorectal", name: "Colorectal cancer screening", code: "CMS130v14 / APP Plus", current: Math.max(55, contract.qualityScore - 1), target: 85, population: Math.round(lives * 0.18), gap: Math.max(18, base - 10), lift: 0.8, reason: "Registry reconciliation", evidence: "Procedure evidence · registry status · external result" },
    { id: "medication", name: "Medication reconciliation after discharge", code: "MIPS QID 46", current: Math.max(64, contract.qualityScore + 1), target: 90, population: Math.round(lives * 0.22), gap: base + 17, lift: 0.7, reason: "Medication continuity", evidence: "Discharge list · pharmacy history · reconciliation note" },
  ];
}

function patientRows(measure: MeasureRow): PatientRow[] {
  const providers = ["Northstar Medical Group", "Lakeside Physicians", "Summit Family Health", "Eastside Specialty Care"];
  const specialties = ["Primary care", "Hospital medicine", "Cardiology", "Endocrinology"];
  return Array.from({ length: 26 }, (_, index) => {
    const open = index % 5 !== 2;
    const excluded = index % 13 === 0;
    return {
      id: `HX-${String(4102 + index * 17).padStart(6, "0")}`,
      provider: providers[index % providers.length],
      specialty: specialties[index % specialties.length],
      status: excluded ? "Excluded" : open ? "Open gap" : "Met",
      outcome: excluded ? "Exclusion" : open ? "Denominator" : "Numerator",
      change: index % 3 === 0 ? "Status changed 8d ago" : index % 3 === 1 ? "No change this round" : "Status changed 21d ago",
      evidence: index % 2 === 0 ? measure.evidence.split(" · ")[index % 3] : "Source reconciliation pending",
    };
  });
}

function Trend({ measure }: { measure: MeasureRow }) {
  const values = [measure.current - 8, measure.current - 6, measure.current - 4, measure.current - 2, measure.current - 1, measure.current];
  const target = measure.target;
  const min = Math.min(...values, target) - 3;
  const max = Math.max(...values, target) + 3;
  const point = (value: number, index: number) => `${(index / (values.length - 1)) * 100},${92 - ((value - min) / (max - min)) * 72}`;
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#28737a]">Population trend</p><h3 className="mt-1 text-base font-bold text-slate-900">{measure.name}</h3><p className="mt-1 text-xs text-slate-500">Entire eligible measure population · current score vs target</p></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">{measure.current}% current · {measure.target}% target</span></div><div className="mt-3 h-36"><svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`${measure.name} score trend`} preserveAspectRatio="none"><line x1="0" x2="100" y1={92 - ((target - min) / (max - min)) * 72} y2={92 - ((target - min) / (max - min)) * 72} stroke="#f1b24d" strokeDasharray="2 2" strokeWidth="0.8" /><polyline points={values.map(point).join(" ")} fill="none" stroke="#5270e8" strokeWidth="2" vectorEffect="non-scaling-stroke" /><polyline points={`0,92 ${values.map(point).join(" ")} 100,92`} fill="#5270e8" fillOpacity="0.08" stroke="none" />{values.map((value, index) => <circle key={`${value}-${index}`} cx={(index / (values.length - 1)) * 100} cy={92 - ((value - min) / (max - min)) * 72} r="1.8" fill="#5270e8" vectorEffect="non-scaling-stroke" />)}</svg></div><div className="flex items-center justify-between text-[10px] text-slate-400"><span>6 months ago</span><span>Target baseline</span><span>Current</span></div></div>;
}

function PopulationWorkbench({ measure, onOpenExternal }: { measure: MeasureRow; onOpenExternal: (measure: string) => void }) {
  const [filter, setFilter] = useState<PopulationFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"changed" | "patient">("changed");
  const sampleRows = useMemo(() => patientRows(measure), [measure]);
  const counts: Record<PopulationFilter, number> = {
    all: measure.population,
    changed: Math.round(measure.population * 0.14),
    numerator: Math.round(measure.population * (measure.current / 100)),
    denominator: Math.max(0, measure.population - Math.round(measure.population * (measure.current / 100))),
    exclusion: Math.round(measure.population * 0.03),
  };
  const visibleRows = sampleRows.filter((row) => {
    const matchesFilter = filter === "all" || filter === "changed" && row.change.includes("changed") || filter === "numerator" && row.outcome === "Numerator" || filter === "denominator" && row.outcome === "Denominator" || filter === "exclusion" && row.outcome === "Exclusion";
    const needle = query.toLowerCase();
    return matchesFilter && (!needle || `${row.id} ${row.provider} ${row.specialty} ${row.evidence}`.toLowerCase().includes(needle));
  }).sort((a, b) => sort === "patient" ? a.id.localeCompare(b.id) : Number(b.change.includes("changed")) - Number(a.change.includes("changed")));
  const filters: Array<{ id: PopulationFilter; label: string }> = [{ id: "all", label: "All patients" }, { id: "changed", label: "Changed" }, { id: "numerator", label: "Numerator" }, { id: "denominator", label: "Denominator" }, { id: "exclusion", label: "Exclusions" }];
  return <section className="rounded-2xl border border-[#dce5e7] bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">Patient population</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Entire measure population</h3><p className="mt-1 text-xs text-slate-500">{whole(measure.population)} eligible patients · filters and evidence match Patient Level Validation</p></div><button type="button" onClick={() => onOpenExternal(measure.name)} className="rounded-lg border border-[#b5d1ca] bg-[#f5fbf8] px-3 py-2 text-xs font-semibold text-[#285954] hover:bg-[#e8f3ef]">Open in population workspace ↗</button></div><div className="mt-4 flex flex-wrap gap-2">{filters.map((item) => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${filter === item.id ? "bg-[#285954] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item.label} <span className={filter === item.id ? "text-white/70" : "text-slate-400"}>{whole(counts[item.id])}</span></button>)}</div><div className="mt-3 flex flex-wrap gap-2"><input aria-label="Search entire measure population" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patient, provider, specialty, evidence" className="min-w-[260px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#7daaa0]" /><select aria-label="Sort population" value={sort} onChange={(event) => setSort(event.target.value as "changed" | "patient")} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"><option value="changed">Status changed first</option><option value="patient">Patient ID</option></select><select aria-label="Measurement round" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"><option>Current round</option><option>Prior round</option></select></div></div><div className="border-b border-slate-100 bg-[#f8fbfa] px-5 py-3 text-[11px] text-slate-600"><strong className="text-slate-800">{whole(counts[filter])} patients in this view.</strong> Showing {visibleRows.length} representative rows below; population counts reflect the full measure denominator.</div><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-xs"><thead className="bg-[#fbfcfe] text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400"><tr><th className="px-5 py-3">Patient</th><th className="px-3 py-3">Provider / specialty</th><th className="px-3 py-3">Outcome</th><th className="px-3 py-3">Status signal</th><th className="px-3 py-3">Evidence</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map((row) => <tr key={row.id} className="hover:bg-[#f8fbfa]"><td className="px-5 py-3"><span className="font-bold text-slate-800">{row.id}</span><span className="mt-1 block text-[10px] text-slate-400">Full population member</span></td><td className="px-3 py-3"><span className="font-semibold text-slate-700">{row.provider}</span><span className="mt-1 block text-[10px] text-slate-400">{row.specialty}</span></td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.outcome === "Numerator" ? "bg-emerald-50 text-emerald-700" : row.outcome === "Exclusion" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-700"}`}>{row.outcome}</span></td><td className="px-3 py-3"><span className={`font-semibold ${row.status === "Open gap" ? "text-amber-700" : row.status === "Met" ? "text-emerald-700" : "text-slate-500"}`}>{row.status}</span><span className="mt-1 block text-[10px] text-slate-400">{row.change}</span></td><td className="max-w-[220px] px-3 py-3 text-[11px] text-slate-500">{row.evidence}</td><td className="px-5 py-3 text-right"><button type="button" onClick={() => onOpenExternal(measure.name)} className="font-semibold text-[#176b75] hover:underline">Open patient ↗</button></td></tr>)}</tbody></table></div></section>;
}

export default function HdiContractDetail({ contractId, onBack, onOpenPatientWorklist }: { contractId: string; onBack: () => void; onOpenPatientWorklist: (measure: string) => void }) {
  const contract = mockContracts.find((item) => item.id === contractId) ?? mockContracts[0];
  const [costUnit, setCostUnit] = useExpenseBasis("contract:" + contract.id, contract.expenseBasis ?? "pmpm");
  const measures = useMemo(() => qualityMeasures(contract), [contract]);
  const [selectedMeasureId, setSelectedMeasureId] = useState(measures[0]?.id ?? "readmissions");
  const [detailNotice, setDetailNotice] = useState<string | null>(null);
  const selectedMeasure = measures.find((measure) => measure.id === selectedMeasureId) ?? measures[0];
  const overTarget = contract.currentPmpm > contract.targetPmpm;
  const trendDelta = contract.currentPmpm - (contract.trend[0]?.pmpm ?? contract.currentPmpm);
  const trendLabel = trendDelta > 0 ? `↑ $${trendDelta} over 6 months` : trendDelta < 0 ? `↓ $${Math.abs(trendDelta)} over 6 months` : "Flat over 6 months";
  const inspectMeasure = (measureId: string) => {
    setSelectedMeasureId(measureId);
    window.setTimeout(() => document.getElementById("hdi-patient-population")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  if (!selectedMeasure) return null;
  return <section className="space-y-5">
    <button type="button" onClick={onBack} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900">← Back to VBC contracts</button>
    {detailNotice && <div role="status" className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-800">{detailNotice}</div>}
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-1 flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold tracking-tight text-slate-900">{contract.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles(contract.status)}`}>{contract.status}</span></div><p className="text-sm text-slate-500">{contract.payor}<span className="mx-2 text-slate-300">·</span><span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">{contract.contractType}</span><span className="mx-2 text-slate-300">·</span><button type="button" onClick={() => onOpenPatientWorklist("Contracted population")} className="font-medium text-indigo-600 underline decoration-dotted underline-offset-2 hover:text-indigo-700">{whole(contract.attributedLives)} lives</button></p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setDetailNotice("Contract configuration is available in this HDI detail workspace.")} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Configure Contract</button><button type="button" onClick={() => setDetailNotice("The quality workbench below is the HDI contract scorecard.")} className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-50">Contract Scorecard</button><button type="button" onClick={() => setDetailNotice("Scenario Studio is queued for this HDI contract workspace.")} className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100">Open Scenario Studio</button></div></div>

    <VbcFinancialSummary contracts={[contract]} unit={costUnit} onUnitChange={setCostUnit} />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border-l-4 border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lives</p><p className="mt-2 text-3xl font-bold text-slate-900">{whole(contract.attributedLives)}</p><p className="mt-1 text-sm text-slate-500">Full contracted population</p></div><div className={`rounded-xl border-l-4 ${overTarget ? "border-red-400" : "border-emerald-400"} bg-white p-5 shadow-sm ring-1 ring-slate-100`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current PMPM</p><p className="mt-2 text-3xl font-bold text-slate-900">${contract.currentPmpm}</p><p className={`mt-1 text-sm ${overTarget ? "text-red-600" : "text-emerald-700"}`}>${Math.abs(contract.currentPmpm - contract.targetPmpm)} {overTarget ? "over" : "under"} ${contract.targetPmpm} target</p></div><div className="rounded-xl border-l-4 border-amber-400 bg-white p-5 shadow-sm ring-1 ring-slate-100"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quality score</p><p className="mt-2 text-3xl font-bold text-slate-900">{contract.qualityScore}<span className="text-lg text-slate-400"> / 100</span></p><p className="mt-1 text-sm text-slate-500">Composite contract measure</p></div><div className="rounded-xl border-l-4 border-amber-400 bg-white p-5 shadow-sm ring-1 ring-slate-100"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ED visits / 1,000</p><p className="mt-2 text-3xl font-bold text-slate-900">{contract.edVisitsPer1000}</p><p className="mt-1 text-sm text-slate-500">Emergency department utilization</p></div></div>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-4"><div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-900">Monthly performance trend</h3><p className="text-xs text-slate-400">PMPM spend (indigo) and quality score (green) · dashed line = target PMPM</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${trendDelta > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{trendLabel}</span></div><div className="mt-3"><PmpmTrendChart data={contract.trend} targetPmpm={contract.targetPmpm} /></div></div><div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><h3 className="text-base font-semibold text-slate-900">Quality score</h3><p className="mb-2 text-xs text-slate-400">Composite measure (0–100)</p><div className="flex justify-center"><QualityGauge score={contract.qualityScore} /></div><div className="mt-3 space-y-1.5 text-xs">{[{ label: "Excellent", range: "≥ 85", color: "bg-emerald-400" }, { label: "Good", range: "75–84", color: "bg-indigo-400" }, { label: "Fair", range: "65–74", color: "bg-amber-400" }, { label: "Poor", range: "< 65", color: "bg-red-400" }].map((tier) => <div key={tier.label} className="flex items-center gap-2 text-slate-500"><span className={`h-2 w-2 shrink-0 rounded-full ${tier.color}`} /><span>{tier.label}</span><span className="ml-auto text-slate-400">{tier.range}</span></div>)}</div></div></div>

    <section className="rounded-2xl border border-[#dce5e7] bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">Quality workbench</p><h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Quality measures</h3><p className="mt-1 text-xs text-slate-500">{whole(contract.attributedLives)} contracted members · Financial impact is calculated through the contract quality gate above.</p></div><span className="rounded-full bg-[#e8f3ef] px-3 py-1.5 text-[11px] font-semibold text-[#285954]">Select a measure to inspect patients</span></div></div><div className="overflow-x-auto"><table className="w-full min-w-[1060px] text-left text-xs"><thead className="bg-[#fbfcfe] text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400"><tr><th className="px-5 py-3">Measure</th><th className="px-3 py-3">Current / target</th><th className="px-3 py-3">Entire population</th><th className="px-3 py-3">Modeled lift</th><th className="px-3 py-3">Likely reason</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{measures.map((measure) => <tr key={measure.id} className={`cursor-pointer transition hover:bg-[#f8fbfa] ${measure.id === selectedMeasureId ? "bg-[#f5fbf8]" : ""}`} onClick={() => inspectMeasure(measure.id)}><td className="px-5 py-4"><button type="button" onClick={() => inspectMeasure(measure.id)} className="text-left"><span className="block font-bold text-slate-900">{measure.name}</span><span className="mt-1 block text-[10px] text-slate-500">{measure.code}</span></button></td><td className="px-3 py-4"><span className="font-bold text-slate-800">{measure.current}%</span><span className="mt-1 block text-[10px] text-slate-500">Target {measure.target}%</span></td><td className="px-3 py-4"><span className="font-bold text-slate-800">{whole(measure.population)}</span><span className="mt-1 block text-[10px] text-amber-700">{whole(measure.gap)} open gaps</span></td><td className="px-3 py-4"><span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-700">+{measure.lift.toFixed(1)} pts</span></td><td className="max-w-[220px] px-3 py-4"><span className="font-semibold text-slate-700">{measure.reason}</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">{measure.evidence}</span></td><td className="px-5 py-4 text-right"><button type="button" onClick={(event) => { event.stopPropagation(); inspectMeasure(measure.id); }} className="rounded-lg border border-[#b5d1ca] bg-white px-3 py-2 text-[11px] font-semibold text-[#285954] hover:bg-[#e8f3ef]">Open patients →</button></td></tr>)}</tbody></table></div></section>

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><Trend measure={selectedMeasure} /><div className="rounded-xl border border-slate-200 bg-[#fbfcfe] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#28737a]">Next best work</p><p className="mt-1 text-lg font-bold text-slate-900">{selectedMeasure.reason}</p><p className="mt-1 text-xs leading-5 text-slate-500">{selectedMeasure.gap.toLocaleString()} patients are currently below the {selectedMeasure.target}% target in the full {selectedMeasure.population.toLocaleString()} patient denominator.</p><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-lg bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Open gaps</p><p className="mt-1 text-xl font-bold text-amber-700">{whole(selectedMeasure.gap)}</p></div><div className="rounded-lg bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Lift available</p><p className="mt-1 text-xl font-bold text-emerald-700">+{selectedMeasure.lift.toFixed(1)} pts</p></div></div><button type="button" onClick={() => inspectMeasure(selectedMeasure.id)} className="mt-4 w-full rounded-lg bg-[#285954] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#1f4b47]">Inspect full patient population ↓</button></div></div>

    <div id="hdi-patient-population"><PopulationWorkbench measure={selectedMeasure} onOpenExternal={onOpenPatientWorklist} /></div>
  </section>;
}
