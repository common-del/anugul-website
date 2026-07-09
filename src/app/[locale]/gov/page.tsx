import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BlockReportsCard from "@/components/BlockReportsCard";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getBlockSlugs } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Unified reports landing (mock-up Screen 5): "Explore Reports" on Home, the
// "Reports" nav item, and the Govt/Orgs role all lead HERE. About SAKSHAM up
// top, then two equal cards — Block Reports (block chooser) and District
// Report (/gov/district) — and the standard disclaimer line.
export default function GovPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  const blocks = getBlockSlugs();

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack active="reports" role="researcher" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* About SAKSHAM */}
        <section className="gov-card p-5">
          <h1 className="text-xl font-extrabold leading-tight text-gov-ink">
            {v.govAboutT}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-gov-ink">
            {v.govAboutBody}
          </p>
          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-gov underline underline-offset-2 [&::-webkit-details-marker]:hidden">
              {v.govAboutMore}
              <span aria-hidden className="transition-transform group-open:rotate-90">›</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {v.govAboutMoreBody}
            </p>
          </details>
        </section>

        {/* What would you like to explore? */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-extrabold leading-tight text-gov-ink">
            {v.govExploreT}
          </h2>
          <p className="mt-1 text-muted">{v.govExploreSub}</p>
        </div>

        <div className="mx-auto mt-5 grid max-w-3xl gap-4 sm:grid-cols-2">
          {/* Block Reports — button-driven 8-block chooser (client component;
              a native <details> here was reported broken on some browsers) */}
          <BlockReportsCard
            locale={locale}
            blocks={blocks}
            labels={{ title: v.govBlockCardT, desc: v.govBlockCardD, choose: v.govChooseBlock }}
          />

          {/* District Report */}
          <Link
            href={`/${locale}/gov/district/`}
            className="gov-card-link flex flex-col items-center gap-3 p-6 text-center"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gov-tint text-gov">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 20l-5.5-2.5V4L9 6.5 15 4l5.5 2.5V20L15 17.5 9 20z" />
                <path d="M9 6.5V20M15 4v13.5" />
              </svg>
            </span>
            <span className="text-lg font-extrabold text-gov-ink">{v.govDistrictCardT}</span>
            <span className="text-sm text-muted">{v.govDistrictCardD}</span>
            <span aria-hidden className="mt-auto grid h-9 w-9 place-items-center rounded-full bg-gov text-white">
              →
            </span>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-muted">{v.govDisclaimer}</p>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
