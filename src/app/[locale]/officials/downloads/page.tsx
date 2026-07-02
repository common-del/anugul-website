import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function DownloadsPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  const files = [
    { href: "/data/downloads/block_aggregates.csv", label: o.dlBlocks },
    { href: "/data/downloads/cluster_league.csv", label: o.dlClusters },
    { href: "/data/downloads/items_clean.csv", label: o.dlItems },
  ];

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {o.downloadsTitle}
        </h1>
        <p className="mt-1 text-muted">{o.downloadsIntro}</p>
        <div className="mt-5 space-y-2">
          {files.map((f) => (
            <a
              key={f.href}
              href={f.href}
              download
              className="flex min-h-[52px] items-center justify-between rounded-xl border border-brand-line bg-white px-4 font-semibold text-brand"
            >
              {f.label} <span aria-hidden>↓</span>
            </a>
          ))}
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
