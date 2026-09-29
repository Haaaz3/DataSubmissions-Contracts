"use client";

import { useMemo, useState } from "react";
import { mockContractAgreements } from "@/lib/mockData";
import type { Contract, ContractType } from "@/types/contract";
import type { HdiObligation } from "@/data/synthetic/healthIntelligenceObligations";

const money = (value: number, digits = 1) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `${value < 0 ? "-" : ""}$${(value / 1_000_000).toFixed(digits)}M`;
  if (absolute >= 1_000) return `${value < 0 ? "-" : ""}$${Math.round(value / 1_000)}K`;
  return `${value < 0 ? "-" : ""}$${Math.round(value)}`;
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

function MiniTrend({ values, color = "#526ee8" }: { values: number[]; color?: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => `${index * 18 + 2},${32 - ((value - min) / range) * 24}`).join(" ");
  return <svg viewBox="0 0 92 38" className="h-9 w-[92px]" role="img" aria-label="Six month trend"><line x1="2" x2="90" y1="32" y2="32" stroke="#e9edf4" /><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="90" cy={32 - ((values.at(-1)! - min) / range) * 24} r="3" fill={color} /></svg>;
}

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
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">Portfolio performance</p><h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">PMPM trajectory across all payer contracts</h3><p className="mt-1 text-xs text-slate-500">Weighted monthly PMPM against the portfolio target baseline.</p></div><div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#526ee8]" />Current PMPM</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#10a77a]" />Target</span></div></div>
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

function DistributionBars({ contracts, mode }: { contracts: Contract[]; mode: "expense" | "value" | "lives" }) {
  const byPayor = Array.from(new Set(contracts.map((contract) => contract.payor))).map((payor) => {
    const rows = contracts.filter((contract) => contract.payor === payor);
    const lives = rows.reduce((sum, contract) => sum + contract.attributedLives, 0);
    const expense = rows.reduce((sum, contract) => sum + contract.currentPmpm * contract.attributedLives * 12, 0);
    const target = rows.reduce((sum, contract) => sum + contract.targetPmpm * contract.attributedLives * 12, 0);
    return { payor, lives, expense, target, value: Math.max(0, (expense - target) * 0.42) };
  }).sort((a, b) => (mode === "lives" ? b.lives - a.lives : mode === "expense" ? b.expense - a.expense : b.value - a.value));
  const max = Math.max(...byPayor.map((item) => mode === "lives" ? item.lives : mode === "expense" ? item.expense : item.value), 1);
  const palette = mode === "lives" ? "from-[#6a8cf3] to-[#4d4de5]" : mode === "value" ? "from-[#39c99b] to-[#087b5b]" : "from-[#ffd45c] to-[#f36b13]";
  const title = mode === "lives" ? "Lives by payer" : mode === "value" ? "Captured value by payer" : "Expense by payer";
  const subtitle = mode === "lives" ? "Attributed lives and portfolio share" : mode === "value" ? "Value positioned from PMPM performance" : "Annualized current spend versus target";
  return <div className="rounded-2xl border border-[#e2e7ee] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-bold text-slate-900">{title}</h3><p className="mt-1 text-[11px] text-slate-500">{subtitle}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${mode === "lives" ? "bg-indigo-50 text-indigo-700" : mode === "value" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{byPayor.length} payers</span></div><div className="mt-4 space-y-3">{byPayor.slice(0, 6).map((item) => { const value = mode === "lives" ? item.lives : mode === "expense" ? item.expense : item.value; return <div key={item.payor}><div className="flex items-center justify-between gap-2 text-xs"><span className="font-semibold text-slate-700">{item.payor}</span><span className="font-bold text-slate-900">{mode === "lives" ? `${(value / 1000).toFixed(1)}K` : money(value)}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full bg-gradient-to-r ${palette}`} style={{ width: `${Math.max(5, (value / max) * 100)}%` }} /></div><p className="mt-1 text-[10px] text-slate-400">{mode === "lives" ? `${Math.round((item.lives / Math.max(1, contracts.reduce((sum, contract) => sum + contract.attributedLives, 0))) * 100)}% of lives` : `${Math.round((value / max) * 100)}% of top payer`}</p></div>; })}</div></div>;
}

function ContractMix({ contracts }: { contracts: Contract[] }) {
  const groups = (Object.keys(typeColor) as ContractType[]).map((type) => ({ type, count: contracts.filter((contract) => contract.contractType === type).length, lives: contracts.filter((contract) => contract.contractType === type).reduce((sum, contract) => sum + contract.attributedLives, 0) }));
  const total = groups.reduce((sum, group) => sum + group.lives, 0);
  let start = 0;
  const segments = groups.map((group) => { const end = start + (group.lives / Math.max(1, total)) * 100; const segment = `${typeColor[group.type]} ${start}% ${end}%`; start = end; return segment; }).join(", ");
  return <div className="rounded-2xl border border-[#e2e7ee] bg-white p-4 shadow-sm"><h3 className="text-sm font-bold text-slate-900">Contract model mix</h3><p className="mt-1 text-[11px] text-slate-500">Attributed lives across value-based models</p><div className="mt-4 flex items-center gap-4"><div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${segments})` }}><div className="absolute inset-4 flex items-center justify-center rounded-full bg-white text-center"><div><p className="text-lg font-bold text-slate-900">{(total / 1000).toFixed(1)}K</p><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">lives</p></div></div></div><div className="min-w-0 flex-1 space-y-2">{groups.map((group) => <div key={group.type} className="flex items-center gap-2 text-[11px]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: typeColor[group.type] }} /><span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{contractTypeLabel[group.type]}</span><span className="font-bold text-slate-900">{Math.round((group.lives / Math.max(1, total)) * 100)}%</span></div>)}</div></div><div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">{groups.map((group) => <div key={group.type}><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{contractTypeLabel[group.type]}</p><p className="mt-1 text-xs font-bold text-slate-800">{group.count} contracts</p></div>)}</div></div>;
}

function DomainGroups({ contracts, totalValue, remainingOpportunity }: { contracts: Contract[]; totalValue: number; remainingOpportunity: number }) {
  const quality = Math.round(contracts.reduce((sum, contract) => sum + contract.qualityScore * contract.attributedLives, 0) / Math.max(1, contracts.reduce((sum, contract) => sum + contract.attributedLives, 0)));
  const expenseContracts = contracts.filter((contract) => contract.currentPmpm > contract.targetPmpm);
  const expenseScore = Math.round((1 - expenseContracts.reduce((sum, contract) => sum + Math.max(0, contract.currentPmpm - contract.targetPmpm) * contract.attributedLives, 0) / Math.max(1, contracts.reduce((sum, contract) => sum + contract.targetPmpm * contract.attributedLives, 0))) * 100);
  return <section className="rounded-2xl border border-[#e2e7ee] bg-white p-5 shadow-sm"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">Portfolio domain groups</p><h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Quality and expense performance</h3><p className="mt-1 text-xs text-slate-500">A compact view of the domains that determine contract value capture.</p></div><div className="mt-4 grid gap-3 lg:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-[#fbfcfe] p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">Quality group</p><p className="mt-1 text-xs text-slate-500">Quality of care · experience · risk adjustment · documentation</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{quality}% score</span></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Achieved</p><p className="mt-1 text-base font-bold text-emerald-700">{money(totalValue * 0.54)}</p><p className="mt-1 text-[10px] text-slate-500">54% captured</p></div><div className="rounded-lg bg-[#eef2ff] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Budgeted</p><p className="mt-1 text-base font-bold text-indigo-700">{money(totalValue)}</p><p className="mt-1 text-[10px] text-indigo-500">Portfolio value</p></div><div className="rounded-lg bg-[#fff7e8] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Open</p><p className="mt-1 text-base font-bold text-amber-700">{money(remainingOpportunity * 0.56)}</p><p className="mt-1 text-[10px] text-amber-600">Quality-linked</p></div></div></div><div className="rounded-xl border border-slate-200 bg-[#fbfcfe] p-4"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">Expense group</p><p className="mt-1 text-xs text-slate-500">Utilization efficiency · cost management</p></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">{Math.max(0, expenseScore)}% on target</span></div><div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-lg bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Achieved</p><p className="mt-1 text-base font-bold text-emerald-700">{money(totalValue * 0.46)}</p><p className="mt-1 text-[10px] text-slate-500">46% captured</p></div><div className="rounded-lg bg-[#eef2ff] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Budgeted</p><p className="mt-1 text-base font-bold text-indigo-700">{money(totalValue * 0.82)}</p><p className="mt-1 text-[10px] text-indigo-500">Expense opportunity</p></div><div className="rounded-lg bg-[#fff7e8] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Open</p><p className="mt-1 text-base font-bold text-amber-700">{money(remainingOpportunity * 0.44)}</p><p className="mt-1 text-[10px] text-amber-600">Utilization-linked</p></div></div></div></div></section>;
}

function ContractRow({ contract, onOpenContract, onOpenPatientWorklist }: { contract: Contract; onOpenContract: (id: string) => void; onOpenPatientWorklist: (measure: string) => void }) {
  const variance = contract.currentPmpm - contract.targetPmpm;
  const annualVariance = Math.max(0, variance * contract.attributedLives * 12);
  const first = contract.trend[0]?.pmpm ?? contract.currentPmpm;
  const trend = contract.currentPmpm - first;
  const topOpportunity = contract.opportunities[0];
  return <div className="grid min-w-[1060px] grid-cols-[minmax(220px,1.45fr)_100px_110px_110px_110px_120px_122px] items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-[#fbfcfe]"><div className="min-w-0"><button type="button" onClick={() => onOpenContract(contract.id)} className="block max-w-full truncate text-left text-xs font-bold text-[#176b75] hover:underline">{contract.name} ↗</button><p className="mt-1 truncate text-[10px] text-slate-500">{contract.payor} · {contract.market ?? contract.region ?? "Enterprise"} · <span className="font-semibold" style={{ color: typeColor[contract.contractType] }}>{contractTypeLabel[contract.contractType]}</span></p></div><div><p className="text-xs font-bold text-slate-900">{number(contract.attributedLives)}</p><p className="text-[10px] text-slate-400">lives</p></div><div><p className={`text-xs font-bold ${variance > 0 ? "text-amber-700" : "text-emerald-700"}`}>${contract.currentPmpm}</p><p className="text-[10px] text-slate-400">current PMPM</p></div><div><p className="text-xs font-bold text-slate-700">${contract.targetPmpm}</p><p className="text-[10px] text-slate-400">target</p></div><div><p className={`text-xs font-bold ${variance > 0 ? "text-amber-700" : "text-emerald-700"}`}>{variance > 0 ? "+" : "−"}${Math.abs(variance)}</p><p className="text-[10px] text-slate-400">{trend > 0 ? `↑ $${trend} trend` : trend < 0 ? `↓ $${Math.abs(trend)} trend` : "flat trend"}</p></div><div><p className="text-xs font-bold text-slate-900">{contract.qualityScore}%</p><p className="text-[10px] text-slate-400">quality score</p></div><div className="flex items-center justify-between gap-2"><MiniTrend values={contract.trend.map((item) => item.pmpm)} color={variance > 0 ? "#e39a22" : "#10a77a"} /><button type="button" onClick={() => onOpenPatientWorklist(topOpportunity?.title ?? "Contract performance") } className="whitespace-nowrap rounded-lg bg-[#285954] px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-[#1f4b47]">Worklist</button></div><span className="sr-only">{money(annualVariance)} annualized variance</span></div>;
}

export default function VbcContractPortfolio({ obligation, onBack, onOpenPatientWorklist, onOpenContract }: { obligation: HdiObligation; onBack: () => void; onOpenPatientWorklist: (measure: string) => void; onOpenContract: (contractId: string) => void }) {
  const [filter, setFilter] = useState<"all" | "risk" | "quality">("all");
  const contracts = useMemo(() => mockContractAgreements.flatMap((agreement) => agreement.contracts), []);
  const visibleContracts = useMemo(() => {
    const filtered = filter === "risk" ? contracts.filter((contract) => contract.currentPmpm > contract.targetPmpm) : filter === "quality" ? contracts.filter((contract) => contract.qualityScore < 75) : contracts;
    return [...filtered].sort((a, b) => (b.currentPmpm - b.targetPmpm) * b.attributedLives - (a.currentPmpm - a.targetPmpm) * a.attributedLives);
  }, [contracts, filter]);
  const totalLives = contracts.reduce((sum, contract) => sum + contract.attributedLives, 0);
  const annualSpend = contracts.reduce((sum, contract) => sum + contract.currentPmpm * contract.attributedLives * 12, 0);
  const targetSpend = contracts.reduce((sum, contract) => sum + contract.targetPmpm * contract.attributedLives * 12, 0);
  const remainingOpportunity = Math.max(0, annualSpend - targetSpend);
  const earnedValue = Math.max(0, remainingOpportunity * 0.42);
  const quality = Math.round(contracts.reduce((sum, contract) => sum + contract.qualityScore * contract.attributedLives, 0) / Math.max(1, totalLives));
  const atRiskCount = contracts.filter((contract) => contract.status !== "On Track").length;

  return <section className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">VBC contract portfolio</p><div className="mt-1 flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">All payer contracts</h2><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">VBCA</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{contracts.length} contracts</span></div><p className="mt-1 text-xs text-slate-500">{obligation.sponsor} · {number(totalLives)} attributed lives · {obligation.deadline} performance year</p></div><button type="button" onClick={onBack} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">← Back to portfolio</button></div>

    <section className="rounded-2xl border border-[#e2e7ee] bg-white p-4 shadow-sm"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><div className="rounded-xl bg-[#f8fafc] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Lives</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{number(totalLives)}</p><p className="mt-1 text-[10px] text-slate-500">Across {contracts.length} active contracts</p></div><div className="rounded-xl bg-[#e8f7f0] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-[#087b5b]">Current earned VBC value</p><p className="mt-1 text-2xl font-bold tracking-tight text-[#087b5b]">{money(earnedValue)}</p><p className="mt-1 text-[10px] text-emerald-700">Net value positioned</p></div><div className="rounded-xl bg-[#eef2ff] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">Budgeted opportunity</p><p className="mt-1 text-2xl font-bold tracking-tight text-indigo-700">{money(remainingOpportunity)}</p><p className="mt-1 text-[10px] text-indigo-600">PMPM gap to target</p></div><div className="rounded-xl bg-[#fff7e8] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Remaining opportunity</p><p className="mt-1 text-2xl font-bold tracking-tight text-amber-700">{money(Math.max(0, remainingOpportunity - earnedValue))}</p><p className="mt-1 text-[10px] text-amber-700">Open value to capture</p></div><div className="rounded-xl bg-[#fff4f1] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-red-700">Contracts needing attention</p><p className="mt-1 text-2xl font-bold tracking-tight text-red-700">{atRiskCount}</p><p className="mt-1 text-[10px] text-red-600">{quality}% weighted quality score</p></div></div></section>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"><TrendChart contracts={contracts} /><ContractMix contracts={contracts} /></div>
    <section><div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">Portfolio distribution</p><h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Where lives, expense, and captured value sit</h3></div><span className="text-[11px] font-semibold text-slate-500">Click a payer bar or contract for detail</span></div><div className="grid gap-4 lg:grid-cols-3"><DistributionBars contracts={contracts} mode="expense" /><DistributionBars contracts={contracts} mode="value" /><DistributionBars contracts={contracts} mode="lives" /></div></section>
    <DomainGroups contracts={contracts} totalValue={Math.max(remainingOpportunity, obligation.atRiskDollars)} remainingOpportunity={Math.max(remainingOpportunity, obligation.recoverableDollars)} />

    <section className="overflow-hidden rounded-2xl border border-[#e2e7ee] bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">Contract scorecard</p><h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Payer contracts ranked by performance exposure</h3><p className="mt-1 text-xs text-slate-500">Open a contract for its full scorecard, financial reconciliation, and population insights.</p></div><div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 text-[10px] font-bold"><button type="button" onClick={() => setFilter("all")} className={`rounded-md px-2.5 py-1.5 ${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>All {contracts.length}</button><button type="button" onClick={() => setFilter("risk")} className={`rounded-md px-2.5 py-1.5 ${filter === "risk" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500"}`}>Above target</button><button type="button" onClick={() => setFilter("quality")} className={`rounded-md px-2.5 py-1.5 ${filter === "quality" ? "bg-white text-red-700 shadow-sm" : "text-slate-500"}`}>Quality gap</button></div></div><div className="overflow-x-auto"><div className="min-w-[1060px]"><div className="grid grid-cols-[minmax(220px,1.45fr)_100px_110px_110px_110px_120px_122px] gap-3 border-b border-slate-100 bg-[#fbfcfe] px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400"><span>Contract / payer</span><span>Lives</span><span>Current</span><span>Target</span><span>Variance</span><span>Quality</span><span>Trend / action</span></div>{visibleContracts.map((contract) => <ContractRow key={contract.id} contract={contract} onOpenContract={onOpenContract} onOpenPatientWorklist={onOpenPatientWorklist} />)}</div></div><div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-[#fbfcfe] px-4 py-3 text-[11px] text-slate-500"><span>Showing {visibleContracts.length} of {contracts.length} contracts · HDI-native payer portfolio</span><span className="font-semibold text-[#176b75]">Select a contract for the HDI scorecard →</span></div></section>
  </section>;
}
