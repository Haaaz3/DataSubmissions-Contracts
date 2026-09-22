"use client";

import dynamic from "next/dynamic";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";

const GlobalSynapseSearch = dynamic(() => import("@/components/synapseai/GlobalSynapseSearch"), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-full animate-pulse rounded-full border border-white/20 bg-white/10" />
  ),
});

export default function FeatureAwareSynapseSearch({
  variant = "default",
}: {
  variant?: "default" | "header";
}) {
  const { flags } = useFeatureFlags();
  if (!flags.synapseSearch) {
    return null;
  }
  return <GlobalSynapseSearch variant={variant} />;
}