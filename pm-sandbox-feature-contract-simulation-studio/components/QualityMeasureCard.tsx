import TrendPill from "./TrendPill";
import { ContractQualityMeasure } from "@/types/quality";

interface QualityMeasureCardProps {
  measure: ContractQualityMeasure;
}

export default function QualityMeasureCard({ measure }: QualityMeasureCardProps) {
  const { performance } = measure;
  const belowTarget = performance.ratePercent < measure.targetPercent;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{measure.domain}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{measure.shortName}</h3>
          <p className="mt-1 text-xs text-slate-500">{measure.description}</p>
        </div>
        <TrendPill direction={performance.trendDirection} percent={performance.trendPercent} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-slate-900">{performance.ratePercent}%</p>
          <p className="text-xs text-slate-400">
            Target {measure.targetPercent}% · Benchmark {measure.benchmarkPercent}%
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            belowTarget ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {belowTarget ? "Gap" : "On Target"}
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full transition-all ${belowTarget ? "bg-amber-400" : "bg-emerald-400"}`}
          style={{ width: `${Math.min(performance.ratePercent, 100)}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-400">Eligible Members</p>
          <p className="font-semibold text-slate-900">{performance.eligibleMembers.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400">Care Gaps</p>
          <p className="font-semibold text-slate-900">{performance.gapMembers.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400">{measure.numeratorLabel}</p>
          <p className="font-semibold text-slate-900">
            {(performance.eligibleMembers - performance.gapMembers).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Updated</p>
          <p className="font-semibold text-slate-900">{performance.lastUpdated}</p>
        </div>
      </div>
    </div>
  );
}