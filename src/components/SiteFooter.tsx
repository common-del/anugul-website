import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dict";

export default function SiteFooter({
  locale,
  t,
}: {
  locale: Locale;
  t: Messages;
}) {
  return (
    <footer className="no-print mt-2 border-t border-brand-line bg-white px-5 py-6 text-center">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/${locale}/about-saksham/`}
          className="text-sm font-semibold text-brand underline underline-offset-2"
        >
          {t.footerLinks.aboutSaksham}
        </Link>
        <a
          href="https://en.wikipedia.org/wiki/Angul_district"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-brand underline underline-offset-2"
        >
          {t.footerLinks.aboutAngul}
        </a>
      </div>
      <p className="mt-4 text-xs text-muted">{t.site.copyright}</p>
      {/* No visible link to the officials view (/roles, /analytics) — parents
          shouldn't stumble on it; officials reach it via a shared URL. */}
    </footer>
  );
}
