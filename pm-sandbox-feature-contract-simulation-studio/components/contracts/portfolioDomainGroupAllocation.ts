import type { ScorecardDomainGroup } from "@/components/contracts/domainGroups";

export interface AllocatedPortfolioDomainGroup {
  group: ScorecardDomainGroup;
  allocatedNetSettlement: number;
  allocatedSharedSavings: number;
  achievedDollars: number;
  potentialDollars: number;
  remainingOpportunity: number;
}

function allocateAmountByBudgetedShare(groups: ScorecardDomainGroup[], amount: number) {
  if (!groups.length) return [];

  const totalBudgeted = groups.reduce((sum, group) => sum + group.potentialDollars, 0);
  let allocatedSoFar = 0;

  return groups.map((group, index) => {
    if (index === groups.length - 1) {
      return amount - allocatedSoFar;
    }

    const share = totalBudgeted > 0 ? group.potentialDollars / totalBudgeted : 1 / groups.length;
    const allocation = amount * share;
    allocatedSoFar += allocation;
    return allocation;
  });
}

export function allocatePortfolioDomainGroupValues(params: {
  groups: ScorecardDomainGroup[];
  netSettlement: number;
  potentialSharedSavings: number;
}): AllocatedPortfolioDomainGroup[] {
  const { groups, netSettlement, potentialSharedSavings } = params;
  const settlementAllocations = allocateAmountByBudgetedShare(groups, netSettlement);
  const sharedSavingsAllocations = allocateAmountByBudgetedShare(groups, potentialSharedSavings);

  return groups.map((group, index) => {
    const allocatedNetSettlement = settlementAllocations[index] ?? 0;
    const allocatedSharedSavings = sharedSavingsAllocations[index] ?? 0;
    const achievedDollars = group.achievedDollars + allocatedNetSettlement;
    const potentialDollars = group.potentialDollars + allocatedSharedSavings;

    return {
      group,
      allocatedNetSettlement,
      allocatedSharedSavings,
      achievedDollars,
      potentialDollars,
      remainingOpportunity: Math.max(0, potentialDollars - achievedDollars),
    };
  });
}
