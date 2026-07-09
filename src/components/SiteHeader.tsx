import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dict";
import LanguageToggle from "./LanguageToggle";
import BackButton from "./BackButton";
import HelpMenu from "./HelpMenu";

// v2 header (docx mock): white masthead — logo, "Angul Schools" +
// "Government of Odisha", role selector (Parent, Government and Orgs),
// EN/ଓଡ଼ିଆ — then a dark-green title bar: Home | Reports | Help ▾.
// School Head / officer views stay on discreet URLs, not in the selector.
export default function SiteHeader({
  locale,
  t,
  showBack = false,
  active = "none",
  role = "parent",
}: {
  locale: Locale;
  t: Messages;
  showBack?: boolean;
  active?: "home" | "reports" | "none";
  role?: "parent" | "researcher" | "head" | "none";
}) {
  const v = t.v2;
  // Order per mock-up: Parent, School Head, Govt/Orgs (left to right).
  const roles = [
    { href: `/${locale}/`, label: v.roleParent, current: role === "parent" },
    { href: `/${locale}/school-head/`, label: v.roleHead, current: role === "head" },
    { href: `/${locale}/gov/`, label: v.roleOrgs, current: role === "researcher" },
  ];
  // TODO: replace seal with the School & Mass Education Dept logo when the
  // file is supplied (Drive link in the mock doc is not accessible here).
  return (
    <header className="no-print">
      <div className="border-b border-gov-line bg-gov-masthead shadow-header">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
          <Link
            href={`/${locale}/`}
            aria-label={t.site.name}
            className="flex min-w-0 items-center gap-2.5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-gov-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/odisha-logo.png"
                alt={v.govOdisha}
                className="h-9 w-9 object-contain"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-extrabold leading-tight text-gov-dark">
                {t.site.name}
              </span>
              <span className="block truncate text-[11.5px] leading-snug text-muted">
                {v.govOdisha}
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-gov sm:inline">
              {v.iAmA}
            </span>
            {/* Segmented control: one connected pill, thin dividers between
                options; selected = solid green fill + white, unselected =
                transparent + dark-green. */}
            <nav
              className="inline-flex items-stretch overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-gov-line"
              aria-label={v.iAmA}
            >
              {roles.map((r, i) => (
                <Link
                  key={r.href}
                  href={r.href}
                  aria-current={r.current ? "page" : undefined}
                  className={`flex min-h-[38px] items-center px-4 text-[13.5px] font-bold transition-colors ${
                    i > 0 ? "border-l border-gov-line" : ""
                  } ${
                    r.current
                      ? "bg-gov text-white"
                      : "bg-transparent text-gov-dark hover:bg-gov-tint"
                  }`}
                >
                  {r.label}
                </Link>
              ))}
            </nav>
            <LanguageToggle current={locale} />
          </div>
        </div>
      </div>

      <div className="bg-gov-nav">
        <nav
          className="mx-auto flex w-full max-w-5xl items-stretch px-2 font-semibold"
          aria-label={v.navHome}
        >
          {showBack && (
            <span className="flex items-center pl-2 pr-1">
              <BackButton label={t.back} />
            </span>
          )}
          <Link
            href={`/${locale}/`}
            className={`flex min-h-[48px] items-center border-b-[3px] px-4 text-[15px] ${
              active === "home"
                ? "border-accent text-white"
                : "border-transparent text-white/85 hover:text-white"
            }`}
          >
            {v.navHome}
          </Link>
          <Link
            href={`/${locale}/gov/`}
            className={`flex min-h-[48px] items-center border-b-[3px] px-4 text-[15px] ${
              active === "reports"
                ? "border-accent text-white"
                : "border-transparent text-white/85 hover:text-white"
            }`}
          >
            {v.navReports}
          </Link>
          <HelpMenu
            label={v.navHelp}
            items={[
              { href: `/${locale}/faq/`, label: v.helpFaqs },
              { href: `/${locale}/contact/`, label: v.helpContact },
              { href: `/${locale}/resources/`, label: v.helpResources },
            ]}
          />
        </nav>
      </div>
    </header>
  );
}
