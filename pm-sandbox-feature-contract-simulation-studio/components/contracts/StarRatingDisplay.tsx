interface StarRatingDisplayProps {
  value: number;
  max?: number;
  showNumeric?: boolean;
  size?: "sm" | "md" | "lg";
  muted?: boolean;
  roundingMode?: "whole" | "half";
}

export function roundToCmsHalfStar(value: number, max: number) {
  const clamped = Math.max(0, Math.min(max, value));
  if (clamped >= max - 0.25) return max;

  const floor = Math.floor(clamped);
  const fraction = clamped - floor;

  if (fraction < 0.25) return floor;
  if (fraction < 0.75) return floor + 0.5;
  return Math.min(max, floor + 1);
}

export default function StarRatingDisplay({
  value,
  max = 5,
  showNumeric = true,
  size = "sm",
  muted = false,
  roundingMode = "half",
}: StarRatingDisplayProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const rounded = roundingMode === "half" ? roundToCmsHalfStar(clamped, max) : Math.round(clamped);
  const numericDisplay = Number(rounded.toFixed(1));
  const stars = Array.from({ length: max }, (_, index) => {
    const starIndex = index + 1;
    if (rounded >= starIndex) return "full" as const;
    if (rounded >= starIndex - 0.5) return "half" as const;
    return "empty" as const;
  });

  const sizeClass = size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm";
  const numericSizeClass = size === "lg" ? "text-xl" : size === "md" ? "text-sm" : "text-xs";
  const toneClass = muted ? "text-slate-400" : "text-amber-500";

  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-flex ${sizeClass} ${toneClass}`} aria-label={`${numericDisplay.toFixed(1)} out of ${max} stars`}>
        {stars.map((star, index) => (
          <span key={`${star}-${index}`} className={star === "empty" ? "text-slate-300" : star === "half" ? "opacity-55" : ""}>
            ★
          </span>
        ))}
      </span>
      {showNumeric ? <span className={`${numericSizeClass} font-semibold tabular-nums text-slate-700`}>{numericDisplay.toFixed(1)}</span> : null}
    </span>
  );
}
