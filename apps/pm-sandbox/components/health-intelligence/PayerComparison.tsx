'use client';

import { useMemo, useState } from 'react';
import type { Contract } from '@/types/contract';
import { buildPayerComparison, spendAxisMaximum } from '@/lib/contracts/payerComparison';

const money = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000) return `$${(absolute / 1_000_000).toFixed(1)}M`;
  if (absolute >= 1_000) return `$${(absolute / 1_000).toFixed(0)}K`;
  return `$${absolute.toFixed(0)}`;
};
const count = (value: number) => value.toLocaleString('en-US');
const preciseMoney = (value: number) => Math.abs(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function PayerComparison({ contracts, onSelectPayer }: {
  contracts: Contract[];
  onSelectPayer: (payer: string) => void;
}) {
  const [sort, setSort] = useState('spend');
  const rows = useMemo(() => buildPayerComparison(contracts), [contracts]);
  const maximum = spendAxisMaximum(rows);
  const sorted = [...rows].sort((a, b) => (sort === 'variance' ? b.variance - a.variance : sort === 'lives' ? b.lives - a.lives : b.currentSpend - a.currentSpend) || a.payer.localeCompare(b.payer));
  const totalLives = rows.reduce((sum, row) => sum + row.lives, 0);

  return <section aria-labelledby="payer-comparison-heading" className="overflow-hidden rounded-2xl border border-[#e2e7ee] bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#28737a]">Payer comparison</p>
        <h3 id="payer-comparison-heading" className="mt-1 text-lg font-bold tracking-tight text-slate-900">Who is above target, and by how much?</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{rows.length} payers · {count(totalLives)} attributed lives · Select a payer to review its contracts.</p>
      </div>
      <label className="text-[11px] font-semibold text-slate-600">Sort payers
        <select aria-label="Sort payers" value={sort} onChange={event => setSort(event.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800">
          <option value="spend">Highest spend</option><option value="variance">Most above target</option><option value="lives">Most lives</option>
        </select>
      </label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f8fafc] px-5 py-3 text-[11px] text-slate-600">
      <div className="flex flex-wrap items-center gap-4"><span><i className="mr-1.5 inline-block h-2 w-5 rounded-sm bg-[#526ee8]" />Current spend</span><span><i className="mr-1.5 inline-block h-3 w-0.5 bg-slate-700 align-middle" />Target spend</span></div>
      <span>Same dollar scale for every payer · {money(0)}–{money(maximum)}</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] table-fixed text-left">
        <caption className="sr-only">Payer annualized current spend, target spend, signed spend variance and share of portfolio attributed lives.</caption>
        <thead className="border-y border-slate-100 text-[10px] uppercase tracking-wide text-slate-500">
          <tr><th scope="col" className="w-[23%] px-5 py-3">Payer</th><th scope="col" className="w-[37%] px-5 py-3">Annualized spend vs target</th><th scope="col" className="w-[23%] px-5 py-3">Spend variance</th><th scope="col" className="w-[17%] px-5 py-3">Attributed lives</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map(row => {
            const direction = row.variance > 0 ? 'Above target' : row.variance < 0 ? 'Below target' : 'On target';
            const tone = row.variance > 0 ? 'text-amber-800 bg-amber-50' : row.variance < 0 ? 'text-emerald-800 bg-emerald-50' : 'text-slate-700 bg-slate-100';
            const share = (row.livesShare * 100).toFixed(1);
            return <tr key={row.payer} className="hover:bg-[#fbfcfe]">
              <th scope="row" className="px-5 py-4 align-middle">
                <button type="button" onClick={() => onSelectPayer(row.payer)} aria-label={`Show ${row.payer} contracts`} className="text-left text-xs font-bold text-[#176b75] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#176b75]">{row.payer} <span aria-hidden="true">↗</span></button>
                <p className="mt-1 text-[11px] font-normal text-slate-500">{row.contracts} {row.contracts === 1 ? 'contract' : 'contracts'}</p>
              </th>
              <td className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-2 text-xs"><span className="font-bold tabular-nums text-slate-900" title={preciseMoney(row.currentSpend)}>{money(row.currentSpend)} <span className="font-normal text-slate-500">current</span></span><span className="tabular-nums text-slate-500" title={preciseMoney(row.targetSpend)}>{money(row.targetSpend)} target</span></div>
                <div role="img" aria-label={`${row.payer}: ${preciseMoney(row.currentSpend)} annualized current spend; target ${preciseMoney(row.targetSpend)}. Scale zero to ${preciseMoney(maximum)}.`} className="relative mt-2.5 h-3 rounded-sm bg-slate-100">
                  <div className="h-full rounded-sm bg-[#526ee8]" style={{ width: `${row.currentSpend / maximum * 100}%` }} />
                  <span className="absolute -top-1 h-5 w-0.5 -translate-x-1/2 bg-slate-700" style={{ left: `${row.targetSpend / maximum * 100}%` }} />
                </div>
              </td>
              <td className="px-5 py-4">
                <p className="text-sm font-bold tabular-nums text-slate-900" title={`${preciseMoney(row.variance)} ${direction.toLowerCase()}`}>{row.variance > 0 ? '+' : row.variance < 0 ? '−' : ''}{money(row.variance)}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1"><span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tone}`}>{direction}</span><span className="text-[10px] text-slate-500">{row.variancePmpm > 0 ? '+' : row.variancePmpm < 0 ? '−' : ''}${Math.abs(row.variancePmpm).toFixed(2)} PMPM</span></div>
              </td>
              <td className="px-5 py-4"><p className="text-xs font-bold tabular-nums text-slate-900">{count(row.lives)}</p><p className="mt-1 text-[10px] text-slate-500">{share}% of portfolio lives</p><div aria-hidden="true" className="mt-2 h-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#8b9cc0]" style={{ width: `${row.livesShare * 100}%` }} /></div></td>
            </tr>;
          })}
        </tbody>
      </table>
      {!rows.length && <p className="px-5 py-8 text-sm text-slate-500">No contracts in this portfolio.</p>}
    </div>
    <p className="border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500">Annualized spend = PMPM × attributed lives × 12. Variance = current spend − target spend. A spend gap is not an earned settlement. Life counts sum contract attribution; they are not a deduplicated patient count.</p>
  </section>;
}
