"use client";

import { useMemo, useState } from "react";
import type { Contract } from "@/types/contract";
import { costAmount, costUnitLabel, vbcFinancialSummary, type CostUnit } from "@/lib/contracts/vbcFinancials";
import { portfolioMoney } from "@/lib/health-intelligence/portfolioSummary";
import FinancialEnvelope from "./FinancialEnvelope";

export default function PayerComparison({ contracts, onSelectPayer, unit = "pmpm" }: {
  contracts: Contract[]; onSelectPayer: (payer: string) => void; unit?: CostUnit;
}) {
  const [sort, setSort] = useState("opportunity");
  const rows = useMemo(() => [...new Set(contracts.map(c => c.payor))].map(payer => ({ payer, ...vbcFinancialSummary(contracts.filter(c => c.payor === payer)) })), [contracts]);
  const sorted = [...rows].sort((a, b) => sort === "variance" ? (b.currentPmpm - b.benchmarkPmpm) / b.benchmarkPmpm - (a.currentPmpm - a.benchmarkPmpm) / a.benchmarkPmpm : sort === "spend" ? b.actualSpend - a.actualSpend : b.improvement - a.improvement);
  const maximum = Math.max(1, ...rows.flatMap(row => [costAmount(row.actualSpend, row.memberMonths, unit), costAmount(row.benchmarkSpend, row.memberMonths, unit)])) * 1.08;
  const financialMaximum = Math.max(1, ...rows.flatMap(row => [Math.abs(row.downside), row.upside]));
  const amount = (value: number) => unit === "annual" ? portfolioMoney(value) : value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  return <section aria-labelledby="payer-comparison-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
      <div><h3 id="payer-comparison-heading" className="text-lg font-bold text-slate-900">Payer performance</h3><p className="mt-1 text-xs text-slate-500">{rows.length} payers · Select a payer to review its contracts.</p></div>
      <label className="text-xs text-slate-600">Sort payers<select aria-label="Sort payers" value={sort} onChange={event => setSort(event.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white p-2"><option value="opportunity">Settlement improvement</option><option value="variance">Most above benchmark</option><option value="spend">Highest medical expense</option></select></label>
    </div>
    <div className="flex flex-wrap justify-between gap-3 bg-slate-50 px-5 py-3 text-[11px] text-slate-500"><span>Expense: <strong className="text-[#16816e]">green below benchmark</strong> · <strong className="text-[#ad5235]">red above benchmark</strong> · │ Benchmark</span><span>Settlement: ● Current projection · ◇ With actions · │ $0</span></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[1100px] table-fixed text-left">
      <caption className="sr-only">Medical expense and benchmark in selected units. Financial envelopes and improvement are annual provider settlements.</caption>
      <thead className="border-y border-slate-100 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="w-[17%] px-5 py-3">Payer / members</th><th className="w-[27%] px-5 py-3">Medical expense · {costUnitLabel[unit]}</th><th className="w-[18%] px-5 py-3">Expense variance</th><th className="w-[38%] px-5 py-3">Annual shared savings / (losses)</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{sorted.map(row => {
        const current = costAmount(row.actualSpend, row.memberMonths, unit);
        const benchmark = costAmount(row.benchmarkSpend, row.memberMonths, unit);
        const variance = current - benchmark;
        const percent = row.benchmarkSpend ? (row.actualSpend / row.benchmarkSpend - 1) * 100 : 0;
        const unfavorable = variance > 0;
        const gradient = unfavorable ? "linear-gradient(90deg, #f3dfc4, #bd583d)" : "linear-gradient(90deg, #d6eae1, #16816e)";
        return <tr key={row.payer} className="hover:bg-slate-50/50">
          <th scope="row" className="px-5 py-5"><button type="button" onClick={() => onSelectPayer(row.payer)} aria-label={"Show " + row.payer + " contracts"} className="text-left text-xs font-bold text-[#176b75] hover:underline">{row.payer} ↗</button><p className="mt-1 text-[11px] font-normal text-slate-500">{row.lives.toLocaleString()} members · {row.count} {row.count === 1 ? "contract" : "contracts"}</p></th>
          <td className="px-5 py-5"><div className="flex justify-between gap-2 text-xs"><strong className="text-slate-900">{amount(current)}</strong><span className="text-slate-500">{amount(benchmark)} benchmark</span></div>
            <div role="img" aria-label={row.payer + ": medical expense " + amount(current) + ", benchmark " + amount(benchmark) + " " + costUnitLabel[unit] + ". Lower is favorable. Shared scale $0 to " + amount(maximum) + "."} className="relative mt-3 h-3 rounded-sm bg-slate-100"><div className="h-full rounded-sm" style={{ width: current / maximum * 100 + "%", background: gradient }} /><span className="absolute -top-1 h-5 w-0.5 bg-slate-700" style={{ left: benchmark / maximum * 100 + "%" }} /></div>
            <p className="mt-2 text-[10px] text-slate-500">{portfolioMoney(row.actualSpend)} annual medical expense</p>
          </td>
          <td className="px-5 py-5"><p className={"text-sm font-bold " + (unfavorable ? "text-[#ad5235]" : "text-[#16816e]")}>{variance > 0 ? "+" : variance < 0 ? "−" : ""}{amount(Math.abs(variance))}</p><p className="mt-1 text-[11px] text-slate-500">{Math.abs(percent).toFixed(1)}% {unfavorable ? "above" : variance < 0 ? "below" : "at"} benchmark</p><p className="mt-1 text-[10px] text-slate-500">Expense variance ≠ settlement</p></td>
          <td className="px-5 py-5"><FinancialEnvelope scenario={row} compact axisMaximum={financialMaximum} /></td>
        </tr>;
      })}</tbody>
    </table></div>
    {!rows.length && <p className="p-5 text-sm text-slate-500">No contracts in this portfolio.</p>}
    <p className="border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500">PMPM = medical expense ÷ member months. PMPY = PMPM × 12. Medical expense is distinct from the provider’s shared savings or losses. Payer mixes differ; variance is relative to each payer’s contracted benchmark. Illustrative terms and full-year enrollment.</p>
  </section>;
}
