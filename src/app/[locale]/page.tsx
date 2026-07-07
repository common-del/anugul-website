import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AwarenessFilm from "@/components/AwarenessFilm";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// v2 home: hero with "Schools near me" (GPS) as the primary path, awareness
// film autoplaying with a Close control. The "Who are you?" tiles were dropped
// — the role selector already sits in the header.
export default function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} active="home" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        <div className="space-y-5 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-6 lg:space-y-0">
          {/* hero */}
          <section className="flex flex-col justify-center rounded-2xl border border-gov-line bg-white p-6 shadow-sm">
            <h1 className="text-[27px] font-extrabold leading-tight text-gov-ink">
              {v.heroTitle}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              {v.heroDesc}
            </p>
            <Link
              href={`/${locale}/find/?near=1`}
              className="mt-5 flex min-h-[60px] items-center justify-center gap-2.5 rounded-xl bg-gov px-6 text-[18px] font-extrabold text-white shadow-sm active:brightness-110"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {v.nearMe}
            </Link>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/find/`}
                className="flex min-h-[50px] flex-1 items-center justify-center rounded-xl border-2 border-gov px-5 text-[15px] font-bold text-gov"
              >
                {v.findSchool}
              </Link>
              <Link
                href={`/${locale}/reports/`}
                className="flex min-h-[50px] flex-1 items-center justify-center rounded-xl border-2 border-gov px-5 text-[15px] font-bold text-gov"
              >
                {v.exploreReports}
              </Link>
            </div>
          </section>

          {/* awareness film — autoplays muted, closable */}
          <AwarenessFilm
            videoId="txr94hVoMWo"
            title={v.awarenessFilm}
            closeLabel={v.filmClose}
            minutes={v.filmMinutes}
          />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
