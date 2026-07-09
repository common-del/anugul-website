"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fmtNum } from "@/lib/format";
import type { BandKey } from "@/lib/bands";
import Stars from "@/components/Stars";
import type { Locale } from "@/lib/i18n/config";

type Item = { u: string; n: string; b: string; c: string; st: string; s10: number; band: BandKey };
type Geo = { u: string; lat: number; lon: number };

type Labels = {
  nearMe: string;
  nearMeFinding: string;
  nearMeDenied: string;
  nearMeResults: string;
  showMore: string;
  showLess: string;
  searchAny: string;
  searchNote: string;
  stepFindTitle: string;
  chooseBlock: string;
  chooseCluster: string;
  pickSchool: string;
  changeSel: string;
  schoolsFound: string;
  openReport: string;
  overallScore: string;
  noResults: string;
  showingFirst: string;
  kmAway: string;
  viewReportAria: string;
};

function havKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const r = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 +
    Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const NEAR_SHOWN = 5; // collapsed count for "Schools near me"
const NEAR_MAX = 25; // most we ever list

// v3 finder: GPS "Schools near me" first (5, expandable), a global search box
// right beneath it (matches name / UDISE / block / cluster / setting — the only
// geographical fields the data holds; no village/pincode exist in any source),
// then a tap-only Block → Cluster → list drill-down as the backup.
export default function SchoolFinder({
  locale,
  labels,
  dest = "school",
  tip,
}: {
  locale: Locale;
  labels: Labels;
  dest?: "school" | "principal";
  // Optional tinted tip panel inside the search card (School Head variant
  // only) — evens the left column's height against the block picker.
  tip?: { title: string; body: string };
}) {
  const [index, setIndex] = useState<Item[]>([]);
  const [geo, setGeo] = useState<Geo[] | null>(null);
  const [gps, setGps] = useState<"idle" | "loading" | "denied">("idle");
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [nearExpanded, setNearExpanded] = useState(false);
  const [q, setQ] = useState("");
  const [block, setBlockState] = useState("");
  const [cluster, setCluster] = useState("");

  const setBlock = (name: string) => {
    setBlockState(name);
    setCluster("");
    const url = new URL(window.location.href);
    if (name) url.searchParams.set("block", name);
    else url.searchParams.delete("block");
    window.history.replaceState(null, "", url);
  };

  const locate = () => {
    setGps("loading");
    setNearExpanded(false);
    if (!navigator.geolocation) {
      setGps("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lon: p.coords.longitude });
        setGps("idle");
      },
      () => setGps("denied"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
    if (!geo) {
      fetch("/data/geo.json")
        .then((r) => r.json())
        .then(setGeo)
        .catch(() => {});
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const b = params.get("block");
    if (b) setBlockState(b);
    fetch("/data/search-index.json")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
    if (params.get("near") === "1") locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byU = useMemo(() => new Map(index.map((s) => [s.u, s])), [index]);
  const nearest = useMemo(() => {
    if (!pos || !geo || !index.length) return null;
    return geo
      .map((g) => ({ g, km: havKm(pos, g) }))
      .sort((a, z) => a.km - z.km)
      .slice(0, NEAR_MAX)
      .map(({ g, km }) => ({ item: byU.get(g.u), km }))
      .filter((x): x is { item: Item; km: number } => !!x.item);
  }, [pos, geo, index, byU]);

  // global search across every field we actually hold
  const searchMatches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return index
      .filter((s) =>
        `${s.n} ${s.u} ${s.b} ${s.c} ${s.st}`.toLowerCase().includes(query),
      )
      .sort((a, z) => a.n.localeCompare(z.n));
  }, [index, q]);
  const CAP = 250;
  const searchResults = searchMatches.slice(0, CAP);

  const blocks = useMemo(() => [...new Set(index.map((s) => s.b))].sort(), [index]);
  const clusters = useMemo(
    () =>
      block
        ? [...new Set(index.filter((s) => s.b === block).map((s) => s.c))].sort()
        : [],
    [index, block],
  );
  const drillSchools = useMemo(
    () =>
      block && cluster
        ? index
            .filter((s) => s.b === block && s.c === cluster)
            .sort((a, z) => a.n.localeCompare(z.n))
        : [],
    [index, block, cluster],
  );

  const num = (n: number) => fmtNum(n, locale);

  // Whole card is one focusable link (no separate button); score is the green
  // focal number; enlarged filled stars; chevron signals "tap to open".
  const Card = ({ s, km }: { s: Item; km?: number }) => (
    <Link
      href={`/${locale}/${dest}/${s.u}/`}
      aria-label={labels.viewReportAria
        .replace("{name}", s.n)
        .replace("{n}", num(s.s10))
        .replace("{max}", num(10))}
      className="flex items-center gap-3 rounded-xl border border-gov-line bg-white p-4 shadow-card transition hover:bg-gov-tint hover:shadow-lift active:bg-gov-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov focus-visible:ring-offset-1"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-gov-ink">{s.n}</span>
        <span className="mt-0.5 block truncate text-xs text-muted">
          {s.b} · {s.c}
          {km != null ? ` · ${labels.kmAway.replace("{km}", num(Math.round(km * 10) / 10))}` : ""}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <Stars score={s.s10} size={20} label={`${num(s.s10)}/${num(10)}`} />
          <span className="text-xs font-semibold text-muted">
            {labels.overallScore}{" "}
            <span className="text-xl font-extrabold tabular-nums text-gov">{num(s.s10)}</span>
            <span className="font-bold text-gov">/{num(10)}</span>
          </span>
        </span>
      </span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="shrink-0 text-gov"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );

  const chip = (label: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className="min-h-[48px] rounded-xl bg-white px-4 text-[15px] font-semibold text-gov ring-1 ring-gov-line shadow-sm transition hover:bg-gov-tint hover:ring-gov active:bg-gov-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gov focus-visible:ring-offset-1"
    >
      {label}
    </button>
  );

  const searching = q.trim() !== "";
  const nearList = nearest && (nearExpanded ? nearest : nearest.slice(0, NEAR_SHOWN));

  return (
    // With the tip (School Head variant) the two route cards stretch to equal
    // height for symmetry — the tinted tip panel grows to fill the difference.
    <div className={`md:grid md:grid-cols-2 md:gap-5 ${tip ? "md:items-stretch" : "md:items-start"}`}>
      {/* Route A — search by typing, with GPS as the quieter fallback beside it */}
      <div className={`rounded-2xl border border-gov-line bg-white p-4 shadow-card ${tip ? "md:flex md:flex-col" : ""}`}>
        <div className="flex gap-2">
          <div className="flex flex-[2] items-center gap-2 rounded-xl border border-gov-line bg-white px-3 shadow-sm focus-within:border-gov">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="shrink-0 text-muted">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="search"
              inputMode="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={labels.searchAny}
              aria-label={labels.searchAny}
              className="min-h-[50px] w-full bg-transparent text-base text-gov-ink outline-none"
            />
          </div>
          <button
            type="button"
            onClick={locate}
            className="flex min-h-[50px] flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-gov px-2 text-[13px] font-bold text-gov transition hover:bg-gov-tint"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
              <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span className="truncate">{labels.nearMe}</span>
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted">{labels.searchNote}</p>

        {tip && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-gov-tint p-3.5 md:flex-1">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gov">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0012 3z" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-snug text-gov-ink">
                {tip.title}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                {tip.body}
              </span>
            </span>
            {/* report-card + potted-plant motif, brand greens only */}
            <svg width="64" height="56" viewBox="0 0 64 56" fill="none" aria-hidden className="hidden shrink-0 sm:block">
              <rect x="10" y="4" width="34" height="46" rx="4" fill="#fff" stroke="#0E5A40" strokeWidth="1.6" />
              <circle cx="19" cy="13" r="4.5" fill="#EDF5F0" stroke="#187A57" strokeWidth="1.2" />
              <text x="19" y="16" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#0E5A40">A+</text>
              <line x1="27" y1="11" x2="39" y2="11" stroke="#187A57" strokeWidth="2" strokeLinecap="round" />
              <line x1="27" y1="16" x2="36" y2="16" stroke="#9CC6B2" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="24" x2="39" y2="24" stroke="#9CC6B2" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="29" x2="35" y2="29" stroke="#187A57" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="34" x2="39" y2="34" stroke="#9CC6B2" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="39" x2="31" y2="39" stroke="#9CC6B2" strokeWidth="2" strokeLinecap="round" />
              <path d="M53 38c0-4 2.5-7 2.5-7s2.5 3 2.5 7" stroke="#187A57" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M55.5 40c-3-1-6-4-6-7 3 0 6 2 6 7zM55.5 40c3-1 6-4 6-7-3 0-6 2-6 7z" fill="#187A57" />
              <path d="M50 42h11l-1.5 10h-8z" fill="#0E5A40" />
            </svg>
          </div>
        )}

        {searching ? (
          <section className="mt-3">
            <p className="text-sm font-bold text-gov-ink">
              {labels.schoolsFound.replace("{n}", num(searchMatches.length))}
            </p>
            <ul className="mt-2 max-h-[22rem] space-y-2.5 overflow-y-auto pr-1">
              {searchResults.map((s) => (
                <li key={s.u}>
                  <Card s={s} />
                </li>
              ))}
              {searchResults.length === 0 && (
                <li className="rounded-xl border border-gov-line bg-white px-4 py-4 text-sm text-muted">
                  {labels.noResults}
                </li>
              )}
            </ul>
            {searchMatches.length > searchResults.length && (
              <p className="mt-2 px-1 text-xs text-muted">
                {labels.showingFirst
                  .replace("{shown}", num(searchResults.length))
                  .replace("{n}", num(searchMatches.length))}
              </p>
            )}
          </section>
        ) : (
          <>
            {gps === "loading" && !nearest && (
              <p className="mt-3 text-sm font-semibold text-gov-ink">{labels.nearMeFinding}</p>
            )}
            {gps === "denied" && (
              <p className="mt-3 rounded-xl bg-gov-tint p-3 text-sm text-gov-ink">
                {labels.nearMeDenied}
              </p>
            )}
            {nearList && nearList.length > 0 && (
              <section className="mt-3">
                <h2 className="text-sm font-bold text-gov-ink">{labels.nearMeResults}</h2>
                <ul className="mt-2 space-y-2.5">
                  {nearList.map(({ item, km }) => (
                    <li key={item.u}>
                      <Card s={item} km={km} />
                    </li>
                  ))}
                </ul>
                {nearest && nearest.length > NEAR_SHOWN && (
                  <button
                    type="button"
                    onClick={() => setNearExpanded((x) => !x)}
                    className="mt-3 min-h-[44px] w-full rounded-xl border-2 border-gov text-[15px] font-bold text-gov transition hover:bg-gov-tint"
                  >
                    {nearExpanded
                      ? labels.showLess
                      : labels.showMore.replace("{n}", num(nearest.length - NEAR_SHOWN))}
                  </button>
                )}
              </section>
            )}
          </>
        )}
      </div>

      {/* Route B — step by step: block → cluster → school (equal-weight column) */}
      <div className="mt-4 rounded-2xl border border-gov-line bg-white p-4 shadow-card md:mt-0">
        {!block && (
          <>
            <p className="text-sm font-semibold text-muted">{labels.chooseBlock}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {blocks.map((b) => chip(b, () => setBlock(b)))}
            </div>
          </>
        )}

        {block && (
          <p className="flex flex-wrap items-center gap-x-2 text-sm">
            <span className="font-bold text-gov-ink">{block}</span>
            {cluster && <span className="font-bold text-gov-ink">· {cluster}</span>}
            <button
              type="button"
              onClick={() => (cluster ? setCluster("") : setBlock(""))}
              className="font-semibold text-gov underline underline-offset-2"
            >
              {labels.changeSel}
            </button>
          </p>
        )}

        {block && !cluster && (
          <>
            <p className="mt-2 text-sm font-semibold text-muted">{labels.chooseCluster}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {clusters.map((c) => chip(c, () => setCluster(c)))}
            </div>
          </>
        )}

        {block && cluster && (
          <>
            <p className="mt-2 text-sm font-semibold text-muted">{labels.pickSchool}</p>
            <ul className="mt-2 max-h-[22rem] space-y-2.5 overflow-y-auto pr-1">
              {drillSchools.map((s) => (
                <li key={s.u}>
                  <Card s={s} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
