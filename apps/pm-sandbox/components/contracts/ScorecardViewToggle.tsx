export type ScorecardViewMode = "group" | "analyst";

interface ScorecardViewToggleProps {
  value: ScorecardViewMode;
  onChange: (value: ScorecardViewMode) => void;
}

const options: Array<{ value: ScorecardViewMode; label: string }> = [
  { value: "group", label: "Group View" },
  { value: "analyst", label: "Analyst Table View" },
];

export default function ScorecardViewToggle({ value, onChange }: ScorecardViewToggleProps) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
