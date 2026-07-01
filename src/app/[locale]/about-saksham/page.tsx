import { notFound } from "next/navigation";
import PhoneFrame from "@/components/PhoneFrame";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// TODO: replace the placeholder body with the About SAKSHAM copy the client
// will provide (English + Odia). Copy lives in messages under `aboutSaksham`.
export default function AboutSakshamPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return (
    <PhoneFrame>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="px-5 py-6">
        <h1 className="text-2xl font-extrabold text-brand-ink">
          {t.aboutSaksham.title}
        </h1>
        <p className="mt-3 text-muted">{t.aboutSaksham.body}</p>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PhoneFrame>
  );
}
