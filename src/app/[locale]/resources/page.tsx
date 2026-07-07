import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VideoEmbed from "@/components/VideoEmbed";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Resources (docx mock): Videos · Methodology · Downloads · Toolkit, as
// tap-to-open cards on one page.
export default function ResourcesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;

  const card = "group rounded-2xl border border-gov-line bg-white";
  const summary =
    "flex cursor-pointer items-start justify-between gap-3 p-5";
  const chev = "shrink-0 text-gov transition-transform group-open:rotate-45";

  return (
    <PageShell>
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.resTitle}
        </h1>
        <p className="mt-1 text-muted">{v.resIntro}</p>

        <div className="mt-5 space-y-3">
          {/* Videos */}
          <details className={card} open>
            <summary className={summary}>
              <span>
                <span className="block font-extrabold text-gov-ink">{v.resVideosT}</span>
                <span className="mt-0.5 block text-sm text-muted">{v.resVideosD}</span>
              </span>
              <span aria-hidden className={chev}>+</span>
            </summary>
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <figure>
                <VideoEmbed videoId="txr94hVoMWo" title={v.resAwarenessFilm} />
                <figcaption className="mt-1.5 text-sm font-semibold text-gov-ink">
                  {v.resAwarenessFilm}
                </figcaption>
              </figure>
              <figure>
                <VideoEmbed videoId="OcBdapIlGHM" title={v.resExplainer} />
                <figcaption className="mt-1.5 text-sm font-semibold text-gov-ink">
                  {v.resExplainer}
                </figcaption>
              </figure>
            </div>
          </details>

          {/* Methodology */}
          <details className={card}>
            <summary className={summary}>
              <span>
                <span className="block font-extrabold text-gov-ink">{v.resMethodT}</span>
                <span className="mt-0.5 block text-sm text-muted">{v.resMethodD}</span>
              </span>
              <span aria-hidden className={chev}>+</span>
            </summary>
            <div className="space-y-3 px-5 pb-5 text-[15px] leading-relaxed text-muted">
              <p>{v.methodP1}</p>
              <p>{v.methodP2}</p>
              <p>{v.methodP3}</p>
            </div>
          </details>

          {/* Downloads */}
          <details className={card}>
            <summary className={summary}>
              <span>
                <span className="block font-extrabold text-gov-ink">{v.resDownloadsT}</span>
                <span className="mt-0.5 block text-sm text-muted">{v.resDownloadsD}</span>
              </span>
              <span aria-hidden className={chev}>+</span>
            </summary>
            <ul className="space-y-2 px-5 pb-5">
              {[
                { href: "/data/downloads/learning_outcomes_report.pdf", label: v.dlLor, ext: true },
                { href: "/data/downloads/learning_outcomes.csv", label: v.dlLorCsv, ext: true },
                { href: "/data/downloads/block_aggregates.csv", label: v.dlBlocks, ext: true },
                { href: `/${locale}/reports/`, label: v.dlBlockCards, ext: false },
              ].map((d) =>
                d.ext ? (
                  <li key={d.href}>
                    <a href={d.href} download className="font-semibold text-gov underline underline-offset-2">
                      {d.label} ↓
                    </a>
                  </li>
                ) : (
                  <li key={d.href}>
                    <Link href={d.href} className="font-semibold text-gov underline underline-offset-2">
                      {d.label} →
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </details>

          {/* Toolkit */}
          <details className={card}>
            <summary className={summary}>
              <span>
                <span className="block font-extrabold text-gov-ink">{v.resToolkitT}</span>
                <span className="mt-0.5 block text-sm text-muted">{v.resToolkitD}</span>
              </span>
              <span aria-hidden className={chev}>+</span>
            </summary>
            <div className="px-5 pb-5">
              <p className="text-sm font-bold text-gov-ink">{v.toolkitStepsT}</p>
              <ul className="mt-2 space-y-2 text-[15px] text-gov-ink">
                {[v.toolkitS1, v.toolkitS2, v.toolkitS3].map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gov" />
                    {s}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm font-bold text-gov-ink">{v.toolkitHowT}</p>
              <ol className="mt-2 space-y-2 text-[15px] text-gov-ink">
                {[v.toolkitH1, v.toolkitH2, v.toolkitH3, v.toolkitH4].map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gov text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </details>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
