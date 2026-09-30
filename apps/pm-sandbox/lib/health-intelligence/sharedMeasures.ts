import type { SharedMeasureFamily, MeasureObligation, MeasureImpact, MeasureDefinition } from "../../data/synthetic/sharedMeasures";
import type { HdiObligationId } from "../../data/synthetic/healthIntelligenceObligations";

export function filterSharedMeasures(families: SharedMeasureFamily[], query: string, program: HdiObligationId | "all") {
  const term = query.trim().toLocaleLowerCase();
  return families.flatMap(family => {
    const familyMatches = `${family.name} ${family.focus}`.toLocaleLowerCase().includes(term);
    const obligations = family.obligations.filter(obligation => {
      if (program !== "all" && obligation.programId !== program) return false;
      const definition = family.definitions.find(item => item.id === obligation.definitionId);
      const text = `${obligation.label} ${definition?.name} ${definition?.id} ${definition?.standard}`.toLocaleLowerCase();
      return familyMatches || text.includes(term);
    });
    return obligations.length ? [{ family, obligations }] : [];
  });
}

export function countMeasurePrograms(obligations: MeasureObligation[]) {
  return new Set(obligations.map(item => item.programId)).size;
}

export function calculateMeasureImpact(impact: MeasureImpact, direction: MeasureDefinition["direction"]) {
  const { eligible, numerator, targetPercent, financial } = impact;
  if (!Number.isInteger(eligible) || !Number.isInteger(numerator) || eligible < 0 || numerator < 0 || numerator > eligible || !Number.isFinite(targetPercent) || targetPercent < 0 || targetPercent > 100) {
    throw new Error("Invalid measure population or target");
  }
  if (financial && (!Number.isFinite(financial.poolDollars) || financial.poolDollars < 0 || !Number.isFinite(financial.weightPercent) || financial.weightPercent < 0 || financial.weightPercent > 100)) {
    throw new Error("Invalid measure allocation");
  }
  const allocatedDollars = financial ? Math.round(financial.poolDollars * financial.weightPercent / 100) : null;
  if (eligible === 0) return { rate: null, openGaps: 0, patientsToTarget: null, gapPoints: null, targetMet: null, allocatedDollars, exposureDollars: null };
  const higher = direction === "Higher is better";
  const rate = numerator / eligible * 100;
  // Round toward the required whole-patient threshold. The tolerance avoids
  // binary floating-point turning an exact integer into one extra patient.
  const threshold = higher ? Math.ceil(eligible * targetPercent / 100 - 1e-9) : Math.floor(eligible * targetPercent / 100 + 1e-9);
  const patientsToTarget = Math.max(0, higher ? threshold - numerator : numerator - threshold);
  const targetMet = patientsToTarget === 0;
  return {
    rate,
    openGaps: higher ? eligible - numerator : numerator,
    patientsToTarget,
    gapPoints: Math.max(0, higher ? targetPercent - rate : rate - targetPercent),
    targetMet,
    allocatedDollars,
    // Scenario rule: the assigned amount is exposed while below target. This
    // is not a per-patient payment, savings estimate, or settlement calculation.
    exposureDollars: allocatedDollars === null ? null : targetMet ? 0 : allocatedDollars,
  };
}
