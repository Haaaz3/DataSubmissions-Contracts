import Link from "next/link";

interface QuickLink {
  label: string;
  href: string;
}

export default function ContextualOraclePanel({
  contextLabel,
  title,
  description,
  quickLinks,
}: {
  contextLabel: string;
  title: string;
  description: string;
  quickLinks: QuickLink[];
}) {
  return (
    <aside className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">{contextLabel}</p>
      <h3 className="mt-2 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>

      {quickLinks.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Quick links</p>
          <ul className="mt-2 space-y-2">
            {quickLinks.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <Link href={link.href} className="text-xs font-semibold text-indigo-600 hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
