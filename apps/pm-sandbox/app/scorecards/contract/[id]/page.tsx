import { redirect } from "next/navigation";

// Preserve links from the main baseline while using the feature branch scorecard.
export default async function LegacyContractScorecard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/contracts/${encodeURIComponent(id)}/scorecard`);
}
