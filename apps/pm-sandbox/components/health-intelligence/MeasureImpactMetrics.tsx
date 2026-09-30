import type { MeasureDefinition, MeasureImpact } from "@/data/synthetic/sharedMeasures";
import { calculateMeasureImpact } from "@/lib/health-intelligence/sharedMeasures";

const whole = (value: number) => value.toLocaleString("en-US");
const dollars = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function MeasureImpactMetrics({ impact, direction }: { impact: MeasureImpact; direction: MeasureDefinition["direction"] }) {
  const result = calculateMeasureImpact(impact, direction);
  const higher = direction === "Higher is better";
  return <div className="mt-3 border-t border-slate-100 pt-3">
    <dl className="grid grid-cols-2 gap-x-5 gap-y-3 lg:grid-cols-4">
      <div><dt className="text-[11px] font-semibold text-slate-500">Eligible patients</dt><dd className="mt-1 text-lg font-bold tabular-nums text-slate-900">{whole(impact.eligible)}</dd><dd className="text-xs text-slate-500">{whole(result.openGaps)} open gaps</dd></div>
      <div><dt className="text-[11px] font-semibold text-slate-500">Current / target</dt><dd className="mt-1 text-lg font-bold tabular-nums text-slate-900">{result.rate === null ? "—" : `${result.rate.toFixed(1)}%`} <span className="text-sm font-medium text-slate-500">/ {higher ? "≥" : "≤"}{impact.targetPercent}%</span></dd><dd className="text-xs text-slate-500">{direction}</dd></div>
      <div><dt className="text-[11px] font-semibold text-slate-500">Patients to target</dt><dd className={`mt-1 text-lg font-bold tabular-nums ${result.targetMet ? "text-emerald-700" : "text-amber-800"}`}>{result.patientsToTarget === null ? "—" : whole(result.patientsToTarget)}</dd><dd className="text-xs text-slate-500">{result.targetMet === null ? "No eligible population" : result.targetMet ? "Target met" : `${result.gapPoints!.toFixed(1)} percentage-point gap`}</dd></div>
      <div><dt className="text-[11px] font-semibold text-slate-500">Modeled exposure</dt><dd className={`mt-1 text-lg font-bold tabular-nums ${result.exposureDollars ? "text-amber-800" : "text-slate-900"}`}>{result.exposureDollars === null ? "—" : dollars(result.exposureDollars)}</dd><dd className="text-xs text-slate-500">{result.allocatedDollars === null ? "Not allocated" : `${dollars(result.allocatedDollars)} measure allocation`}</dd></div>
    </dl>
    <details className="mt-2 text-xs leading-5 text-slate-500">
      <summary className="w-fit cursor-pointer font-semibold text-[#176b75]">Calculation</summary>
      <div className="mt-2 space-y-1 rounded-lg bg-slate-50 p-3">
        <p><strong>Rate:</strong> {whole(impact.numerator)} / {whole(impact.eligible)} {higher ? "meet the measure" : "are in the poor-control numerator, including missing assessments/results"}.</p>
        <p><strong>Patients to target:</strong> {higher ? "Additional numerator patients needed" : "Patients who must leave the poor-control numerator"} to reach {higher ? "at least" : "at most"} {impact.targetPercent}%, rounded to whole patients. Denominator held fixed.</p>
        {impact.financial ? <><p><strong>Allocation:</strong> {dollars(impact.financial.poolDollars)} × {impact.financial.weightPercent}% assumed share = {dollars(result.allocatedDollars!)}. Pool: {impact.financial.poolLabel}.</p><p><strong>Exposure rule:</strong> The allocation is exposed while the target is missed, and $0 once met. Scenario assumption; actual payment terms are not configured.</p></> : <p><strong>Financial impact:</strong> No measure-level allocation is configured for this obligation.</p>}
        <p>Illustrative populations, targets and allocations. Exposure is not a payout or savings estimate.</p>
      </div>
    </details>
  </div>;
}
