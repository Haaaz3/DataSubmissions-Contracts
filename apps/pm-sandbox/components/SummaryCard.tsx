import type { ReactNode } from "react";

interface SummaryCardProps {
  label: string;
  value: ReactNode;
  description?: string;
  accent?: string; // Tailwind text color class
  tooltipTitle?: string;
  tooltipLines?: string[];
}

export default function SummaryCard({
  label,
  value,
  description,
  accent = "text-slate-900",
  tooltipTitle,
  tooltipLines,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {tooltipTitle || tooltipLines?.length ? (
          <details className="group relative">
            <summary className="flex h-5 w-5 cursor-help list-none items-center justify-center rounded-full border border-slate-200 text-[11px] font-bold text-slate-500 hover:bg-slate-50">
              ?
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg">
              {tooltipTitle ? <p className="font-semibold text-slate-900">{tooltipTitle}</p> : null}
              {tooltipLines?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {tooltipLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </details>
        ) : null}
      </div>
      <p className={`mt-2 text-4xl font-bold ${accent}`}>{value}</p>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
    </div>
  );
}
