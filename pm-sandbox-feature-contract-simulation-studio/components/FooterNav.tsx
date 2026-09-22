"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFeatureFlags } from "@/components/FeatureFlagsProvider";
import type { PageFeatureKey } from "@/lib/featureFlags";

const footerItems: { key: PageFeatureKey; label: string; href: string; icon: keyof typeof iconMap }[] = [
  { key: "dashboard", label: "Home", href: "/", icon: "home" },
  { key: "lifeSciences", label: "Life Sciences", href: "/life-sciences", icon: "beaker" },
  { key: "projects", label: "Projects", href: "/projects", icon: "chart" },
  { key: "workspaces", label: "Workspaces", href: "/workspaces", icon: "layers" },
  { key: "careManagement", label: "Care Mgmt", href: "/care-management", icon: "heart" },
  { key: "population", label: "Population", href: "/population", icon: "globe" },
  { key: "quality", label: "Quality", href: "/quality", icon: "check" },
  { key: "statewideOutcomesAccess", label: "Statewide", href: "/statewide-outcomes-access", icon: "gauge" },
  { key: "contracts", label: "Contracts", href: "/contracts", icon: "document" },
];

const iconMap = {
  home: (
    <path
      d="M4 10.5l8-6 8 6v7.5a2 2 0 0 1-2 2h-4.5a1 1 0 0 1-1-1v-4.5h-3V19a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-7.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  document: (
    <path
      d="M7 4.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  check: (
    <path
      d="M5.5 12.5l4.2 4.2L18.5 8.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  users: (
    <path
      d="M7.5 13.5a4 4 0 1 1 4-4 4 4 0 0 1-4 4zm9 1a3 3 0 1 1 3-3 3 3 0 0 1-3 3zM2.8 19.5a5.7 5.7 0 0 1 9.4 0M13.5 19.5a4.5 4.5 0 0 1 6.5-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  chart: (
    <path
      d="M5 19.5V10m5 9.5V6.5m5 13V12m5 7.5V9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  ),
  layers: (
    <path
      d="M12 4l8 4-8 4-8-4 8-4zm8 8-8 4-8-4m16 4-8 4-8-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  bolt: (
    <path
      d="M12.5 2.5L5.5 12h5l-1 9 7-10h-5l1-8.5z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  heart: (
    <path
      d="M12 20s-6.5-4.4-8.8-8.1C1.4 8.8 3 5.5 6.2 5.2c2-.2 3.2.9 4 2 0.8-1.1 2-2.2 4-2 3.2.3 4.8 3.6 3 6.7C18.5 15.6 12 20 12 20z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  globe: (
    <path
      d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zm-7.5 8.5h15M12 3.8c2.2 2.4 3.3 5.3 3.3 8.2 0 3-1.1 5.8-3.3 8.2m0-16.4c-2.2 2.4-3.3 5.3-3.3 8.2 0 3 1.1 5.8 3.3 8.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  gauge: (
    <path
      d="M4 15a8 8 0 1 1 16 0M12 12l3.5-3.5M12 16.5h.01"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  beaker: (
    <path
      d="M9 3.5h6M10 3.5v4.2l-4.8 8.1a2 2 0 0 0 1.7 3h10.2a2 2 0 0 0 1.7-3L14 7.7V3.5m-6.2 9h8.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export default function FooterNav() {
  const pathname = usePathname();
  const { isPageEnabled } = useFeatureFlags();

  return (
    <footer className="footer-nav fixed bottom-0 left-0 right-0 border-t border-[#084E63]/60 bg-[#005A74]/95 backdrop-blur">
      <nav
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 px-6 py-2 text-[11px] text-white"
        aria-label="Bottom navigation"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          {footerItems
            .filter((item) => isPageEnabled(item.key))
            .map((item) => {
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`footer-nav-item flex min-h-[40px] items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  isActive
                    ? "bg-white text-[#004356] shadow-sm"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-hidden="true"
                  focusable="false"
                >
                  {iconMap[item.icon]}
                </svg>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </footer>
  );
}