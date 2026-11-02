import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Single "Website Policies" page bundling privacy, copyright, terms,
// hyperlinking and accessibility (owner 2026-07-27 — the common India gov
// pattern). Replaces the former standalone /privacy/, /terms/, /accessibility/
// pages, which now redirect here (vercel.json).
export default function WebsitePoliciesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  const sections = [
    { id: "privacy", h: v.privacy, paras: [v.privacyP1, v.privacyP2, v.privacyCookies, v.privacyP3] },
    { id: "copyright", h: v.wpCopyrightH, paras: [v.copyP1, v.copyP2] },
    { id: "terms", h: v.terms, paras: [v.termsP1, v.termsP2, v.termsP3, v.termsP4] },
    { id: "hyperlinking", h: v.wpHyperlinkH, paras: [v.hyperP1, v.hyperP2] },
    { id: "accessibility", h: v.accessibility, paras: [v.a11yP1, v.a11yP2, v.a11yP3, v.a11yWcag, v.a11yReport] },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">{v.wpTitle}</h1>

        <nav className="mt-4 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-gov-line bg-white px-3 py-1 text-sm font-semibold text-gov hover:bg-gov-tint"
            >
              {s.h}
            </a>
          ))}
        </nav>

        <div className="mt-6 space-y-8">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-lg font-bold text-gov-ink">{s.h}</h2>
              <div className="mt-2 space-y-3">
                {s.paras.map((p, i) => (
                  <p key={i} className="leading-relaxed text-gov-ink">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
