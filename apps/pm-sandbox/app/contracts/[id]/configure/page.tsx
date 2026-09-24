import FeatureGuard from "@/components/FeatureGuard";
import ContractConfigurationBuilder from "@/components/contracts/ContractConfigurationBuilder";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractConfigurationPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <FeatureGuard page="contracts">
      <ContractConfigurationBuilder contractId={id} />
    </FeatureGuard>
  );
}
