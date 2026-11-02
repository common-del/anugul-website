import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Crumb } from "@/lib/seo";

// Visible breadcrumb trail. Mirrors the BreadcrumbList JSON-LD (both build from
// the same crumbs), and doubles as internal links up the hierarchy
// (school -> block -> district -> home). The last crumb is the current page.
export default function Breadcrumbs({
  crumbs,
  locale,
}: {
  crumbs: Crumb[];
  locale: Locale;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-x-1.5">
              {last ? (
                <span aria-current="page" className="font-semibold text-gov-ink">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={`/${locale}/${c.path}`} className="hover:text-gov hover:underline">
                    {c.name}
                  </Link>
                  <span aria-hidden className="text-gov-line">
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
