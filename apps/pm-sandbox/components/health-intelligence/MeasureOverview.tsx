"use client";
import { useMemo } from "react";
import type { MeasureObligation, SharedMeasureFamily } from "@/data/synthetic/sharedMeasures";
import { buildMeasurePopulation } from "@/lib/health-intelligence/measurePopulation";
import { summarizeMeasurePopulation } from "@/lib/health-intelligence/measureOverview";

export default function MeasureOverview({ family, obligations, onOpenGaps }: {
  family: SharedMeasureFamily;
  obligations: MeasureObligation[];
  onOpenGaps: (obligationId: string) => void;
}) {
  const patients = useMemo(() => buildMeasurePopulation(family), [family]);
  const summary = useMemo(() => summarizeMeasurePopulation(family, obligations, patients), [family, obligations, patients]);
  const count = (value: number) => value.toLocaleString("en-US");
  return <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3" aria-label={`${family.name} summary`}>
    <p className="mb-3 text-[11px] text-slate-500">{obligations.length === family.obligations.length ? "All obligations" : `${obligations.length} shown ${obligations.length === 1 ? "obligation" : "obligations"}`} · Patients counted once</p>
    <dl className="grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.5fr]">
      <div><dt className="text-xs font-semibold text-slate-500">Eligible patients</dt><dd className="mt-1 text-xl font-bold text-slate-900">{count(summary.eligible)}</dd><dd className="mt-1 text-[11px] text-slate-500">Across shown obligations</dd></div>
      <div><dt className="text-xs font-semibold text-slate-500">Patients with gaps</dt><dd className="mt-1 text-xl font-bold text-amber-800">{count(summary.open)}</dd><dd className="mt-1 text-[11px] text-slate-500">At least one open gap</dd></div>
      <div><dt className="text-xs font-semibold text-slate-500">Shared patients</dt><dd className="mt-1 text-xl font-bold text-slate-900">{count(summary.shared)}</dd><dd className="mt-1 text-[11px] text-slate-500">Eligible for 2+ obligations · {count(summary.sharedOpen)} with gaps in 2+</dd></div>
      <div><dt className="text-xs font-semibold text-slate-500">Largest target workload</dt>{summary.priority ? <><dd className="mt-1 text-base font-bold text-slate-900">{count(summary.priority.impact.patientsToTarget!)} patients to target</dd><dd className="mt-1 text-[11px] text-slate-500">{summary.priority.obligation.label} · {summary.priority.impact.gapPoints!.toFixed(1)} pp gap</dd><dd className="mt-1"><button type="button" onClick={() => onOpenGaps(summary.priority!.obligation.id)} className="text-left text-[11px] font-semibold text-[#176b75] hover:underline">View {count(summary.priority.impact.openGaps)} open gaps →</button></dd></> : <dd className="mt-1 text-sm text-slate-600">No measured target gaps</dd>}</div>
    </dl>
  </div>;
}
