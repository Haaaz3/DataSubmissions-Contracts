"use client";

import { useMemo, useState } from "react";
import PayerComparison from "./PayerComparison";
import VbcFinancialSummary from "./VbcFinancialSummary";
import { contractFinancials, costAmount, costUnitLabel, vbcFinancialSummary, type CostUnit } from "@/lib/contracts/vbcFinancials";
import { signedMoney } from "@/lib/health-intelligence/financialEnvelope";
import { mockContractAgreements } from "@/lib/mockData";
import type { Contract, ContractType } from "@/types/contract";
import type { HdiObligation } from "@/data/synthetic/healthIntelligenceObligations";

const money = (value: number, digits = 1) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `${value < 0 ? "-" : ""}$${(absolute / 1_000_000).toFixed(digits)}M`;
  if (absolute >= 1_000) return `${value < 0 ? "-" : ""}$${Math.round(absolute / 1_000)}K`;
  return `${value < 0 ? "-" : ""}$${Math.round(absolute)}`;
};

const number = (value: number) => value.toLocaleString("en-US");

const typeColor: Record<ContractType, string> = {
  MSSP: "#4f46e5",
  "Medicare Advantage": "#0ea5a4",
  Commercial: "#f59e0b",
};

const contractTypeLabel: Record<ContractType, string> = {
  MSSP: "MSSP",
  "Medicare Advantage": "MA",
  Commercial: "Commercial",
};

function TrendChart({ contracts }: { contracts: Contract[] }) {
  const width = 760;
  const height = 220;
  const months = contracts[0]?.trend.map((item) => item.month.replace(" 20", " '")) ?? [];
  const current = contracts[0]?.trend.map((_, index) => {
    const lives = contracts.reduce((sum, contract) => sum + contract.attributedLives, 0);
    return contracts.reduce((sum, contract) => sum + (contract.trend[index]?.pmpm ?? contract.currentPmpm) * contract.attributedLives, 0) / Math.max(1, lives);
  }) ?? [];
  const target = contracts.reduce((sum, contract) => sum + contract.targetPmpm * contract.attributedLives, 0) / Math.max(1, contracts.reduce((sum, contract) => sum + contract.attributedLives, 0));
  const all = [...current, target];
  const min = Math.min(...all) - 8;
  const max = Math.max(...all) + 8;
  const x = (index: number) => 48 + (index / Math.max(1, current.length - 1)) * (width - 82);
  const y = (value: number) => height - 34 - ((value - min) / Math.max(1, max - min)) * (height - 72);
  const currentPoints = current.map((value, index) => `${x(index)},${y(value)}`).join(" ");
  return <div className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">Portfolio performance</p><h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Medical expense trend · PMPM</h3><p className="mt-1 text-xs text-slate-500">Weighted monthly PMPM against the portfolio target baseline.</p></div><div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#526ee8]" />Current PMPM</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#10a77a]" />Target</span></div></div>
    <svg className="mt-3 h-56 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Portfolio PMPM trend">
      {[0, 1, 2, 3].map((index) => { const lineY = 24 + index * 47; const value = max - ((max - min) * index) / 3; return <g key={index}><line x1="48" x2={width - 34} y1={lineY} y2={lineY} stroke="#e8edf3" strokeDasharray="4 5" /><text x="4" y={lineY + 4} fill="#94a3b8" fontSize="10">${Math.round(value)}</text></g>; })}
      <line x1="48" x2={width - 34} y1={y(target)} y2={y(target)} stroke="#10a77a" strokeDasharray="5 4" strokeWidth="1.5" />
      <polyline points={currentPoints} fill="none" stroke="#526ee8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {current.map((value, index) => <circle key={`${value}-${index}`} cx={x(index)} cy={y(value)} r={index === current.length - 1 ? 5 : 3.5} fill="#526ee8" stroke="white" strokeWidth="1.5" />)}
      {months.map((month, index) => <text key={month} x={x(index)} y={height - 10} textAnchor="middle" fill="#94a3b8" fontSize="10">{month}</text>)}
      <text x={width - 90} y={y(target) - 7} fill="#07845f" fontSize="10" fontWeight="700">Target ${Math.round(target)}</text>
      <text x={width - 90} y={y(current.at(-1) ?? target) - 8} fill="#526ee8" fontSize="10" fontWeight="700">Current ${Math.round(current.at(-1) ?? target)}</text>
    </svg>
    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center"><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Current PMPM</p><p className="mt-1 text-sm font-bold text-slate-900">${Math.round(current.at(-1) ?? 0)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Target PMPM</p><p className="mt-1 text-sm font-bold text-emerald-700">${Math.round(target)}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Variance</p><p className={`mt-1 text-sm font-bold ${(current.at(-1) ?? 0) > target ? "text-amber-700" : "text-emerald-700"}`}>{(current.at(-1) ?? 0) > target ? "+" : "−"}${Math.round(Math.abs((current.at(-1) ?? 0) - target))}</p></div></div>
  </div>;
}

function ContractMix({ contracts }: { contracts: Contract[] }) {
  const groups = (Object.keys(typeColor) as ContractType[]).map((type) => ({ type, count: contracts.filter((contract) => contract.contractType === type).length, lives: contracts.filter((contract) => contract.contractType === type).reduce((sum, contract) => sum + contract.attributedLives, 0) }));
  const total = groups.reduce((sum, group) => sum + group.lives, 0);
  let start = 0;
  const segments = groups.map((group) => { const end = start + (group.lives / Math.max(1, total)) * 100; const segment = `${typeColor[group.type]} ${start}% ${end}%`; start = end; return segment; }).join(", ");
  return <div className="rounded-2xl border border-[#e2e7ee] bg-white p-4 shadow-sm"><h3 className="text-sm font-bold text-slate-900">Line of business</h3><p className="mt-1 text-[11px] text-slate-500">Attributed lives across value-based models</p><div className="mt-4 flex items-center gap-4"><div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${segments})` }}><div className="absolute inset-4 flex items-center justify-center rounded-full bg-white text-center"><div><p className="text-lg font-bold text-slate-900">{(total / 1000).toFixed(1)}K</p><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">lives</p></div></div></div><div className="min-w-0 flex-1 space-y-2">{groups.map((group) => <div key={group.type} className="flex items-center gap-2 text-[11px]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: typeColor[group.type] }} /><span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{contractTypeLabel[group.type]}</span><span className="font-bold text-slate-900">{Math.round((group.lives / Math.max(1, total)) * 100)}%</span></div>)}</div></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">{groups.map((group) => <div key={group.type}><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{contractTypeLabel[group.type]}</p><p className="mt-1 text-xs font-bold text-slate-800">{group.count} contracts</p></div>)}</div></div>;
}

function ContractRow({ contract, unit, onOpenContract, onOpenPatientWorklist }: { contract: Contract; unit: CostUnit; onOpenContract: (id: string) => void; onOpenPatientWorklist: (measure: string) => void }) {
  const financials = contractFinancials(contract);
  const cost = (value: number) => unit === "annual" ? money(value) : costAmount(value, financials.memberMonths, unit).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  return <tr className="border-b border-slate-100 text-xs last:border-0 hover:bg-slate-50">
    <td className="px-4 py-4"><button type="button" onClick={() => onOpenContract(contract.id)} className="text-left font-bold text-[#176b75] hover:underline">{contract.name} ↗</button><p className="mt-1 text-[10px] text-slate-500">{contract.payor} · {contractTypeLabel[contract.contractType]}</p><p className={"mt-1 text-[10px] " + (financials.current.qualityPassed ? "text-emerald-700" : "text-amber-700")}>Quality gate {financials.current.qualityPassed ? "met" : "not met"} · {contract.qualityScore} / {financials.current.terms.qualityGate} minimum</p></td>
    <td className="px-4 py-4 tabular-nums">{number(contract.attributedLives)}</td>
    <td className="px-4 py-4 font-semibold tabular-nums">{cost(financials.current.actualSpend)}</td>
    <td className="px-4 py-4 tabular-nums">{cost(financials.current.benchmarkSpend)}</td>
    <td className={"px-4 py-4 font-bold tabular-nums " + (financials.projected < 0 ? "text-[#ad5235]" : "text-[#16816e]")}>{signedMoney(financials.projected)}<p className="mt-1 text-[10px] font-normal text-slate-500">{financials.current.status.replaceAll("_", " ")}</p></td>
    <td className="px-4 py-4 font-bold tabular-nums text-[#176b75]">{signedMoney(financials.improvement)}<p className="mt-1 text-[10px] font-normal text-slate-500">{signedMoney(financials.withActions)} with actions</p></td>
    <td className="px-4 py-4"><button type="button" onClick={() => onOpenPatientWorklist(contract.opportunities[0]?.title ?? "Contract performance")} className="text-xs font-semibold text-[#176b75] hover:underline">Worklist →</button></td>
  </tr>;
}

export default function VbcContractPortfolio({ obligation, onBack, onOpenPatientWorklist, onOpenContract }: { obligation: HdiObligation; onBack: () => void; onOpenPatientWorklist: (measure: string) => void; onOpenContract: (contractId: string) => void }) {
  const [payer, setPayer] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "risk" | "quality">("all");
  const [unit, setUnit] = useState<CostUnit>("pmpm");
  const contracts = useMemo(() => mockContractAgreements.flatMap(agreement => agreement.contracts), []);
  const totals = useMemo(() => vbcFinancialSummary(contracts), [contracts]);
  const visibleContracts = useMemo(() => contracts.filter(contract => {
    const financials = contractFinancials(contract);
    return (!payer || contract.payor === payer) && (filter === "all" || (filter === "risk" ? financials.projected < 0 : !financials.current.qualityPassed));
  }).sort((a, b) => contractFinancials(b).improvement - contractFinancials(a).improvement), [contracts, filter, payer]);
  return <section className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-bold text-slate-900">Payer contracts</h2><p className="mt-1 text-xs text-slate-500">{obligation.sponsor} · {contracts.length} contracts · {number(totals.lives)} attributed members · PY {totals.year}</p></div><button type="button" onClick={onBack} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">← Back to portfolio</button></div>
    <VbcFinancialSummary contracts={contracts} unit={unit} onUnitChange={setUnit} />
    <PayerComparison contracts={contracts} unit={unit} onSelectPayer={selected => { setPayer(selected); setFilter("all"); document.getElementById("vbc-contract-scorecard")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
    <section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-base font-bold text-slate-900">Settlement drivers</h3><div className="mt-3 grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-semibold text-slate-600">Medical expense reduction</p><p className="mt-1 text-xl font-bold text-[#176b75]">{signedMoney(totals.costImprovement)} settlement improvement</p><p className="mt-1 text-xs text-slate-500">{money(totals.grossMedicalExpenseReduction)} less medical expense before sharing.</p></div><div><p className="text-xs font-semibold text-slate-600">Quality gate improvement</p><p className="mt-1 text-xl font-bold text-[#176b75]">{signedMoney(totals.qualityImprovement)} additional settlement</p><p className="mt-1 text-xs text-slate-500">{totals.qualityPassed} of {totals.count} contracts meet their gate now; {totals.actionQualityPassed} with actions.</p></div></div><p className="mt-3 text-[11px] text-slate-500">Cost changes are applied first, then quality. Both contributions sum to the modeled settlement improvement.</p></section>
    <section id="vbc-contract-scorecard" className="scroll-mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div><h3 className="text-lg font-bold text-slate-900">{payer ? payer + " contracts" : "Contract performance"}</h3><p className="mt-1 text-xs text-slate-500">Ranked by settlement improvement · Open a contract for terms and calculation.</p>{payer && <button type="button" onClick={() => setPayer(null)} className="mt-2 text-xs font-semibold text-[#176b75] underline">Clear payer filter</button>}</div><div className="flex gap-1 rounded-lg bg-slate-100 p-1">{([["all", "All"], ["risk", "Projected loss"], ["quality", "Quality gate not met"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={"rounded-md px-2.5 py-1.5 text-[11px] font-semibold " + (filter === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>{label}</button>)}</div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1100px] table-fixed text-left"><thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="w-[26%] px-4 py-3">Contract / quality gate</th><th className="w-[9%] px-4 py-3">Members</th><th className="w-[13%] px-4 py-3">Expense · {costUnitLabel[unit]}</th><th className="w-[13%] px-4 py-3">Benchmark · {costUnitLabel[unit]}</th><th className="w-[14%] px-4 py-3">Annual settlement</th><th className="w-[16%] px-4 py-3">Improvement</th><th className="w-[9%] px-4 py-3">Action</th></tr></thead><tbody>{visibleContracts.map(contract => <ContractRow key={contract.id} contract={contract} unit={unit} onOpenContract={onOpenContract} onOpenPatientWorklist={onOpenPatientWorklist} />)}{!visibleContracts.length && <tr><td colSpan={7} className="p-5 text-sm text-slate-500">No contracts match these filters.</td></tr>}</tbody></table></div>
      <p className="border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500">{visibleContracts.length} contracts shown · Member counts reflect contract attribution, not unique patients across obligations.</p>
    </section>
    <details className="rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer text-sm font-semibold text-[#176b75]">PMPM trend and membership mix</summary><div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"><TrendChart contracts={contracts} /><ContractMix contracts={contracts} /></div></details>
  </section>;
}
