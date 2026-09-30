"use client";

import type { Contract } from "@/types/contract";
import { costAmount, costUnitLabel, vbcFinancialSummary, type CostUnit } from "@/lib/contracts/vbcFinancials";
import { portfolioMoney as money } from "@/lib/health-intelligence/portfolioSummary";
import { signedMoney } from "@/lib/health-intelligence/financialEnvelope";
import FinancialEnvelope from "./FinancialEnvelope";

export default function VbcFinancialSummary({ contracts, unit, onUnitChange }: { contracts: Contract[]; unit: CostUnit; onUnitChange: (unit: CostUnit) => void }) {
  const totals = vbcFinancialSummary(contracts);
  const dollars = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const cost = (value: number) => unit === "annual" ? money(value) : dollars(costAmount(value, totals.memberMonths, unit));
  return <section aria-label="VBC financial outlook" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-base font-bold text-slate-900">Contract economics</h3><p className="mt-1 text-xs text-slate-500">PY {totals.year} · Illustrative contract terms · Provider financial perspective</p></div><label className="text-xs font-semibold text-slate-600">Cost basis<select aria-label="Cost basis" value={unit} onChange={e => onUnitChange(e.target.value as CostUnit)} className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2"><option value="pmpm">PMPM</option><option value="pmpy">PMPY</option><option value="annual">Annual dollars</option></select></label></div>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Attributed members</dt><dd className="mt-1 text-xl font-bold text-slate-900">{totals.lives.toLocaleString()}</dd><dd className="mt-1 text-[11px] text-slate-500">{totals.memberMonths.toLocaleString()} member months</dd></div>
      <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Medical expense · {costUnitLabel[unit]}</dt><dd className="mt-1 text-xl font-bold text-slate-900">{cost(totals.actualSpend)}</dd><dd className="mt-1 text-[11px] text-slate-500">{money(totals.actualSpend)} annualized expense</dd></div>
      <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Benchmark · {costUnitLabel[unit]}</dt><dd className="mt-1 text-xl font-bold text-slate-900">{cost(totals.benchmarkSpend)}</dd><dd className="mt-1 text-[11px] text-slate-500">{money(totals.benchmarkSpend)} annual medical budget</dd></div>
      <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Expense vs benchmark</dt><dd className={"mt-1 text-xl font-bold " + (totals.actualSpend > totals.benchmarkSpend ? "text-[#ad5235]" : "text-[#16816e]")}>{totals.actualSpend > totals.benchmarkSpend ? "+" : totals.actualSpend < totals.benchmarkSpend ? "−" : ""}{cost(Math.abs(totals.actualSpend - totals.benchmarkSpend))}</dd><dd className="mt-1 text-[11px] text-slate-500">{totals.actualSpend > totals.benchmarkSpend ? "Unfavorable" : "Favorable"} · Medical expense, before sharing</dd></div>
    </dl>
    <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3">
      <div><p className="text-xs font-semibold text-slate-600">Projected shared savings / (losses)</p><p className={"mt-2 text-2xl font-bold " + (totals.projected < 0 ? "text-[#ad5235]" : "text-[#16816e]")}>{signedMoney(totals.projected)}</p><p className="mt-1 text-[11px] text-slate-500">Annual net settlement at current performance</p></div>
      <div><p className="text-xs font-semibold text-slate-600">Settlement with actions</p><p className={"mt-2 text-2xl font-bold " + (totals.withActions < 0 ? "text-[#ad5235]" : "text-[#16816e]")}>{signedMoney(totals.withActions)}</p><p className="mt-1 text-[11px] text-slate-500">Recalculated using the same sharing terms</p></div>
      <div><p className="text-xs font-semibold text-slate-600">Settlement improvement</p><p className="mt-2 text-2xl font-bold text-[#176b75]">{signedMoney(totals.improvement)}</p><p className="mt-1 text-[11px] text-slate-500">{dollars(costAmount(totals.improvement, totals.memberMonths, "pmpm"))} PMPM · {dollars(costAmount(totals.improvement, totals.memberMonths, "pmpy"))} PMPY</p></div>
    </div>
    <FinancialEnvelope scenario={totals} />
    <p className="mt-4 text-[11px] text-slate-500">● Projected settlement · ◇ With actions · Red: shared loss · Teal: shared savings · Range: contractual sharing caps</p>
    <details className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-600"><summary className="cursor-pointer font-semibold text-[#176b75]">Settlement calculation</summary>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div><p>Gross medical savings / (overrun): {signedMoney(totals.benchmarkSpend - totals.actualSpend)}.</p><p>Projected shared savings: {money(totals.projectedSharedSavings)}. Projected shared losses: {money(totals.projectedSharedLosses)}.</p><p className="font-semibold">Net settlement: {signedMoney(totals.projected)}.</p><p className="mt-2">Each contract applies its own benchmark, minimum savings/loss threshold, quality gate, sharing rate and cap before aggregation. Favorable expense variance is not automatically earned savings.</p></div>
        <div><p>Medical expense reduction with actions: {money(totals.grossMedicalExpenseReduction)}.</p><p>Settlement improvement from cost: {signedMoney(totals.costImprovement)}.</p><p>Additional settlement from quality: {signedMoney(totals.qualityImprovement)}.</p><p className="font-semibold">Total settlement improvement: {signedMoney(totals.improvement)}.</p><p className="mt-2">Uses the strongest quantified PMPM and quality intervention per contract. Unquantified work adds no assumed dollars. Cost is applied first, then quality; their effects can interact.</p></div>
      </div>
      {contracts.length === 1 && totals.rows.map(row => <div key={row.contract.id} className="mt-4 rounded-lg bg-slate-50 p-3">
        <p>Current PMPM {dollars(row.contract.currentPmpm)} → action PMPM {dollars(row.actionPmpm)}. Quality {row.contract.qualityScore} → {row.actionQuality}; gate {row.current.terms.qualityGate}.</p>
        <p>Savings: {row.current.terms.sharedSavings ? row.current.terms.sharedSavingsRate + "% share · " + row.current.terms.sharedSavingsThreshold + "% threshold · " + row.current.terms.sharedSavingsCap + "% of benchmark cap" : "Not enabled"}.</p>
        <p>Losses: {row.current.terms.sharedRisk ? row.current.terms.sharedRiskRate + "% share · " + row.current.terms.sharedRiskThreshold + "% threshold · " + row.current.terms.downsideRiskCap + "% of benchmark cap" : "No downside sharing"}.</p>
        <p>Quality gate: {row.current.qualityPassed ? "Met" : "Not met"} now; {row.after.qualityPassed ? "met" : "not met"} with actions. Settlement status: {row.current.status.replaceAll("_", " ")}.</p>
      </div>)}
      <p className="mt-3 text-[11px] text-slate-500">PMPM = expense ÷ member months; PMPY = PMPM × 12. Seed contracts assume 12 months of continuous enrollment and separate payment streams. Annual amounts are run-rate projections, not reconciled payments. These terms demonstrate contract mechanics and are not official CMS track specifications.</p>
    </details>
  </section>;
}
