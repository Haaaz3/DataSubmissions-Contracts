import ContractListClient from "@/components/ContractListClient";
import FeatureGuard from "@/components/FeatureGuard";
import { warmContractDerivedSnapshots } from "@/lib/contracts/derivedSnapshot";
import { mockContractAgreements } from "@/lib/mockData";

export default function ContractsPage() {
  warmContractDerivedSnapshots();

  return (
    <FeatureGuard page="contracts">
      <ContractListClient mockAgreements={mockContractAgreements} />
    </FeatureGuard>
  );
}
