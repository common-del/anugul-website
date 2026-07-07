import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function Page({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  const paras = [v.privacyP1, v.privacyP2, v.privacyP3];
  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.privacy}
        </h1>
        <div className="mt-4 space-y-4">
          {paras.map((p, i) => (
            <p key={i} className="leading-relaxed text-gov-ink">
              {p}
            </p>
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
