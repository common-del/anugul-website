import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const ROLE_KEYS = ["schoolHead", "villageHead", "blockOfficer", "others"] as const;

// Off-parent-path page for school heads, leaders and partners. Reached via a
// quiet footer link, not from the parent journey.
export default function RolesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {t.roles.pageTitle}
        </h1>
        <p className="mt-2 text-muted">{t.roles.pageIntro}</p>

        <ul className="mt-4 space-y-3">
          {ROLE_KEYS.map((k) => {
            const r = t.roles[k];
            const href =
              k === "blockOfficer" || k === "others"
                ? `/${locale}/analytics/`
                : `/${locale}/find/`;
            return (
              <li
                key={k}
                className="rounded-2xl border border-brand-line bg-white p-4"
              >
                <p className="font-bold text-brand-ink">{r.label}</p>
                <p className="mt-1 text-sm text-muted">{r.text}</p>
                <Link
                  href={href}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-1 font-bold text-brand"
                >
                  {r.cta} <span aria-hidden>→</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href={`/${locale}/`}
          className="mt-5 inline-block text-sm font-semibold text-brand underline underline-offset-2"
        >
          {t.roles.backToParent}
        </Link>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
