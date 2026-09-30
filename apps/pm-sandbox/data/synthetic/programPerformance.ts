import type { HdiObligationId } from "./healthIntelligenceObligations";
import { publishedMeasuresFor } from "../reference/programQualityMeasures";

export type QualityResult = {
  key: string; current: number; target: number; history: number[]; lower: boolean;
  unit: "%" | "index"; eligible: number; reviewCount: number; action: string;
};
type Seed = [number, number, number, number, number, string, boolean?, "index"?];
// Internal targets and synthetic operational cohorts; these are not CMS benchmarks.
const seeds: Record<string, Seed> = {
  "qpp-236": [74, 80, 69, 8200, 1560, "Reconcile missing readings; prioritize uncontrolled blood pressure."],
  "qpp-001": [24, 20, 29, 4900, 820, "Review high or missing glycemic results and arrange follow-up.", true],
  "qpp-113": [68, 75, 63, 11200, 2300, "Reconcile outside screening evidence before ordering outreach."],
  "qpp-112": [77, 80, 72, 6500, 980, "Confirm completed mammograms and schedule overdue members."],
  "qpp-134": [79, 85, 74, 14600, 2400, "Complete screening documentation and required follow-up plans."],
  "qpp-128": [88, 85, 84, 16100, 650, "Validate follow-up plans for abnormal BMI."],
  "qpp-377": [76, 85, 72, 1700, 310, "Complete missing functional status assessments."],
  "qpp-130": [93, 95, 91, 18200, 720, "Reconcile medication documentation at eligible visits."],
  "qpp-374": [70, 85, 67, 4800, 1100, "Obtain missing specialist reports and close referral loops."],
  "stars-C01": [76, 80, 72, 18400, 3200, "Reconcile mammograms and contact overdue members."],
  "stars-C02": [69, 75, 64, 31200, 6100, "Recover outside screening evidence and schedule screening."],
  "stars-C12": [78, 85, 74, 14600, 2400, "Review members without documented glycemic control."],
  "stars-C14": [76, 80, 71, 28200, 4500, "Review blood pressure evidence and arrange repeat measurement."],
  "stars-C17": [81, 90, 76, 8200, 1300, "Complete post-discharge medication reconciliation."],
  "stars-C18": [15.8, 14, 17.2, 6400, 410, "Review readmission episodes and discharge follow-up.", true],
  "stars-C20": [72, 85, 67, 8500, 1700, "Complete transition follow-up and documentation."],
  "stars-D08": [83, 88, 80, 16200, 1240, "Prioritize members approaching a refill gap."],
  "stars-D09": [86, 88, 83, 21800, 1500, "Review antihypertensive refill gaps with pharmacy teams."],
  "stars-D10": [84, 88, 81, 19400, 1750, "Review statin refill gaps and access barriers."],
  "adult-CBP-AD": [71, 80, 67, 14200, 2800, "Reconcile blood pressure readings and arrange follow-up."],
  "adult-GSD-AD": [28, 20, 32, 6800, 1250, "Review poor control and missing glycemic results.", true],
  "adult-COL-AD": [61, 75, 58, 19200, 5400, "Reconcile screening evidence and prioritize overdue members."],
  "adult-BCS-AD": [70, 80, 65, 12100, 2800, "Confirm outside mammograms and schedule overdue members."],
  "adult-CDF-AD": [66, 85, 61, 28600, 7100, "Review missing depression screens and follow-up plans."],
  "adult-FUM-AD": [53, 65, 48, 3400, 940, "Arrange mental-health follow-up after ED discharge."],
  "adult-FUH-AD": [61, 70, 56, 1800, 410, "Arrange follow-up after mental-health hospitalization."],
  "hospital-hwr": [14.6, 14, 15.5, 12400, 412, "Review readmissions, discharge follow-up and post-acute transitions.", true],
  "hospital-psi90": [0.93, 1, 1.08, 18400, 34, "Review flagged safety events and supporting documentation.", true, "index"],
  "hospital-pro": [61, 65, 56, 1600, 260, "Reconcile paired preoperative and postoperative assessments."],
  "hospital-hypoglycemia": [1.8, 1.2, 2.2, 7200, 86, "Review insulin safety events and missing source evidence.", true],
};
export function programQualityResults(program: HdiObligationId, year = 2026) {
  return publishedMeasuresFor(program, year).flatMap(definition => {
    const seed = seeds[definition.key];
    if (!seed || definition.pending) return [];
    const [current, target, prior, eligible, reviewCount, action, lower = false, unit = "%"] = seed;
    const history = [0, .2, .4, .55, .8, 1].map(progress => Number((prior + (current - prior) * progress).toFixed(unit === "index" ? 2 : 1)));
    return [{ key: definition.key, current, target, history, eligible, reviewCount, action, lower, unit: unit as QualityResult["unit"], definition }];
  });
}
export const qualityGap = (row: QualityResult) => Math.max(0, row.lower ? row.current - row.target : row.target - row.current);
export const qualityPriority = (row: QualityResult) => qualityGap(row) / Math.max(.01, row.target) * row.reviewCount;
export const qualityValue = (value: number, unit: QualityResult["unit"]) => value.toFixed(unit === "index" ? 2 : 1) + (unit === "%" ? "%" : "");
export const mipsCategories = [
  { id: "quality", label: "Quality", weight: 30, current: 75, forecast: 82, action: "Prioritize measure gaps and validate the selected reporting set." },
  { id: "cost", label: "Cost", weight: 30, current: 65, forecast: 70, action: "Review episode variation, avoidable utilization and specialist attribution." },
  { id: "pi", label: "Promoting Interoperability", weight: 25, current: 90, forecast: 92, action: "Validate exchange performance, patient access and required attestations." },
  { id: "ia", label: "Improvement Activities", weight: 15, current: 90, forecast: 96, action: "Complete activity evidence and confirm the reporting group's attestations." },
];
export const mipsScore = (field: "current" | "forecast") => mipsCategories.reduce((total, row) => total + row[field] * row.weight / 100, 0);
export const mipsScoringSource = "https://mmshub.cms.gov/sites/default/files/2026-MIPS-Annual-Call-for-Cost-Measures-Fact-Sheet.pdf";
