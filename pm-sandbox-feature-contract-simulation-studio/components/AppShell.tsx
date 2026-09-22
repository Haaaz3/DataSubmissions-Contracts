"use client";

import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPortfolioScorecardsPage = pathname === "/scorecards";
  const widthClass = isPortfolioScorecardsPage ? "max-w-none" : "max-w-7xl";

  return (
    <div className={`mx-auto w-full ${widthClass} px-4 py-6 pb-24 sm:px-6 lg:px-8`}>
      <main className="min-w-0 space-y-5">{children}</main>
    </div>
  );
}
