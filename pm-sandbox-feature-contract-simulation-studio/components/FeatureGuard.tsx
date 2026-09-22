"use client";

import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import { PageFeatureKey } from "@/lib/featureFlags";

export default function FeatureGuard({
  page,
  children,
}: {
  page: PageFeatureKey;
  children: React.ReactNode;
}) {
  const { isPageEnabled } = useFeatureFlags();

  if (!isPageEnabled(page)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Feature disabled</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">This page is currently hidden</h1>
        <p className="mt-2 text-sm text-slate-500">
          Use the Feature Controls panel to re-enable {page.replace(/([A-Z])/g, " $1").toLowerCase()}.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}