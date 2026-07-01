import { notFound } from "next/navigation";
import PhoneFrame from "@/components/PhoneFrame";
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
    <PhoneFrame>
      <SiteHeader locale={locale} t={t} />
      <main>
        <Hero locale={locale} t={t} />
        <WatchCard
          kicker={t.home.watch.kicker}
          title={t.home.watch.title}
          cta={t.home.watch.cta}
          minutes={t.home.watch.minutes}
          videoId="NXSC0xkwUc8"
        />
      </main>
      <SiteFooter locale={locale} t={t} />
    </PhoneFrame>
  );
}
