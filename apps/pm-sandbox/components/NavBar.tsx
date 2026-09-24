"use client";

import Link from "next/link";
import FeatureAwareSynapseSearch from "@/components/FeatureAwareSynapseSearch";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function NavBar() {
  const { flags } = useFeatureFlags();

  return (
    <nav className="border-b border-slate-900/30 bg-[#005A74] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-xs font-semibold tracking-[0.2em]">
            OH
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/85">
              Oracle Health
            </p>
            <p className="text-base font-semibold">AI Data Platform</p>
          </div>
        </Link>

        {flags.topNavSearch ? (
          <div className="w-full max-w-4xl">
            <FeatureAwareSynapseSearch variant="header" />
          </div>
        ) : null}

        <ThemeSwitcher />
      </div>
    </nav>
  );
}
