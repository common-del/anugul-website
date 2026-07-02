import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import WatchCard from "@/components/WatchCard";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} />
      <main className="mx-auto w-full max-w-5xl flex-1">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-8 lg:py-6">
          <Hero locale={locale} t={t} />
          <WatchCard
            kicker={t.home.watch.kicker}
            title={t.home.watch.title}
            cta={t.home.watch.cta}
            minutes={t.home.watch.minutes}
            videoId="NXSC0xkwUc8"
          />
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
