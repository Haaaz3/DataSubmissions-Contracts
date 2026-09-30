"use client";
import { useMemo, useState } from "react";
import PatientListTable, { PatientListFrame, type SortKey } from "@/components/population/PatientListTable";
import { sharedMeasureFamilies } from "@/data/synthetic/sharedMeasures";
import { buildMeasurePopulation, filterMeasurePopulation, measurePopulationCsv, measureProviders, type MeasurePatientListState } from "@/lib/health-intelligence/measurePopulation";

export default function SharedMeasurePatientList({ state, onChange, onBack }: { state: MeasurePatientListState; onChange: (state: MeasurePatientListState, replace?: boolean) => void; onBack: () => void }) {
  const family = sharedMeasureFamilies.find(item => item.id === state.familyId)!;
  const patients = useMemo(() => buildMeasurePopulation(family), [family]);
  const filtered = useMemo(() => filterMeasurePopulation(patients, state), [patients, state]);
  const [sort, setSort] = useState<{ key: SortKey; descending: boolean }>({ key: "totalUnmetMeasures", descending: true });
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const comparison = sort.key === "totalUnmetMeasures" ? a.totalUnmetMeasures - b.totalUnmetMeasures : String(a[sort.key]).localeCompare(String(b[sort.key]));
    return (sort.descending ? -comparison : comparison) || a.mrn.localeCompare(b.mrn);
  }), [filtered, sort]);
  const pageSize = 50;
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(state.page, pages - 1);
  const visible = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const selected = family.obligations.find(item => item.id === state.obligationId);
  const memberships = filtered.reduce((sum, patient) => sum + patient.memberships.length, 0);
  const update = (patch: Partial<MeasurePatientListState>, replace = false) => onChange({ ...state, page: 0, ...patch }, replace);
  const exportPatients = () => {
    const url = URL.createObjectURL(new Blob([measurePopulationCsv(sorted)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${family.id}-${state.obligationId}-${state.status}.csv`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  return <section className="space-y-5" aria-labelledby="measure-patients-title">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><button type="button" onClick={onBack} className="mb-2 text-xs font-semibold text-[#176b75]">← Shared measures</button><h2 id="measure-patients-title" className="text-2xl font-bold text-slate-900">{family.name} patient list</h2><p className="mt-2 text-sm text-slate-500">{selected?.label ?? "All contracts and obligations"} · MY 2026 · Modeled patients</p></div></div>
    <PatientListFrame>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input aria-label="Search patients" value={state.query} onChange={event => update({ query: event.target.value }, true)} placeholder="Search patient, MRN, provider…" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select aria-label="Contract or obligation" value={state.obligationId} onChange={event => update({ obligationId: event.target.value })} className="max-w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"><option value="all">All contracts and obligations</option>{family.obligations.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        <select aria-label="Measure status" value={state.status} onChange={event => update({ status: event.target.value as MeasurePatientListState["status"] })} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"><option value="all">All eligible patients</option><option value="open">Open gaps</option><option value="met">Measure met</option></select>
        <select aria-label="Patient provider" value={state.provider} onChange={event => update({ provider: event.target.value })} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"><option value="">All providers</option>{measureProviders.map(provider => <option key={provider}>{provider}</option>)}</select>
        <button type="button" onClick={() => update({ query: "", provider: "", status: "all" })} className="px-2 py-2 text-xs font-semibold text-[#176b75]">Clear filters</button>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p role="status" className="text-2xl font-medium text-slate-900">{sorted.length.toLocaleString()} patients</p><p className="mt-1 text-xs text-slate-500">{memberships.toLocaleString()} obligation memberships · one row per patient</p></div><button type="button" onClick={exportPatients} disabled={!sorted.length} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Export filtered list</button></div>
      <p className="mb-3 text-xs text-slate-500">{state.obligationId === "all" ? "Open gaps: any obligation unmet. Measure met: all applicable obligations met. Expand a patient’s obligations for individual results." : `Filtered to ${selected?.definitionId} in the selected obligation.`}</p>
      <PatientListTable patients={visible} showSelection={false} linkMembers={false} measureColumnLabel="Obligations / status" onSort={key => { setSort(current => ({ key, descending: current.key === key ? !current.descending : false })); update({ page: 0 }); }} renderMeasures={patient => <details className="min-w-[210px]"><summary className="cursor-pointer text-xs font-semibold text-[#176b75]">{patient.memberships.length} {patient.memberships.length === 1 ? "obligation" : "obligations"} · {patient.totalUnmetMeasures ? `${patient.totalUnmetMeasures} open` : "Met"}</summary><div className="mt-2 space-y-3">{patient.memberships.map(item => <div key={item.obligationId} className="border-t border-slate-100 pt-2 text-xs"><button type="button" onClick={() => update({ obligationId: item.obligationId })} className="text-left font-semibold text-[#176b75] hover:underline">{item.label}</button><p className="mt-1 font-semibold text-slate-700">{item.definitionId} · {item.status}</p><p className="mt-1 text-slate-500">{item.evidence}</p></div>)}</div></details>} />
      {!sorted.length && <p className="p-6 text-center text-sm text-slate-500">No patients match the selected filters.</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600"><p>Showing {sorted.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length.toLocaleString()} patients</p><div className="flex items-center gap-3"><button type="button" disabled={page === 0} onClick={() => onChange({ ...state, page: page - 1 })} className="rounded border px-3 py-1.5 disabled:opacity-40">Previous</button><span>Page {page + 1} of {pages}</span><button type="button" disabled={page >= pages - 1} onClick={() => onChange({ ...state, page: page + 1 })} className="rounded border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
    </PatientListFrame>
  </section>;
}
