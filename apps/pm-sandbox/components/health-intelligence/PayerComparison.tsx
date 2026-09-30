"use client";
import { useMemo, useState } from "react";
import type { Contract } from "@/types/contract";
import { costAmount, costUnitLabel, vbcFinancialSummary, type CostUnit } from "@/lib/contracts/vbcFinancials";
import { useExpenseBasis } from "@/lib/contracts/useExpenseBasis";
import { portfolioMoney } from "@/lib/health-intelligence/portfolioSummary";
import FinancialEnvelope from "./FinancialEnvelope";

function PayerRow({ row, maximum, financialMaximum, onSelectPayer }: { row: ReturnType<typeof vbcFinancialSummary> & { payer: string }; maximum: number; financialMaximum: number; onSelectPayer: (payer: string) => void }) {
  const preferred = row.rows.every(item => item.contract.expenseBasis === "pmpy") ? "pmpy" : "pmpm";
  const [unit, setUnit] = useExpenseBasis("payer:" + row.payer, preferred);
  const amount = (value: number) => (unit === "annual" ? portfolioMoney(value) : value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })) + " " + costUnitLabel[unit];
  const current = costAmount(row.actualSpend, row.memberMonths, unit);
  const benchmark = costAmount(row.benchmarkSpend, row.memberMonths, unit);
  const ratio = row.actualSpend / Math.max(1, row.benchmarkSpend);
  const variance = current - benchmark;
  const unfavorable = variance > 0;
  return <tr className="hover:bg-slate-50/50">
    <th scope="row" className="px-5 py-5"><button type="button" onClick={() => onSelectPayer(row.payer)} aria-label={"Show " + row.payer + " contracts"} className="text-left text-xs font-bold text-[#176b75] hover:underline">{row.payer} ↗</button><p className="mt-1 text-[11px] font-normal text-slate-500">{row.lives.toLocaleString()} members · {row.count} {row.count === 1 ? "contract" : "contracts"}</p></th>
    <td className="px-5 py-5"><div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs"><strong className="text-slate-900">{amount(current)}</strong><span className="text-slate-500">vs {amount(benchmark)}</span></div>
      <div role="img" aria-label={row.payer + ": expense " + amount(current) + ", benchmark " + amount(benchmark) + ". " + (ratio * 100).toFixed(1) + "% of benchmark. Bars normalized to benchmark."} className="relative mt-3 h-3 rounded-sm bg-slate-100"><div className="h-full rounded-sm" style={{ width: ratio / maximum * 100 + "%", background: unfavorable ? "linear-gradient(90deg, #f3dfc4, #bd583d)" : "linear-gradient(90deg, #d6eae1, #16816e)" }} /><span className="absolute -top-1 h-5 w-0.5 bg-slate-700" style={{ left: 100 / maximum + "%" }} /></div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] text-slate-500">{portfolioMoney(row.actualSpend)} annual medical expense</p><select aria-label={row.payer + " expense basis"} value={unit} onChange={event => setUnit(event.target.value as CostUnit)} className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] text-slate-600"><option value="pmpm">PMPM</option><option value="pmpy">PMPY</option><option value="annual">Annual</option></select></div>
    </td>
    <td className="px-5 py-5"><p className={"text-xs font-bold " + (unfavorable ? "text-[#ad5235]" : "text-[#16816e]")}>{variance > 0 ? "+" : variance < 0 ? "−" : ""}{amount(Math.abs(variance))}</p><p className="mt-1 text-[11px] text-slate-500">{Math.abs(ratio * 100 - 100).toFixed(1)}% {unfavorable ? "above" : variance < 0 ? "below" : "at"} benchmark</p></td>
    <td className="px-5 py-5"><FinancialEnvelope scenario={row} compact axisMaximum={financialMaximum} /></td>
  </tr>;
}
export default function PayerComparison({ contracts, onSelectPayer }: { contracts: Contract[]; onSelectPayer: (payer: string) => void }) {
  const [sort, setSort] = useState("opportunity");
  const rows = useMemo(() => [...new Set(contracts.map(c => c.payor))].map(payer => ({ payer, ...vbcFinancialSummary(contracts.filter(c => c.payor === payer)) })), [contracts]);
  const sorted = [...rows].sort((a, b) => sort === "variance" ? b.actualSpend / b.benchmarkSpend - a.actualSpend / a.benchmarkSpend : sort === "spend" ? b.actualSpend - a.actualSpend : b.improvement - a.improvement);
  const maximum = Math.max(1.15, ...rows.map(row => row.actualSpend / Math.max(1, row.benchmarkSpend) * 1.05));
  const financialMaximum = Math.max(1, ...rows.flatMap(row => [Math.abs(row.downside), row.upside]));
  return <section aria-labelledby="payer-comparison-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5"><div><h3 id="payer-comparison-heading" className="text-lg font-bold text-slate-900">Payer performance</h3><p className="mt-1 text-xs text-slate-500">{rows.length} payers · Select a payer to review its contracts.</p></div><label className="text-xs text-slate-600">Sort payers<select aria-label="Sort payers" value={sort} onChange={e => setSort(e.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white p-2"><option value="opportunity">Settlement improvement</option><option value="variance">Most above benchmark</option><option value="spend">Highest medical expense</option></select></label></div>
    <div className="flex flex-wrap justify-between gap-3 bg-slate-50 px-5 py-3 text-[11px] text-slate-500"><span>Expense vs benchmark · Green: below · Red: above · │ Benchmark · Bar lengths normalized to benchmark</span><span>Settlement: ● Current projection · ◇ With actions · │ $0</span></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[1150px] table-fixed text-left"><caption className="sr-only">Expense basis is labeled per row. Expense bars use a shared percent-of-benchmark scale. Financial envelopes show annual provider settlements.</caption><thead className="border-y border-slate-100 text-[10px] uppercase text-slate-500"><tr><th className="w-[17%] px-5 py-3">Payer / members</th><th className="w-[30%] px-5 py-3">Medical expense</th><th className="w-[17%] px-5 py-3">Expense variance</th><th className="w-[36%] px-5 py-3">Annual shared savings / (losses)</th></tr></thead><tbody className="divide-y divide-slate-100">{sorted.map(row => <PayerRow key={row.payer} row={row} maximum={maximum} financialMaximum={financialMaximum} onSelectPayer={onSelectPayer} />)}</tbody></table></div>
    <p className="border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500">Current expense vs benchmark in each row’s selected basis. PMPM = expense ÷ member months; PMPY = PMPM × 12. Mixed contract bases are normalized before aggregation. Changing display units does not change annual settlement. Illustrative terms and full-year enrollment.</p>
  </section>;
}
