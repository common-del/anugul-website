import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VideoEmbed from "@/components/VideoEmbed";
import ExplainerVideos from "@/components/ExplainerVideos";
import { getBlockSlugs, blockReportUrl } from "@/lib/officialsData";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDict } from "@/lib/i18n/dict";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Kind = "download" | "view" | "link";
type DL = [href: string, label: string, kind: Kind, icon: string];

// download-button icons
const IC_CHART = "M4 20V10M10 20V4M16 20v-9M20 20H4";
const IC_GRID = "M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18";
const IC_FILE = "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h5";
const IC_SEARCH = "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-4.35-4.35";
const IC_BLOCKS = "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z";

// Resources: Videos · Methodology · Downloads, as tap-to-open cards. Downloads
// are icon control-buttons grouped district-first. (The old Toolkit /
// "What you can do" content moved to the parent report card — owner 2026-07-21.)
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

  const districtDownloads: DL[] = [
    ["/block-report/?block=District", v.dlDistPdfT, "view", IC_CHART],
    ["/data/downloads/district_report.xlsx", v.dlDistXlsxT, "download", IC_GRID],
    ["/data/downloads/learning_outcomes_report.pdf", v.dlLor, "download", IC_FILE],
    ["/data/downloads/learning_outcomes.csv", v.dlLorCsv, "download", IC_GRID],
    ["/data/downloads/misconceptions_report.pdf", v.dlMisPdfT, "download", IC_SEARCH],
  ];
  const blockDownloads: DL[] = [
    ["/data/downloads/block_aggregates.csv", v.dlBlocks, "download", IC_GRID],
  ];
  // Each block links to its own page inside the standalone full report.
  const blockReportLinks = getBlockSlugs().map((b) => ({
    name: b.name,
    href: blockReportUrl(b.slug),
  }));

  // Each download renders as an icon control-button, matching the report pages'
  // download cards (slate icon disc + label + action arrow).
  const dlButton = ([href, label, kind, icon]: DL) => {
    const arrow = kind === "download" ? "↓" : kind === "view" ? "↗" : "→";
    const cls =
      "flex items-center gap-3 rounded-xl border border-gov-line bg-white p-3 shadow-sm transition hover:bg-gov-tint hover:shadow-lift";
    const inner = (
      <>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gov-tint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={icon} />
          </svg>
        </span>
        <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-gov-ink">{label}</span>
        <span aria-hidden className="shrink-0 text-lg leading-none text-gov-mid">{arrow}</span>
      </>
    );
    return kind === "link" ? (
      <Link key={label} href={href} className={cls}>
        {inner}
      </Link>
    ) : (
      <a
        key={label}
        href={href}
        {...(kind === "download"
          ? { download: true }
          : { target: "_blank", rel: "noopener noreferrer" })}
        className={cls}
      >
        {inner}
      </a>
    );
  };

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

          {/* Downloads — icon control-buttons, district first then block */}
          <details className={card}>
            <summary className={summary}>
              <span className="font-extrabold text-gov-ink">{v.resDownloadsT}</span>
              <span aria-hidden className={chev}>+</span>
            </summary>
            <div className="space-y-5 px-5 pb-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                  {v.dlGroupDistrict}
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {districtDownloads.map(dlButton)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                  {v.dlGroupBlock}
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {/* View Full Block Report — expands to a list of blocks; each
                      opens that block's standalone HTML report in a new tab. */}
                  <details className="group rounded-xl border border-gov-line bg-white shadow-sm transition open:shadow-lift">
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gov-tint">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D3A47" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d={IC_BLOCKS} />
                        </svg>
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-bold leading-snug text-gov-ink">
                        {v.dlViewBlockReport}
                      </span>
                      <span aria-hidden className="shrink-0 text-lg leading-none text-gov-mid transition-transform group-open:rotate-90">›</span>
                    </summary>
                    <ul className="border-t border-gov-line p-2">
                      {blockReportLinks.map((bl) => (
                        <li key={bl.name}>
                          <a
                            href={bl.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-gov transition hover:bg-gov-tint"
                          >
                            {bl.name}
                            <span aria-hidden className="text-gov-mid">↗</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                  {dlButton(blockDownloads[0])}
                </div>
              </div>
            </div>
          </details>
        </div>
      </main>
      <SiteFooter locale={locale} t={t} />
    </PageShell>
  );
}
