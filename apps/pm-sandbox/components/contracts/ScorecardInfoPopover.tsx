import type { ScorecardCalculationComponent, ScorecardMetricThreshold } from "@/types/agreementScorecard";

interface ScorecardInfoPopoverProps {
  title: string;
  description?: string;
  notes?: string[];
  components?: ScorecardCalculationComponent[];
  thresholds?: ScorecardMetricThreshold[];
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ScorecardInfoPopover({
  title,
  description,
  notes,
  components,
  thresholds,
}: ScorecardInfoPopoverProps) {
  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none rounded-full border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
        i
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg">
        <p className="font-semibold text-slate-900">{title}</p>
        {description ? <p className="mt-1 text-slate-600">{description}</p> : null}

        {thresholds?.length ? (
          <div className="mt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Threshold ladder</p>
            <ul className="mt-1 space-y-1 text-slate-700">
              {thresholds.map((threshold) => (
                <li key={threshold.id} className="flex items-center justify-between gap-2">
                  <span>{threshold.label}</span>
                  <span className="font-semibold tabular-nums">{threshold.stars?.toFixed(1) ?? threshold.value.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {components?.length ? (
          <div className="mt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Calculation inputs</p>
            <ul className="mt-1 space-y-1 text-slate-700">
              {components.map((component) => (
                <li key={`${component.label}-${component.value}`} className="flex items-center justify-between gap-2">
                  <span>{component.label}</span>
                  <span className="font-semibold tabular-nums">{component.displayValue ?? formatMoney(component.value)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {notes?.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
