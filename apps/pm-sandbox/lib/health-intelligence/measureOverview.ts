import type { MeasureObligation, SharedMeasureFamily } from "../../data/synthetic/sharedMeasures";
import type { SharedMeasurePatient } from "./measurePopulation";
import { calculateMeasureImpact } from "./sharedMeasures";

export function summarizeMeasurePopulation(family: SharedMeasureFamily, obligations: MeasureObligation[], patients: SharedMeasurePatient[]) {
  const ids = new Set(obligations.map(item => item.id));
  let eligible = 0;
  let open = 0;
  let shared = 0;
  let sharedOpen = 0;
  for (const patient of patients) {
    const memberships = patient.memberships.filter(item => ids.has(item.obligationId));
    if (!memberships.length) continue;
    eligible++;
    const gaps = memberships.filter(item => item.status === "Open").length;
    if (gaps) open++;
    if (memberships.length > 1) shared++;
    if (gaps > 1) sharedOpen++;
  }
  const priorities = obligations.map(obligation => ({
    obligation,
    impact: calculateMeasureImpact(obligation.impact, family.definitions.find(item => item.id === obligation.definitionId)!.direction),
  })).filter(item => item.impact.patientsToTarget !== null && item.impact.patientsToTarget > 0)
    .sort((a, b) => b.impact.patientsToTarget! - a.impact.patientsToTarget!);
  return { eligible, open, shared, sharedOpen, priority: priorities[0] ?? null };
}

// Zoom to observed rates, not the target. Off-scale targets are labeled separately.
export function measureTrendData(obligation: MeasureObligation) {
  const points = obligation.history.map(point => ({ ...point, rate: point.eligible ? point.numerator / point.eligible * 100 : null }));
  const rates = points.flatMap(point => point.rate === null ? [] : [point.rate]);
  const first = points[0]?.rate ?? null;
  const last = points.at(-1)?.rate ?? null;
  const low = rates.length ? Math.min(...rates) : 0;
  const high = rates.length ? Math.max(...rates) : 100;
  const padding = Math.max(1, (high - low) * 0.15);
  const min = Math.max(0, Math.floor(low - padding));
  const max = Math.min(100, Math.ceil(high + padding));
  return { points, first, last, delta: first === null || last === null ? null : last - first, min, max };
}
