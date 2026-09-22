"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";

type UsHotspotDatum = {
  label: string;
  code?: string;
  value: number;
};

const US_STATES_TOPOJSON = "/maps/us-states.json";

function toneForValue(value: number, min: number, max: number) {
  if (max <= min) return "#c7d2fe";
  const ratio = (value - min) / (max - min);
  if (ratio >= 0.75) return "#312e81";
  if (ratio >= 0.5) return "#4338ca";
  if (ratio >= 0.25) return "#6366f1";
  return "#c7d2fe";
}

export default function UsHotspotMap({ data }: { data: UsHotspotDatum[] }) {
  const byState = new Map(data.map((item) => [item.label.toLowerCase(), item.value]));
  const values = data.map((item) => item.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
        Therapy hotspot intensity by U.S. state
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ComposableMap projection="geoAlbersUsa" width={950} height={560} style={{ width: "100%", height: "auto" }}>
          <Geographies geography={US_STATES_TOPOJSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = String((geo.properties as { name?: string })?.name ?? "");
                const value = byState.get(stateName.toLowerCase());
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={value == null ? "#e2e8f0" : toneForValue(value, min, max)}
                    stroke="#ffffff"
                    strokeWidth={0.7}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: value == null ? "#cbd5e1" : "#1d4ed8" },
                      pressed: { outline: "none" },
                    }}
                  >
                    <title>{`${stateName || "State"}: ${value == null ? "No data" : value}`}</title>
                  </Geography>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
        <span className="font-semibold uppercase tracking-wide">Hotspot scale</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#c7d2fe]" />
          Low
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#4338ca]" />
          Medium
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#312e81]" />
          High
        </span>
      </div>
    </div>
  );
}
