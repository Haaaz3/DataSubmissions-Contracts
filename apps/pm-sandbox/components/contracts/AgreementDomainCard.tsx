import TrendPill from "@/components/TrendPill";
import type { ScorecardDomain } from "@/types/agreementScorecard";
import AgreementMetricRow from "@/components/contracts/AgreementMetricRow";
import ScorecardIcon from "@/components/contracts/ScorecardIcon";

function domainStatusClass(status: ScorecardDomain["status"]) {
  if (status === "on_track") return "bg-emerald-100 text-emerald-700";
  if (status === "watch") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function domainStatusLabel(status: ScorecardDomain["status"]) {
  if (status === "on_track") return "On Track";
  if (status === "watch") return "Watch";
  return "At Risk";
}

function domainIcon(domainKey: ScorecardDomain["key"]) {
  switch (domainKey) {
    case "quality_of_care":
      return "heartPulse" as const;
    case "utilization_efficiency":
      return "activity" as const;
    case "cost_management":
      return "banknote" as const;
    case "patient_experience":
      return "smile" as const;
    case "risk_adjustment":
      return "shield" as const;
    case "documentation":
      return "document" as const;
    default:
      return "dashboard" as const;
  }
}

function statusIcon(status: ScorecardDomain["status"]) {
  if (status === "on_track") return "checkCircle" as const;
  if (status === "watch") return "clock" as const;
  return "alertTriangle" as const;
}

export default function AgreementDomainCard({ domain }: { domain: ScorecardDomain }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            <span className="mr-1 inline-flex align-middle text-indigo-600">
              <ScorecardIcon name={domainIcon(domain.key)} className="h-3.5 w-3.5" />
            </span>
            {domain.label}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Score <span className="tabular-nums">{domain.score}</span> / 100</h3>
          <p className="mt-1 text-sm text-slate-500">{domain.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendPill direction={domain.trendDirection} percent={domain.trendPercent} />
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${domainStatusClass(domain.status)}`}>
            <span className="mr-1 inline-flex align-middle">
              <ScorecardIcon name={statusIcon(domain.status)} className="h-3 w-3" />
            </span>
            {domainStatusLabel(domain.status)}
          </span>
        </div>
      </div>

      <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-700">Executive insight:</span> {domain.executiveInsight}
      </p>

      <div className="mt-3 space-y-2">
        {domain.metrics.map((metric) => (
          <AgreementMetricRow key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
}
