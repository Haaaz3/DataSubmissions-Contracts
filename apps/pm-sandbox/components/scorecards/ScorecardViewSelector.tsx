export type ScorecardView = "region" | "market" | "payor" | "insuranceSegment" | "contractType" | "agreement" | "contract";

const options: Array<{ value: ScorecardView; label: string }> = [
  { value: "region", label: "Region" },
  { value: "market", label: "Market" },
  { value: "payor", label: "Payor" },
  { value: "insuranceSegment", label: "Insurance Segment" },
  { value: "contractType", label: "Contract Type" },
  { value: "agreement", label: "Agreement" },
  { value: "contract", label: "Contract" },
];

export default function ScorecardViewSelector({
  value,
  onChange,
}: {
  value: ScorecardView;
  onChange: (value: ScorecardView) => void;
}) {
  return (
    <div className="inline-flex min-w-max flex-nowrap rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`whitespace-nowrap rounded-md px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
