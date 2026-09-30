import type { Contract } from "@/types/contract";
import { calculateEstimatedSettlement } from "./settlement";

export type CostUnit = "pmpm" | "pmpy" | "annual";
export const costUnitLabel: Record<CostUnit, string> = { pmpm: "PMPM", pmpy: "PMPY", annual: "Annual" };
export const costAmount = (annual: number, memberMonths: number, unit: CostUnit) =>
  unit === "annual" ? annual : memberMonths > 0 ? annual / memberMonths * (unit === "pmpy" ? 12 : 1) : 0;

export function contractFinancials(contract: Contract) {
  const current = calculateEstimatedSettlement(contract);
  // Use the strongest quantified intervention for each lever, not the sum of
  // overlapping opportunities. Unquantified work contributes no invented dollars.
  const pmpmReduction = Math.min(contract.currentPmpm, Math.max(0, ...contract.opportunities.map(o => -(o.impactEstimate?.pmpmDelta ?? 0))));
  const qualityLift = Math.max(0, ...contract.opportunities.map(o => o.impactEstimate?.qualityLiftPoints ?? 0));
  const actionPmpm = contract.currentPmpm - pmpmReduction;
  const actionQuality = Math.min(100, contract.qualityScore + qualityLift);
  const costOnly = calculateEstimatedSettlement({ ...contract, currentPmpm: actionPmpm });
  const after = calculateEstimatedSettlement({ ...contract, currentPmpm: actionPmpm, qualityScore: actionQuality });
  const memberMonths = contract.attributedLives * current.monthsInPeriod;
  return {
    contract, current, after, actionPmpm, actionQuality, pmpmReduction, qualityLift,
    year: Number(current.terms.performancePeriodStart.slice(0, 4)),
    memberMonths,
    downside: current.terms.sharedRisk ? -current.benchmarkSpend * current.terms.downsideRiskCap / 100 : 0,
    upside: current.terms.sharedSavings ? Math.min(current.benchmarkSpend * current.terms.sharedSavingsCap / 100, current.benchmarkSpend * current.terms.sharedSavingsRate / 100) : 0,
    projected: current.estimatedAmount,
    withActions: after.estimatedAmount,
    improvement: after.estimatedAmount - current.estimatedAmount,
    costImprovement: costOnly.estimatedAmount - current.estimatedAmount,
    qualityImprovement: after.estimatedAmount - costOnly.estimatedAmount,
    grossMedicalExpenseReduction: current.actualSpend - after.actualSpend,
  };
}

export function vbcFinancialSummary(contracts: Contract[]) {
  const rows = contracts.map(contractFinancials);
  const sum = (read: (row: ReturnType<typeof contractFinancials>) => number) => rows.reduce((total, row) => total + read(row), 0);
  const memberMonths = sum(r => r.memberMonths);
  const actualSpend = sum(r => r.current.actualSpend);
  const benchmarkSpend = sum(r => r.current.benchmarkSpend);
  return {
    rows, count: rows.length, memberMonths, year: rows[0]?.year ?? 2026,
    lives: sum(r => r.contract.attributedLives),
    actualSpend, benchmarkSpend,
    currentPmpm: costAmount(actualSpend, memberMonths, "pmpm"),
    benchmarkPmpm: costAmount(benchmarkSpend, memberMonths, "pmpm"),
    downside: sum(r => r.downside), upside: sum(r => r.upside),
    projected: sum(r => r.projected), withActions: sum(r => r.withActions),
    improvement: sum(r => r.improvement),
    costImprovement: sum(r => r.costImprovement),
    qualityImprovement: sum(r => r.qualityImprovement),
    grossMedicalExpenseReduction: sum(r => r.grossMedicalExpenseReduction),
    projectedSharedSavings: sum(r => Math.max(0, r.projected)),
    projectedSharedLosses: sum(r => Math.max(0, -r.projected)),
    qualityPassed: rows.filter(r => r.current.qualityPassed).length,
    actionQualityPassed: rows.filter(r => r.after.qualityPassed).length,
  };
}
