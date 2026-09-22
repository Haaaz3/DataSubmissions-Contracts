import { TrendDirection } from "@/types/cohort";

interface TrendPillProps {
  direction: TrendDirection;
  percent:   number;
}

export default function TrendPill({ direction, percent }: TrendPillProps) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
        ↑ {percent}%
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        ↓ {percent}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      → stable
    </span>
  );
}
