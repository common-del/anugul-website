import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dict";

// v2 footer (mock-up correction): a single slim row, height matching the nav
// bar. Left = FAQs / Resources / Contact; right = Follow us + X. The green
// mid-band (department identity + trust badges) and the Privacy/Terms/
// Accessibility links were removed per the mock-up.
export default function SiteFooter({
  locale,
  t,
}: {
  locale: Locale;
  t: Messages;
}) {
  const v = t.v2;
  const links = [
    { href: `/${locale}/faq/`, label: v.helpFaqs },
    { href: `/${locale}/resources/`, label: v.helpResources },
    { href: `/${locale}/contact/`, label: v.helpContact },
  ];

  return (
    <footer className="no-print mt-6 bg-gov-footer text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-semibold text-white/85 underline-offset-2 hover:text-white hover:underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-white/85">
          {v.followUs}
          <a
            href="https://x.com/angul_dm"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Anugola on X"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
