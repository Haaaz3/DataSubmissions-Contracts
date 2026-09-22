import Link from "next/link";

export interface ScorecardBreadcrumbItem {
  label: string;
  href?: string;
}

export default function ScorecardBreadcrumbs({ items }: { items: ScorecardBreadcrumbItem[] }) {
  return (
    <nav aria-label="Scorecard breadcrumbs" className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
            {item.href && !isLast ? (
              <Link href={item.href} className="font-medium text-slate-500 hover:text-slate-800 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-slate-700" : "font-medium"}>{item.label}</span>
            )}
            {!isLast && <span className="text-slate-300">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
