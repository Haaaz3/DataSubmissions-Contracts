import { describe, expect, it } from 'vitest';
import { buildPayerComparison, spendAxisMaximum } from '../lib/contracts/payerComparison';

describe('payer comparison', () => {
  it('sums annualized spend and uses attribution-weighted PMPM variance', () => {
    const rows = buildPayerComparison([
      { payor: 'A', attributedLives: 100, currentPmpm: 120, targetPmpm: 100 },
      { payor: 'A', attributedLives: 300, currentPmpm: 90, targetPmpm: 100 },
      { payor: 'B', attributedLives: 600, currentPmpm: 110, targetPmpm: 100 },
    ]);
    expect(rows[0]).toEqual({ payer: 'A', contracts: 2, lives: 400, currentSpend: 468000, targetSpend: 480000, variance: -12000, variancePmpm: -2.5, livesShare: 0.4 });
    expect(rows[1].variance).toBe(72000);
    expect(rows[1].variancePmpm).toBe(10);
    expect(rows.reduce((sum, row) => sum + row.livesShare, 0)).toBe(1);
    expect(rows.reduce((sum, row) => sum + row.variance, 0)).toBe(60000);
  });

  it('preserves all payers, exact-target values, and zero-lives rows without inventing a bar floor', () => {
    const rows = buildPayerComparison(Array.from({ length: 8 }, (_, index) => ({ payor: `Payer ${index}`, attributedLives: index === 0 ? 0 : 10, currentPmpm: 100, targetPmpm: 100 })));
    expect(rows).toHaveLength(8);
    expect(rows[0]).toMatchObject({ currentSpend: 0, targetSpend: 0, variance: 0, variancePmpm: 0, livesShare: 0 });
    expect(rows.every(row => row.variance === 0)).toBe(true);
  });

  it('uses a common dollar axis covering both target and current spend', () => {
    const rows = buildPayerComparison([{ payor: 'A', attributedLives: 1000, currentPmpm: 100, targetPmpm: 175 }]);
    expect(spendAxisMaximum(rows)).toBe(2500000);
    expect(spendAxisMaximum([])).toBe(1);
    expect(buildPayerComparison([])).toEqual([]);
  });
});
