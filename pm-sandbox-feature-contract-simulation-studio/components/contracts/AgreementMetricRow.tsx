import type { ScorecardMetric } from "@/types/agreementScorecard";

function formatMetricValue(value: number, unit: ScorecardMetric["unit"]) {
  if (unit === "percent") return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
  if (unit === "rate_per_1000") return `${value.toFixed(value % 1 === 0 ? 0 : 1)} / 1,000`;
  if (unit === "currency_pmpm") return `$${Math.round(value).toLocaleString()} PMPM`;
  if (unit === "days") return `${value.toFixed(1)} days`;
  if (unit === "count") return Math.round(value).toLocaleString();
  return value.toFixed(1);
}

function statusClass(status: ScorecardMetric["status"]) {
  if (status === "on_track") return "bg-emerald-100 text-emerald-700";
  if (status === "watch") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function statusLabel(status: ScorecardMetric["status"]) {
  if (status === "on_track") return "On track";
  if (status === "watch") return "Watch";
  return "At risk";
}

export default function AgreementMetricRow({ metric }: { metric: ScorecardMetric }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{metric.label}</p>
          <p className="text-xs text-slate-500">{metric.description}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(metric.status)}`}>
          {statusLabel(metric.status)}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
        <div>
          <p className="text-slate-400">Current</p>
          <p className="font-semibold tabular-nums text-slate-900">{formatMetricValue(metric.currentValue, metric.unit)}</p>
        </div>
        <div>
          <p className="text-slate-400">Target</p>
          <p className="font-semibold tabular-nums text-slate-700">{formatMetricValue(metric.targetValue, metric.unit)}</p>
        </div>
        <div>
          <p className="text-slate-400">Benchmark</p>
          <p className="font-semibold tabular-nums text-slate-700">
            {metric.benchmarkValue !== undefined ? formatMetricValue(metric.benchmarkValue, metric.unit) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
