"use client";

import { useState } from "react";
import { hdiObligations, type HdiObligationId } from "@/data/synthetic/healthIntelligenceObligations";
import { sharedMeasureFamilies, type SharedMeasureFamily, type MeasureObligation } from "@/data/synthetic/sharedMeasures";
import { calculateMeasureImpact, countMeasurePrograms, filterSharedMeasures } from "@/lib/health-intelligence/sharedMeasures";
import MeasureImpactMetrics from "./MeasureImpactMetrics";

type Props = {
  initialExpandedId?: string;
  onOpenObligation: (family: SharedMeasureFamily, obligation: MeasureObligation) => void;
};

function DefinitionComparison({ family }: { family: SharedMeasureFamily }) {
  return <div className="space-y-4">
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="text-xs font-bold text-amber-900">Close clinical match · separate specifications</p>
      <p className="mt-1 text-sm leading-6 text-amber-900">{family.review}</p>
    </div>
    <div className="grid gap-3 md:grid-cols-2">{family.definitions.map(definition => <div key={definition.id} className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold text-[#176b75]">{definition.standard} · {definition.id} · {definition.year}</p>
      <h5 className="mt-1 text-sm font-semibold text-slate-900">{definition.name}</h5>
      <dl className="mt-3 space-y-3 text-xs leading-5">
        <div><dt className="font-bold text-slate-500">Population / eligibility</dt><dd className="text-slate-700">{definition.population}</dd></div>
        <div><dt className="font-bold text-slate-500">What the rate measures</dt><dd className="text-slate-700">{definition.outcome} <strong>{definition.direction}.</strong></dd></div>
        <div><dt className="font-bold text-slate-500">Collection</dt><dd className="text-slate-700">{definition.method}</dd></div>
      </dl>
      <a href={definition.source} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-[#176b75] underline underline-offset-2">{definition.standard === "HEDIS" ? "NCQA measure overview" : "2026 eCQM specification"} ↗</a>
    </div>)}</div>
    <p className="text-xs leading-5 text-slate-500">These are comparison summaries. Confirm the full specification, reporting method and contract year before reusing a calculated result.</p>
  </div>;
}

function MeasureFamily({ family, obligations, expanded, onToggle, onOpenObligation }: {
  family: SharedMeasureFamily;
  obligations: MeasureObligation[];
  expanded: boolean;
  onToggle: () => void;
  onOpenObligation: Props["onOpenObligation"];
}) {
  const [comparing, setComparing] = useState(false);
  const reference = family.definitions[0];
  const programCount = countMeasurePrograms(obligations);
  const belowTarget = obligations.filter(obligation => calculateMeasureImpact(obligation.impact, family.definitions.find(item => item.id === obligation.definitionId)!.direction).targetMet === false).length;
  const headingId = `measure-${family.id}`;
  return <article className={`overflow-hidden rounded-xl border ${expanded ? "border-[#a9cec4]" : "border-slate-200"}`}>
    <h4><button type="button" id={headingId} aria-expanded={expanded} aria-controls={`${headingId}-body`} onClick={onToggle} className="flex w-full flex-wrap items-center gap-x-5 gap-y-3 bg-white px-4 py-4 text-left hover:bg-[#f8fbfa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#176b75] sm:px-5">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${expanded ? "bg-[#e8f3ef] text-[#176b75]" : "bg-slate-100 text-slate-600"}`} aria-hidden="true">{expanded ? "−" : "+"}</span>
      <span className="min-w-0 flex-1"><span className="block text-base font-bold text-slate-900">{family.name}</span><span className="mt-1 block text-xs text-slate-500">{family.focus}</span></span>
      <span className="flex flex-wrap items-center gap-3 text-xs">
        <span className="font-semibold text-slate-600">{obligations.length} {obligations.length === 1 ? "obligation" : "obligations"} · {programCount} {programCount === 1 ? "program" : "programs"}</span>
        <span className={`rounded-full px-2.5 py-1 font-semibold ${belowTarget ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{belowTarget ? `${belowTarget} off target` : "Targets met"}</span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">HEDIS ↔ CQM close match</span>
      </span>
    </button></h4>
    {expanded && <div id={`${headingId}-body`} role="region" aria-labelledby={headingId} className="border-t border-[#dbe9e4] bg-[#f8fbfa] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl"><p className="text-xs font-bold text-[#28737a]">Shared evidence</p><p className="mt-1 text-sm text-slate-700">{family.reuse}</p><p className="mt-2 text-xs leading-5 text-slate-500"><strong className="text-slate-600">Action:</strong> {family.nextAction}</p></div>
        <button type="button" onClick={() => setComparing(value => !value)} aria-expanded={comparing} aria-controls={`${headingId}-comparison`} className="shrink-0 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-50">{comparing ? "Hide comparison" : "Compare HEDIS & CQM"}</button>
      </div>
      {comparing && <div id={`${headingId}-comparison`} className="mb-5"><DefinitionComparison family={family} /></div>}
      <p className="mb-2 text-[11px] font-semibold text-slate-500">Compared with HEDIS {reference.id} · MY 2026 · Modeled data</p>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {obligations.map(obligation => {
          const definition = family.definitions.find(item => item.id === obligation.definitionId)!;
          const close = definition.standard === "eCQM";
          const program = hdiObligations.find(item => item.id === obligation.programId)!;
          return <li key={obligation.id} className="p-4" aria-label={`${family.name} — ${obligation.label}`}>
            <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wide text-[#28737a]">{program.shortTitle} · {definition.standard} {definition.id}</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{obligation.label}</p></div>
            {close ? <button type="button" onClick={() => setComparing(value => !value)} aria-expanded={comparing} aria-controls={`${headingId}-comparison`} className="w-fit rounded-full bg-amber-50 px-2.5 py-1.5 text-left text-xs font-semibold text-amber-800 hover:bg-amber-100">Close clinical match ↗</button> : <span className="w-fit rounded-full bg-[#e8f3ef] px-2.5 py-1.5 text-xs font-semibold text-[#285954]">Shared HEDIS measure</span>}
            <button type="button" onClick={() => onOpenObligation(family, obligation)} aria-label={`Open ${obligation.label} for ${family.name}`} className="w-fit rounded-lg border border-[#b5d1ca] px-3 py-2 text-xs font-semibold text-[#176b75] hover:bg-[#e8f3ef]">{obligation.contractId ? "Open contract" : "Open program"} →</button>
            </div>
            <MeasureImpactMetrics impact={obligation.impact} direction={definition.direction} />
          </li>;
        })}
      </ul>
      <p className="mt-3 text-xs leading-5 text-slate-500">Shared HEDIS IDs require confirmation of collection methods and contract-specific rules.</p>
    </div>}
  </article>;
}

export default function SharedMeasureExplorer({ initialExpandedId = "blood-pressure", onOpenObligation }: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>([initialExpandedId]);
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState<HdiObligationId | "all">("all");
  const results = filterSharedMeasures(sharedMeasureFamilies, query, program);
  const programIds = new Set(sharedMeasureFamilies.flatMap(family => family.obligations.map(item => item.programId)));
  return <section id="shared-measures" tabIndex={-1} aria-labelledby="shared-measures-title" className="scroll-mt-6 rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><h3 id="shared-measures-title" className="text-xl font-bold tracking-tight text-slate-900">Shared measures</h3><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">MY 2026 · Modeled data</span></div>
    <div className="mt-5 flex flex-wrap items-end gap-3">
      <label className="min-w-[180px] flex-1 text-xs font-semibold text-slate-600">Find a measure or obligation<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Blood pressure, CMS165, Aetna…" className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900" /></label>
      <label className="text-xs font-semibold text-slate-600">Program<select value={program} onChange={event => setProgram(event.target.value as HdiObligationId | "all")} className="mt-1.5 block max-w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-900"><option value="all">All programs</option>{hdiObligations.filter(item => programIds.has(item.id)).map(item => <option key={item.id} value={item.id}>{item.shortTitle}</option>)}</select></label>
      <button type="button" onClick={() => setExpandedIds(results.every(({ family }) => expandedIds.includes(family.id)) ? [] : results.map(({ family }) => family.id))} disabled={!results.length} className="rounded-lg px-3 py-2.5 text-xs font-semibold text-[#176b75] hover:bg-[#f1f6f5] disabled:opacity-40">{results.length > 0 && results.every(({ family }) => expandedIds.includes(family.id)) ? "Collapse all" : "Expand all"}</button>
    </div>
    <p aria-live="polite" className="my-3 text-xs text-slate-500">{results.length} measure {results.length === 1 ? "family" : "families"}</p>
    <div className="space-y-3">{results.map(({ family, obligations }) => <MeasureFamily key={family.id} family={family} obligations={obligations} expanded={expandedIds.includes(family.id)} onToggle={() => setExpandedIds(ids => ids.includes(family.id) ? ids.filter(id => id !== family.id) : [...ids, family.id])} onOpenObligation={onOpenObligation} />)}</div>
    {results.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center"><p className="text-sm text-slate-600">No measures match this search and program.</p><button type="button" onClick={() => { setQuery(""); setProgram("all"); }} className="mt-2 text-sm font-semibold text-[#176b75] underline">Clear filters</button></div>}
    <p className="mt-4 text-xs leading-5 text-slate-500">Illustrative obligations and impact. Populations overlap; patient counts and exposure are not portfolio totals.</p>
  </section>;
}
