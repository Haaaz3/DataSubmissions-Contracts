"use client";

import { usePathname } from "next/navigation";

export default function AppShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  const pathname = usePathname();
  const isPortfolioScorecardsPage = pathname === "/scorecards";
  const widthClass = isPortfolioScorecardsPage || wide ? "max-w-none" : "max-w-7xl";
  const paddingClass = wide ? "px-3 sm:px-5 lg:px-6" : "px-4 sm:px-6 lg:px-8";

  return (
    <div className={`mx-auto w-full ${widthClass} ${paddingClass} py-6 pb-24`}>
      <main className="min-w-0 space-y-5">{children}</main>
    </div>
  );
}
