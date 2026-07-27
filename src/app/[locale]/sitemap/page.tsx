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

export default function SitemapPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  const links: { href: string; label: string; external?: boolean }[] = [
    { href: `/${locale}/`, label: v.navHome },
    { href: `/${locale}/school-head/`, label: v.roleHead },
    { href: `/${locale}/gov/`, label: v.roleOrgs },
    { href: `/${locale}/faq/`, label: v.helpFaqs },
    { href: `/${locale}/resources/`, label: v.helpResources },
    { href: `/${locale}/contact/`, label: v.helpContact },
    { href: `/${locale}/feedback/`, label: v.footFeedback },
    { href: `/${locale}/website-policies/`, label: v.footPolicies },
    { href: "https://angul.nic.in/rti/", label: v.footRti, external: true },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">{v.sitemapTitle}</h1>
        <p className="mt-1 text-muted">{v.sitemapIntro}</p>
        <ul className="mt-5 space-y-2.5">
          {links.map((l) => (
            <li key={l.href} className="flex items-start gap-2">
              <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gov" />
              {l.external ? (
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-gov underline underline-offset-2 hover:text-gov-ink"
                >
                  {l.label} <span aria-hidden>↗</span>
                </a>
              ) : (
                <Link
                  href={l.href}
                  className="text-[15px] font-semibold text-gov underline underline-offset-2 hover:text-gov-ink"
                >
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
