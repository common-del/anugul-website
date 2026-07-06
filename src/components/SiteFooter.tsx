import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dict";

// v2 footer (docx mock): deep green — department identity, trust badges,
// Privacy / Terms / Accessibility / Contact links.
// Social icons deferred until real account URLs are supplied.
export default function SiteFooter({
  locale,
  t,
}: {
  locale: Locale;
  t: Messages;
}) {
  const v = t.v2;
  const badges = [
    {
      label: v.badge1,
      d: "M20 6L9 17l-5-5", // check
    },
    {
      label: v.badge2,
      d: "M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8L12 2z", // star
    },
    {
      label: v.badge3,
      d: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21v-1a6 6 0 0112 0v1", // people
    },
  ];
  const links = [
    { href: `/${locale}/privacy/`, label: v.privacy },
    { href: `/${locale}/terms/`, label: v.terms },
    { href: `/${locale}/accessibility/`, label: v.accessibility },
    { href: `/${locale}/contact/`, label: v.helpContact },
  ];

  return (
    <footer className="no-print mt-6 bg-gov-deep text-white">
      <div className="mx-auto w-full max-w-5xl px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/seal-of-odisha.svg"
                alt="Government of Odisha"
                className="h-9 w-9 object-contain"
              />
            </span>
            <span>
              <span className="block text-sm font-bold leading-snug">
                {v.deptName}
              </span>
              <span className="block text-xs text-white/75">{v.govOdisha}</span>
            </span>
          </div>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {badges.map((b) => (
              <li key={b.label} className="flex items-center gap-2 text-[13px] font-semibold">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="shrink-0 text-white/85"
                >
                  <path d={b.d} />
                </svg>
                {b.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/15 pt-4">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
          <p className="text-xs text-white/60">{t.site.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
