import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";
import { getBlockSlugs, getClusterIndex } from "@/lib/officialsData";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function OfficialsHub({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const o = t.officials;
  const blocks = getBlockSlugs();
  const clusters = getClusterIndex();
  const byBlock = new Map<string, typeof clusters>();
  for (const c of clusters) {
    if (!byBlock.has(c.block)) byBlock.set(c.block, []);
    byBlock.get(c.block)!.push(c);
  }

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-ink">
          {o.hubTitle}
        </h1>
        <p className="mt-1 text-muted">{o.hubIntro}</p>

        <section className="mt-5">
          <h2 className="text-lg font-bold text-brand-ink">{o.hubBlocks}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {blocks.map((b) => (
              <Link
                key={b.slug}
                href={`/${locale}/officials/block/${b.slug}/`}
                className="min-h-[44px] rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand ring-1 ring-brand-line"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h2 className="text-lg font-bold text-brand-ink">{o.hubClusters}</h2>
          <div className="mt-2 space-y-2">
            {[...byBlock.entries()].map(([block, list]) => (
              <details key={block} className="rounded-xl border border-brand-line bg-white px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-brand-ink">
                  {block} · {list.length}
                </summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {list.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${locale}/officials/cluster/${c.slug}/`}
                      className="rounded-full bg-brand-tint px-3 py-1.5 text-xs font-semibold text-brand"
                    >
                      {c.cluster}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-5 space-y-2">
          {[
            { href: `/${locale}/analytics/`, label: t.analytics.title },
            { href: `/${locale}/officials/misconceptions/`, label: o.hubMisconceptions },
            { href: `/${locale}/officials/research/`, label: o.hubResearch },
            { href: `/${locale}/officials/methods/`, label: o.hubMethods },
            { href: `/${locale}/officials/downloads/`, label: o.hubDownloads },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-[52px] items-center justify-between rounded-xl border border-brand-line bg-white px-4 font-semibold text-brand-ink"
            >
              {l.label} <span aria-hidden>→</span>
            </Link>
          ))}
        </section>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
