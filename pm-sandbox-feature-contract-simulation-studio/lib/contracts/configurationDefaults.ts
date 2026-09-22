import { mockContracts } from "@/lib/mockData";
import type {
  ContractType as ExistingContractType,
} from "@/types/contract";
import type {
  ConfigContractType,
  ContractConfiguration,
  ContractFinancialTerms,
  ContractLineOfBusiness,
} from "@/types/contractConfiguration";

function mapLineOfBusiness(contractType?: ExistingContractType): ContractLineOfBusiness {
  if (contractType === "MSSP") return "mssp_aco";
  if (contractType === "Medicare Advantage") return "medicare_advantage";
  if (contractType === "Commercial") return "commercial";
  return "other";
}

function mapConfigContractType(contractType?: ExistingContractType): ConfigContractType {
  if (contractType === "MSSP" || contractType === "Medicare Advantage") return "two_sided_risk";
  if (contractType === "Commercial") return "pay_for_performance";
  return "other";
}

function defaultFinancialTerms(contractId: string): ContractFinancialTerms {
  return {
    contractId,
    qualityGateEnabled: false,
    settlementFrequency: "annual",
  };
}

export function createDefaultContractConfiguration(contractId: string): ContractConfiguration {
  const contract = mockContracts.find((item) => item.id === contractId);

  return {
    contractId,
    basics: {
      name: contract?.name ?? "",
      payer: contract?.payor ?? "",
      lineOfBusiness: mapLineOfBusiness(contract?.contractType),
      contractType: mapConfigContractType(contract?.contractType),
      startDate: "",
      endDate: "",
      performanceYear: undefined,
      attributionMethod: "",
      eligiblePopulationNote: "",
    },
    selectedMetrics: [],
    metricTargets: [],
    incentiveRules: [],
    financialTerms: defaultFinancialTerms(contractId),
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}
