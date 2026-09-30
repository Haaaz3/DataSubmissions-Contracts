"use client";
import type { HdiCrossProgramOpportunity, HdiObligation, HdiObligationId } from "@/data/synthetic/healthIntelligenceObligations";
import ProgramQualityMeasures from "./ProgramQualityMeasures";
import ProgramPerformanceOverview from "./ProgramPerformanceOverview";
import ModelProgramWorkspace from "./ModelProgramWorkspace";
import VbcContractPortfolio from "./VbcContractPortfolio";

export default function ProgramOverview({ obligation, onBack, onWorklist, onOpenDataSubmissions, onOpenPatientWorklist, onOpenContract }: { obligation: HdiObligation; opportunities: HdiCrossProgramOpportunity[]; onBack: () => void; onWorklist: (id: HdiObligationId) => void; onOpenDataSubmissions?: () => void; onOpenPatientWorklist: (measure: string) => void; onOpenContract?: (contractId: string) => void }) {
  if (obligation.id === "vbc-contracts") return <VbcContractPortfolio obligation={obligation} onBack={onBack} onOpenPatientWorklist={onOpenPatientWorklist} onOpenContract={onOpenContract ?? (() => undefined)} />;
  if (obligation.id === "cms-team" || obligation.id === "ambulatory-specialty-model") return <ModelProgramWorkspace key={obligation.id} program={obligation.id} onBack={onBack} />;
  return <section className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-900">{obligation.title}</h2><p className="mt-1 text-xs text-slate-500">{obligation.sponsor} · {obligation.scope} · {obligation.deadline}</p></div><button type="button" onClick={onBack} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">← Back to portfolio</button></div>
    <ProgramPerformanceOverview obligation={obligation} onQuality={key => {
      if (key) { const url = new URL(window.location.href); url.searchParams.set("qualityMeasure", key); window.history.pushState(null, "", url); window.dispatchEvent(new PopStateEvent("popstate")); }
      requestAnimationFrame(() => document.getElementById(key ? "program-measure-worklist" : "program-quality-measures")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }} onWorklist={() => onWorklist(obligation.id)} onReporting={onOpenDataSubmissions} />
    <ProgramQualityMeasures key={obligation.id} programId={obligation.id} onOpenReporting={onOpenDataSubmissions} />
    <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><h3 className="text-base font-bold text-slate-900">Operational work</h3><button type="button" onClick={() => onWorklist(obligation.id)} className="text-xs font-semibold text-[#176b75]">Open worklist →</button></div><div className="mt-3 divide-y divide-slate-100">{obligation.workItems.map(item => <div key={item.id} className="flex flex-wrap justify-between gap-3 py-3"><div><p className="text-xs font-semibold text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.owner} · {item.practice}</p></div><p className="text-xs font-semibold text-slate-600">Due {item.dueInDays} days</p></div>)}</div></section>
  </section>;
}
