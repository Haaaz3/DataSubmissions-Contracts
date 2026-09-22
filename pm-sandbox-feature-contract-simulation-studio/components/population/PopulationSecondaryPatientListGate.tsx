"use client";

import { useFeatureFlags } from "@/components/FeatureFlagsProvider";

export default function PopulationSecondaryPatientListGate({ children }: { children: React.ReactNode }) {
  const { flags } = useFeatureFlags();

  if (!flags.sections.contractPopulationSecondaryPatientList) return null;

  return <>{children}</>;
}
