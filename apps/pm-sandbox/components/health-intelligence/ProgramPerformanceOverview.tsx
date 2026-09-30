"use client";
import { useState } from "react";
import type { HdiObligation } from "@/data/synthetic/healthIntelligenceObligations";
import { portfolioFinancialScenarios } from "@/data/synthetic/portfolioFinancialScenarios";
import { portfolioMetricContext } from "@/lib/health-intelligence/portfolioSummary";
import { improvement, signedMoney } from "@/lib/health-intelligence/financialEnvelope";
import { mipsCategories, mipsScore, mipsScoringSource, programQualityResults, qualityGap } from "@/data/synthetic/programPerformance";
import { episodeStats, modelEpisodes, modelQuality, teamReconciliation } from "@/data/synthetic/modelProgram";
import FinancialEnvelope from "./FinancialEnvelope";

export default function ProgramPerformanceOverview({ obligation, onQuality, onWorklist, onReporting, onModelSection }: {
  obligation: HdiObligation; onQuality: (key?: string) => void; onWorklist?: () => void; onReporting?: () => void;
  onModelSection?: (section: "quality" | "cost") => void;
}) {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const scenario = portfolioFinancialScenarios[obligation.id];
  const metric = portfolioMetricContext[obligation.id];
  const model = obligation.id === "cms-team" || obligation.id === "ambulatory-specialty-model" ? obligation.id : null;
  const results = programQualityResults(obligation.id);
  const models = model ? modelQuality(model) : [];
  const offTarget = model ? models.filter(row => row.lower ? row.current > row.target : row.current < row.target).length : results.filter(row => qualityGap(row) > 0).length;
  const cost = model ? episodeStats(modelEpisodes[model]) : null;
  const mips = obligation.id === "mips-mvp";
  const current = mips ? mipsScore("current") : obligation.forecast.current;
  const forecast = mips ? mipsScore("forecast") : obligation.forecast.projected;
  const suffix = metric.unit === "%" ? "%" : " pts";
  const drivers = mips ? mipsCategories.map(row => ({
    id: row.id, label: row.label, value: row.current + " / 100",
    detail: (row.current * row.weight / 100).toFixed(1) + " → " + (row.forecast * row.weight / 100).toFixed(1) + " final-score points · " + row.weight + "% weight",
    action: row.action,
  })) : model ? [
    { id: "quality", label: "Quality", value: offTarget + " off target", detail: models.length + " published measures · " + (model === "cms-team" ? teamReconciliation().cqs.toFixed(1) + " sample CQS" : "Heart failure and low back pain"), action: "Review measure trends, targets and provider performance." },
    { id: "cost", label: "Cost", value: cost!.average.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) + " / episode", detail: cost!.betterRate.toFixed(1) + "% of episodes below target · " + cost!.count + " sample episodes", action: "Review expense against target by episode type, facility and provider." },
    ...(model === "ambulatory-specialty-model" ? [
      { id: "ia", label: "Improvement Activities", value: "2 activities", detail: "Preparation · Evidence review", action: "Review primary-care connections, social-needs screening and collaborative care agreements." },
      { id: "pi", label: "Promoting Interoperability", value: "Readiness review", detail: "Preparation · CEHRT and reporting", action: "Confirm CEHRT, data exchange, reporting measures and attestations." },
    ] : [
      { id: "providers", label: "Provider performance", value: "4 providers", detail: "Readmissions · Safety · PRO", action: "Inspect provider variation and the related episode worklist." },
      { id: "transitions", label: "Care transitions", value: "412 reviews", detail: "Modeled discharge review queue", action: "Review discharge follow-up and post-acute utilization." },
    ]),
  ] : [
    { id: "quality", label: "Quality", value: offTarget + " off target", detail: results.length + " measures with modeled results", action: "Prioritize measures by target gap and review population." },
    { id: "priority", label: obligation.id === "ma-stars" ? "Medication adherence" : obligation.id === "hospital-quality" ? "Patient safety" : "Follow-up", value: obligation.id === "ma-stars" ? "1,240 members" : obligation.id === "hospital-quality" ? "86 reviews" : "940 members", detail: obligation.id === "ma-stars" ? "Diabetes refill outreach" : obligation.id === "hospital-quality" ? "Hypoglycemia review queue" : "Mental-health ED follow-up", action: "Open the corresponding measure and review the highest-priority records." },
    { id: "evidence", label: "Program attainment", value: obligation.forecast.current + suffix, detail: metric.label, action: "Review overall attainment and the supporting measure evidence." },
    { id: "operations", label: "Operational work", value: obligation.workItems.length + " queues", detail: obligation.deadline, action: obligation.workItems[0]?.title ?? "Review program work." },
  ];
  const active = drivers.find(row => row.id === selectedDriver);
  return <section aria-label="Program performance overview" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold text-slate-900">Program performance</h3><span className="text-xs text-slate-500">Modeled performance · Internal targets</span></div>
    <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(220px,.7fr)_minmax(0,1.3fr)]">
      <div><p className="text-xs font-semibold text-slate-600">{metric.label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{Number(current.toFixed(1))}{suffix}<span className="ml-2 text-sm font-normal text-slate-500">current</span></p><p className="mt-2 text-sm text-[#176b75]">{Number(forecast.toFixed(1))}{suffix} forecast <span className="text-slate-500">· {obligation.forecast.target}{suffix} internal target</span></p><p className="mt-2 text-xs text-slate-500">{obligation.scope}</p></div>
      {scenario ? <div><div className="grid grid-cols-3 gap-3 text-xs"><div><p className="text-slate-500">{mips ? "Projected payment adjustment" : "Projected settlement"}</p><p className="mt-1 text-lg font-bold text-slate-900">{signedMoney(scenario.projected)}</p></div><div><p className="text-slate-500">With actions</p><p className="mt-1 text-lg font-bold text-[#176b75]">{signedMoney(scenario.withActions)}</p></div><div><p className="text-slate-500">Improvement</p><p className="mt-1 text-lg font-bold text-[#176b75]">{signedMoney(improvement(scenario))}</p></div></div><FinancialEnvelope scenario={scenario} compact /><p className="mt-2 text-[10px] text-slate-500">{mips ? "PY 2026 · Payment year 2028 · Illustrative dollars" : "Annual scenario"} · ● Projected · ◇ With actions · │ $0{model === "cms-team" ? " · Episode analytics below are a separate sample, not this annual projection." : ""}</p></div> : <div className="rounded-lg bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-700">Financial outlook not modeled</p><p className="mt-2 text-xs text-slate-500">Track quality, cost, improvement activities and interoperability readiness for the 2027 scenario.</p></div>}
    </div>
    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 xl:grid-cols-4">{drivers.map(row => <button key={row.id} type="button" aria-pressed={selectedDriver === row.id} onClick={() => { setSelectedDriver(row.id); if (row.id === "quality") onQuality(); else if (row.id === "priority") onQuality(obligation.id === "ma-stars" ? "stars-D08" : obligation.id === "hospital-quality" ? "hospital-hypoglycemia" : "adult-FUM-AD"); else if (model && (row.id === "cost" || row.id === "providers" || row.id === "transitions")) onModelSection?.(row.id === "cost" ? "cost" : "quality"); }} className={"rounded-lg border p-3 text-left hover:border-[#28737a] " + (selectedDriver === row.id ? "border-[#28737a] bg-[#f0f7f5]" : "border-slate-200 bg-slate-50")}><p className="text-xs font-semibold text-slate-700">{row.label} →</p><p className="mt-2 text-lg font-bold text-slate-900">{row.value}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{row.detail}</p></button>)}</div>
    {active && <div role="region" aria-label={active.label + " actions"} className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f0f7f5] p-3"><p className="text-xs text-slate-700">{active.action}</p><div className="flex gap-3">{!mips && active.id !== "quality" && onWorklist && <button type="button" onClick={onWorklist} className="text-xs font-semibold text-[#176b75]">Open worklist →</button>}{onReporting && <button type="button" onClick={onReporting} className="text-xs font-semibold text-[#176b75]">Open MIPS dashboard →</button>}{!model && <button type="button" onClick={() => onQuality()} className="text-xs font-semibold text-[#176b75]">Review measures →</button>}</div></div>}
    {mips && active && active.id !== "quality" && <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[650px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Driver</th><th className="p-3">Current / internal target</th><th className="p-3">Next work</th></tr></thead><tbody className="divide-y divide-slate-100">{(active.id === "cost" ? [
      ["Total Per Capita Cost", "$12,840 / $12,300 per beneficiary", "Review primary-care attribution and utilization."],
      ["MSPB – Clinician", "$22,480 / $21,900 per episode", "Review inpatient and post-acute cost variation."],
      ["Episode cost variation", "3 groups above internal target", "Review specialist and procedure-level variation."],
    ] : active.id === "pi" ? [
      ["Health information exchange", "86% / 90%", "Reconcile missing transition and referral exchanges."],
      ["Patient electronic access", "94% / 95%", "Validate access evidence and missing encounters."],
      ["Required attestations", "8 / 9 groups complete", "Review the outstanding group’s attestations."],
    ] : [
      ["Activity evidence", "8 / 9 groups complete", "Collect outstanding evidence and validate performance periods."],
      ["Group attestations", "7 / 9 groups ready", "Confirm owners and complete attestation review."],
    ]).map(([label, value, action]) => <tr key={label}><td className="p-3 font-semibold text-slate-800">{label}</td><td className="p-3 tabular-nums">{value}</td><td className="p-3 text-slate-600">{action}</td></tr>)}</tbody></table><p className="border-t border-slate-100 p-3 text-[11px] text-slate-500">Illustrative operational drivers and internal targets; not a reconstruction of CMS category scoring.</p></div>}
    {mips && <p className="mt-3 text-[11px] text-slate-500">Category contributions reconcile to {mipsScore("current")} current and {mipsScore("forecast")} forecast points. <a href={mipsScoringSource} target="_blank" rel="noreferrer" className="underline">Standard 2026 weights ↗</a>; exceptions and reweighting depend on eligibility. Quality results below are examples, not a CMS decile-score calculation. <a href="https://qpp.cms.gov/scoring-payment/payment" target="_blank" rel="noreferrer" className="underline">CMS neutral threshold: 75 points ↗</a>; 85 is the internal target. Positive payment amounts depend on budget neutrality and are illustrative.</p>}
  </section>;
}
