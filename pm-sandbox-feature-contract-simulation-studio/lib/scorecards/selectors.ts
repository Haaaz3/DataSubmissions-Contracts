import type { Contract, ContractAgreement, InsuranceSegment, VbcContractModel } from "@/types/contract";
import type { ScorecardScopeType } from "@/types/scorecardScope";

export interface ContractGroup {
  id: string;
  label: string;
  contracts: Contract[];
}

export function getPortfolioContracts(params: {
  agreements: ContractAgreement[];
  draftContracts?: Contract[];
}) {
  const fromAgreements = params.agreements.flatMap((agreement) => agreement.contracts);
  const byId = new Map<string, Contract>();

  [...fromAgreements, ...(params.draftContracts ?? [])].forEach((contract) => {
    byId.set(contract.id, contract);
  });

  return Array.from(byId.values());
}

export function inferInsuranceSegment(contract: Contract): InsuranceSegment | "Unassigned Segment" {
  if (contract.insuranceSegment) return contract.insuranceSegment;
  if (contract.contractType === "Medicare Advantage") return "MA";
  if (contract.contractType === "MSSP") return "Medicare";
  if (/medicaid/i.test(contract.payor)) return "Medicaid";
  if (/aca/i.test(contract.payor)) return "ACA";
  if (contract.contractType === "Commercial") return "Commercial";
  return "Unassigned Segment";
}

export function resolveVbcContractModel(contract: Contract): VbcContractModel | "Unassigned Contract Type" {
  if (contract.vbcContractModel) return contract.vbcContractModel;

  const terms = contract.vbcTerms;
  if (!terms) return "Unassigned Contract Type";
  if (!terms.sharedSavings) return "Pay for Performance";
  if (!terms.sharedRisk) return "Shared Savings";
  if (terms.sharedRiskRate >= 60 || terms.downsideRiskCap >= 10) return "Full Risk";
  return "Shared Risk";
}

function groupContractsByLabel(contracts: Contract[], labelForContract: (contract: Contract) => string): ContractGroup[] {
  const groups = new Map<string, Contract[]>();

  contracts.forEach((contract) => {
    const key = labelForContract(contract);
    const current = groups.get(key) ?? [];
    current.push(contract);
    groups.set(key, current);
  });

  return Array.from(groups.entries())
    .map(([key, items]) => ({ id: key, label: key, contracts: items }))
    .sort((a, b) => b.contracts.reduce((sum, c) => sum + c.attributedLives, 0) - a.contracts.reduce((sum, c) => sum + c.attributedLives, 0));
}

export function getContractsForScope(params: {
  scopeType: ScorecardScopeType;
  scopeId?: string;
  contracts: Contract[];
  agreements: ContractAgreement[];
}) {
  const { scopeId, scopeType, contracts, agreements } = params;
  if (!scopeId || scopeType === "portfolio") return contracts;

  if (scopeType === "contract") {
    return contracts.filter((contract) => contract.id === scopeId);
  }

  if (scopeType === "agreement") {
    const agreement = agreements.find((item) => item.id === scopeId);
    return agreement?.contracts ?? [];
  }

  if (scopeType === "payor") {
    return contracts.filter((contract) => contract.payor === scopeId);
  }

  if (scopeType === "insuranceSegment") {
    return contracts.filter((contract) => inferInsuranceSegment(contract) === scopeId);
  }

  if (scopeType === "contractType") {
    return contracts.filter((contract) => resolveVbcContractModel(contract) === scopeId);
  }

  if (scopeType === "region") {
    return contracts.filter((contract) => contract.region === scopeId);
  }

  if (scopeType === "market") {
    return contracts.filter((contract) => contract.market === scopeId);
  }

  return contracts;
}

export function groupContractsByPayor(contracts: Contract[]): ContractGroup[] {
  return groupContractsByLabel(contracts, (contract) => contract.payor || "Unknown Payor");
}

export function groupContractsByAgreement(agreements: ContractAgreement[], draftContracts: Contract[] = []): ContractGroup[] {
  const baseGroups = agreements.map((agreement) => ({
    id: agreement.id,
    label: agreement.name,
    contracts: agreement.contracts,
  }));

  if (!draftContracts.length) return baseGroups;

  return [
    ...baseGroups,
    {
      id: "vbca-unassigned-drafts",
      label: "Draft Contracts (Unassigned Agreement)",
      contracts: draftContracts,
    },
  ];
}

export function groupContractsByRegion(contracts: Contract[]): ContractGroup[] {
  return groupContractsByLabel(contracts, (contract) => contract.region ?? "Unassigned Region");
}

export function groupContractsByMarket(contracts: Contract[]): ContractGroup[] {
  return groupContractsByLabel(contracts, (contract) => contract.market ?? "Unassigned Market");
}

export function groupContractsByInsuranceSegment(contracts: Contract[]): ContractGroup[] {
  return groupContractsByLabel(contracts, inferInsuranceSegment);
}

export function groupContractsByContractType(contracts: Contract[]): ContractGroup[] {
  return groupContractsByLabel(contracts, resolveVbcContractModel);
}

export function groupContractsByContract(contracts: Contract[]): ContractGroup[] {
  return contracts.map((contract) => ({
    id: contract.id,
    label: contract.name,
    contracts: [contract],
  }));
}
