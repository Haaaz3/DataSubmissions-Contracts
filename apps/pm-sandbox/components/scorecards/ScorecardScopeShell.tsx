import Link from "next/link";
import ScorecardBreadcrumbs, { type ScorecardBreadcrumbItem } from "@/components/scorecards/ScorecardBreadcrumbs";

export default function ScorecardScopeShell({
  backHref,
  backLabel,
  breadcrumbs,
  hero,
  children,
}: {
  backHref: string;
  backLabel: string;
  breadcrumbs?: ScorecardBreadcrumbItem[];
  hero: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        {breadcrumbs && breadcrumbs.length > 0 && <ScorecardBreadcrumbs items={breadcrumbs} />}
        <Link href={backHref} className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900">
          ← {backLabel}
        </Link>
      </div>

      {hero}

      {children}
    </div>
  );
}
