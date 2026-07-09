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
          <section className="flex flex-col justify-center gov-card p-6">
            <h1 className="text-[27px] font-extrabold leading-tight text-gov-ink">
              {v.heroTitle}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-muted">
              {v.heroDesc}
            </p>
            {/* Two full-width stacked buttons: Find (primary), Explore (secondary). */}
            <Link
              href={`/${locale}/find/`}
              className="mt-5 flex min-h-[56px] w-full items-center justify-center rounded-xl bg-gov px-6 text-[17px] font-extrabold text-white shadow-sm transition hover:shadow-lift active:brightness-110"
            >
              {v.findSchool}
            </Link>
            <Link
              href={`/${locale}/gov/`}
              className="mt-3 flex min-h-[56px] w-full items-center justify-center rounded-xl border-2 border-gov bg-white px-6 text-[17px] font-bold text-gov transition hover:bg-gov-tint"
            >
              {v.exploreReports}
            </Link>
          </section>

          {/* awareness film — autoplays muted, closable */}
          <AwarenessFilm
            videoId="txr94hVoMWo"
            title={v.awarenessFilm}
            desc={v.filmDesc}
            minutes={v.filmMinutes}
          />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
