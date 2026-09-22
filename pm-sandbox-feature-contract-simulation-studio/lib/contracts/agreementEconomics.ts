import { calculateEstimatedSettlement } from "@/lib/contracts/settlement";
import type { ContractAgreement } from "@/types/contract";
import type {
  AgreementFinancialContributionRow,
  AgreementFinancialContributionSummary,
  AgreementFinancialContributionSummaryInsight,
} from "@/types/contractInsights";

function estimatedBlockedSavingsForSettlement(
  settlement: ReturnType<typeof calculateEstimatedSettlement>
) {
  if (settlement.status !== "quality_blocked" || settlement.grossDeltaAmount <= 0) return 0;
  const savingsCapAmount = settlement.benchmarkSpend * (settlement.terms.sharedSavingsCap / 100);
  return Math.min(
    settlement.grossDeltaAmount * (settlement.terms.sharedSavingsRate / 100),
    savingsCapAmount
  );
}

export function getAgreementFinancialContribution(
  agreement: ContractAgreement
): AgreementFinancialContributionSummary {
  const totalLives = agreement.contracts.reduce((sum, contract) => sum + contract.attributedLives, 0);

  const baseRows: Omit<AgreementFinancialContributionRow, "exposureSharePercent">[] = agreement.contracts.map((contract) => {
    const settlement = calculateEstimatedSettlement(contract);
    const grossUpsideAmount = settlement.grossDeltaAmount > 0 ? settlement.grossDeltaAmount : 0;
    const grossDownsideAmount = settlement.grossDeltaAmount < 0 ? Math.abs(settlement.grossDeltaAmount) : 0;
    const qualityBlockedSavingsAmount = estimatedBlockedSavingsForSettlement(settlement);

    return {
      contractId: contract.id,
      contractName: contract.name,
      attributedLives: contract.attributedLives,
      livesSharePercent: totalLives > 0 ? (contract.attributedLives / totalLives) * 100 : 0,
      netSettlementEstimate: settlement.estimatedAmount,
      grossUpsideAmount,
      grossDownsideAmount,
      qualityBlockedSavingsAmount,
      financialStatus:
        qualityBlockedSavingsAmount > 0
          ? "blocked"
          : settlement.estimatedAmount > 0
          ? "upside"
          : settlement.estimatedAmount < 0
          ? "downside"
          : "neutral",
    };
  });

  const totalExposure = baseRows.reduce(
    (sum, row) => sum + row.grossDownsideAmount + row.qualityBlockedSavingsAmount,
    0
  );

  const rows: AgreementFinancialContributionRow[] = baseRows
    .map((row) => ({
      ...row,
      exposureSharePercent:
        totalExposure > 0
          ? ((row.grossDownsideAmount + row.qualityBlockedSavingsAmount) / totalExposure) * 100
          : 0,
    }))
    .sort(
      (a, b) =>
        b.grossDownsideAmount + b.qualityBlockedSavingsAmount -
        (a.grossDownsideAmount + a.qualityBlockedSavingsAmount)
    );

  const totalDownside = rows.reduce((sum, row) => sum + row.grossDownsideAmount, 0);
  const totalUpside = rows.reduce((sum, row) => sum + row.netSettlementEstimate, 0);
  const totalBlocked = rows.reduce((sum, row) => sum + row.qualityBlockedSavingsAmount, 0);
  const blockedContracts = rows.filter((row) => row.qualityBlockedSavingsAmount > 0).length;

  const topDownsideTwo = rows
    .slice()
    .sort((a, b) => b.grossDownsideAmount - a.grossDownsideAmount)
    .slice(0, 2);

  const topDownsideSum = topDownsideTwo.reduce((sum, row) => sum + row.grossDownsideAmount, 0);
  const downsideConcentration =
    totalDownside > 0 ? Math.round((topDownsideSum / totalDownside) * 100) : 0;

  const summaryInsights: AgreementFinancialContributionSummaryInsight[] = [
    {
      label: "Downside concentration",
      description:
        totalDownside > 0
          ? `${topDownsideTwo.length} contracts drive ${downsideConcentration}% of downside exposure.`
          : "No downside exposure identified across current agreement contracts.",
      tone: totalDownside > 0 ? "warning" : "positive",
    },
    {
      label: "Quality-blocked savings",
      description:
        totalBlocked > 0
          ? `${blockedContracts} contract${blockedContracts === 1 ? " is" : "s are"} currently blocking ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }).format(totalBlocked)} in modeled settlement value.`
          : "No contracts currently blocked by quality gate requirements.",
      tone: totalBlocked > 0 ? "danger" : "positive",
    },
    {
      label: "Net financial posture",
      description: `Agreement-wide net settlement estimate is ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
        signDisplay: "always",
      }).format(totalUpside)}.`,
      tone: totalUpside >= 0 ? "positive" : "danger",
    },
  ];

  return {
    agreementId: agreement.id,
    agreementName: agreement.name,
    rows,
    summaryInsights,
  };
}
