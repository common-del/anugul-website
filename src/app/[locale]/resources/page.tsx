import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VideoEmbed from "@/components/VideoEmbed";
import ExplainerVideos from "@/components/ExplainerVideos";
import { getBlockSlugs } from "@/lib/officialsData";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Resources: Videos · Methodology · Downloads · What you can do, as tap-to-open
// cards. Section subheadings removed (owner 2026-07-21); the explainer video is
// block-aware; downloads are grouped district-first; the old "Toolkit" content
// now lives under "What you can do".
export default function ResourcesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const v = t.v2;
  const blockNames = getBlockSlugs().map((b) => b.name);

  const card = "group gov-card";
  const summary = "flex cursor-pointer items-center justify-between gap-3 p-5";
  const chev = "shrink-0 text-gov transition-transform group-open:rotate-45";

  type Kind = "download" | "view" | "link";
  const dlLink = (href: string, label: string, kind: Kind) =>
    kind === "download" ? (
      <a href={href} download className="font-semibold text-gov underline underline-offset-2">
        {label} ↓
      </a>
    ) : kind === "view" ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-gov underline underline-offset-2">
        {label} ↗
      </a>
    ) : (
      <Link href={href} className="font-semibold text-gov underline underline-offset-2">
        {label} →
      </Link>
    );

  const districtDownloads: [string, string, Kind][] = [
    ["/block-report/?block=District", v.dlDistPdfT, "view"],
    ["/data/downloads/district_report.xlsx", v.dlDistXlsxT, "download"],
    ["/data/downloads/learning_outcomes_report.pdf", v.dlLor, "download"],
    ["/data/downloads/learning_outcomes.csv", v.dlLorCsv, "download"],
    ["/data/downloads/misconceptions_report.pdf", v.dlMisPdfT, "download"],
  ];
  const blockDownloads: [string, string, Kind][] = [
    [`/${locale}/gov/`, v.govBlockCardT, "link"],
    ["/data/downloads/block_aggregates.csv", v.dlBlocks, "download"],
  ];

  return (
    <PageShell zone="full">
      <SiteHeader locale={locale} t={t} showBack />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-extrabold leading-tight text-gov-ink">
          {v.resTitle}
        </h1>

        <div className="mt-5 space-y-3">
          {/* Videos */}
          <details className={card} open>
            <summary className={summary}>
              <span className="font-extrabold text-gov-ink">{v.resVideosT}</span>
              <span aria-hidden className={chev}>+</span>
            </summary>
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <figure>
                <VideoEmbed videoId="txr94hVoMWo" title={v.resAwarenessFilm} />
                <figcaption className="mt-1.5 text-sm font-semibold text-gov-ink">
                  {v.resAwarenessFilm}
                </figcaption>
              </figure>
              <ExplainerVideos
                blocks={blockNames}
                chooseLabel={v.govChooseBlock}
                title={v.resExplainer}
              />
            </div>
          </details>

          {/* Methodology */}
          <details className={card}>
            <summary className={summary}>
              <span className="font-extrabold text-gov-ink">{v.resMethodT}</span>
              <span aria-hidden className={chev}>+</span>
            </summary>
            <div className="space-y-3 px-5 pb-5 text-[15px] leading-relaxed text-muted">
              <p>{v.methodP1}</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>{v.methodG5}</li>
                <li>{v.methodG8}</li>
              </ul>
              <p>{v.methodP2}</p>
              <p>{v.methodP3}</p>
              <p>{v.methodP4}</p>
            </div>
          </details>

          {/* Downloads — district first, then block */}
          <details className={card}>
            <summary className={summary}>
              <span className="font-extrabold text-gov-ink">{v.resDownloadsT}</span>
              <span aria-hidden className={chev}>+</span>
            </summary>
            <div className="space-y-4 px-5 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  {v.dlGroupDistrict}
                </p>
                <ul className="mt-2 space-y-2">
                  {districtDownloads.map(([href, label, kind]) => (
                    <li key={label}>{dlLink(href, label, kind)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  {v.dlGroupBlock}
                </p>
                <ul className="mt-2 space-y-2">
                  {blockDownloads.map(([href, label, kind]) => (
                    <li key={label}>{dlLink(href, label, kind)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </details>

          {/* What you can do (was Toolkit) */}
          <details className={card}>
            <summary className={summary}>
              <span className="font-extrabold text-gov-ink">{v.whatYouCanDo}</span>
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
