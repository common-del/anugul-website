import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/dict";
import LanguageToggle from "./LanguageToggle";
import BackButton from "./BackButton";
import HelpMenu from "./HelpMenu";
import MobileMenu from "./MobileMenu";

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
    // Pinned chrome (mock-up correction): masthead + menu bar stay fixed at
    // the top of the viewport on every screen; only the content scrolls.
    // z-40 keeps it under the report-card lightbox overlay (z-50).
    <header className="no-print sticky top-0 z-40">
      <div className="border-b border-gov-line bg-gov-masthead shadow-header">
        {/* Mobile: row 1 = logo + language toggle + hamburger, row 2 = role
            selector (full width). Desktop (sm+): one row, roles + toggle
            clustered right and the hamburger hidden. order-* swaps the visual
            order per breakpoint. */}
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-y-2 px-4 py-2.5">
          <Link
            href={`/${locale}/`}
            aria-label={t.site.name}
            className="order-1 flex min-w-0 flex-1 items-center gap-2.5 sm:mr-auto sm:flex-initial"
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

          <div className="order-2 ml-3 shrink-0 sm:order-4">
            <LanguageToggle current={locale} />
          </div>

          {/* Hamburger — mobile only; opens the right-side nav drawer. */}
          <div className="order-3 ml-1 shrink-0 sm:hidden">
            <MobileMenu
              active={active}
              items={[
                { key: "home", href: `/${locale}/`, label: v.navHome },
                { key: "reports", href: `/${locale}/gov/`, label: v.navReports },
              ]}
              helpLabel={v.navHelp}
              helpItems={[
                { href: `/${locale}/faq/`, label: v.helpFaqs },
                { href: `/${locale}/contact/`, label: v.helpContact },
                { href: `/${locale}/resources/`, label: v.helpResources },
              ]}
              menuLabel={v.menu}
              closeLabel={v.filmClose}
            />
          </div>

          <div className="order-4 flex w-full items-center gap-x-3 sm:order-3 sm:ml-3 sm:w-auto">
            <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-gov sm:inline">
              {v.iAmA}
            </span>
            {/* Segmented control: one connected pill, thin dividers between
                options; selected = coral fill + dark ink (matches the language
                toggle), unselected = transparent + dark slate. Full width on
                mobile (equal thirds), content width on desktop. */}
            <nav
              className="flex w-full max-w-full items-stretch overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-gov-line sm:inline-flex sm:w-auto"
              aria-label={v.iAmA}
            >
              {roles.map((r, i) => (
                <Link
                  key={r.href}
                  href={r.href}
                  aria-current={r.current ? "page" : undefined}
                  className={`flex min-h-[38px] flex-1 items-center justify-center whitespace-nowrap px-3 text-[13px] font-bold transition-colors sm:flex-none sm:justify-start sm:px-4 sm:text-[13.5px] ${
                    i > 0 ? "border-l border-gov-line" : ""
                  } ${
                    r.current
                      ? "bg-accent text-gov-ink"
                      : "bg-transparent text-gov-dark hover:bg-gov-tint"
                  }`}
                >
                  {r.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Dark-green title bar. On mobile the primary nav moves into the drawer,
          so this bar shows only when there's a Back button; on sm+ it always
          shows the Home | Reports | Help ▾ nav. */}
      <div className={`${showBack ? "" : "hidden sm:block"} bg-gov-nav`}>
        <nav
          className="mx-auto flex w-full max-w-5xl items-stretch px-2 font-semibold"
          aria-label={v.navHome}
        >
          {showBack && (
            <span className="flex items-center pl-2 pr-1">
              <BackButton label={t.back} />
            </span>
          )}
          {/* Primary nav: desktop only — mobile uses the MobileMenu drawer. */}
          <div className="hidden items-stretch sm:flex">
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
          </div>
        </nav>
      </div>
    </header>
  );
}
