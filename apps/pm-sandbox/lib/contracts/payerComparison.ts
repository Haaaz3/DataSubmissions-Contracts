import type { Contract } from '@/types/contract';

export type PayerComparisonRow = {
  payer: string;
  contracts: number;
  lives: number;
  currentSpend: number;
  targetSpend: number;
  variance: number;
  variancePmpm: number;
  livesShare: number;
};

// A common 12-month run rate, not a claims-period total or contract settlement.
export function buildPayerComparison(contracts: Pick<Contract, 'payor' | 'attributedLives' | 'currentPmpm' | 'targetPmpm'>[]): PayerComparisonRow[] {
  const rows = new Map<string, PayerComparisonRow>();
  let totalLives = 0;
  for (const contract of contracts) {
    const row = rows.get(contract.payor) ?? {
      payer: contract.payor, contracts: 0, lives: 0, currentSpend: 0,
      targetSpend: 0, variance: 0, variancePmpm: 0, livesShare: 0,
    };
    row.contracts += 1;
    row.lives += contract.attributedLives;
    row.currentSpend += contract.currentPmpm * contract.attributedLives * 12;
    row.targetSpend += contract.targetPmpm * contract.attributedLives * 12;
    totalLives += contract.attributedLives;
    rows.set(contract.payor, row);
  }
  return [...rows.values()].map(row => ({
    ...row,
    variance: row.currentSpend - row.targetSpend,
    variancePmpm: row.lives ? (row.currentSpend - row.targetSpend) / (row.lives * 12) : 0,
    livesShare: totalLives ? row.lives / totalLives : 0,
  }));
}

export function spendAxisMaximum(rows: PayerComparisonRow[]) {
  const largest = Math.max(0, ...rows.flatMap(row => [row.currentSpend, row.targetSpend]));
  if (largest === 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(largest));
  return Math.ceil(largest / magnitude / 0.5) * magnitude * 0.5;
}
