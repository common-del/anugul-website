"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fmtNum } from "@/lib/format";
import { BAND_TEXT, type BandKey } from "@/lib/bands";
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
}: {
  locale: Locale;
  labels: Labels;
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

  const Card = ({ s, km }: { s: Item; km?: number }) => (
    <Link
      href={`/${locale}/school/${s.u}/`}
      className="block rounded-xl border border-gov-line bg-white p-4 active:bg-gov-tint"
    >
      <span className="font-bold text-gov-ink">{s.n}</span>
      <span className="mt-0.5 block text-xs text-muted">
        {s.b} · {s.c}
        {km != null ? ` · ${labels.kmAway.replace("{km}", num(Math.round(km * 10) / 10))}` : ""}
      </span>
      <span className="mt-2 flex items-center justify-between gap-2">
        <span className="min-w-0">
          <span className="text-xs text-muted">
            {labels.overallScore}{" "}
            <span
              className="text-lg font-extrabold tabular-nums"
              style={{ color: BAND_TEXT[s.band] }}
            >
              {num(s.s10)}
            </span>
            <span className="font-semibold">/{num(10)}</span>
          </span>
          <span className="mt-0.5 block">
            <Stars score={s.s10} size={12} label={`${num(s.s10)}/${num(10)}`} />
          </span>
        </span>
        <span className="shrink-0 rounded-lg bg-gov px-4 py-2 text-sm font-bold text-white">
          {labels.openReport}
        </span>
      </span>
    </Link>
  );

  const chip = (label: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className="min-h-[48px] rounded-xl bg-white px-4 text-[15px] font-semibold text-gov ring-1 ring-gov-line active:bg-gov-tint"
    >
      {label}
    </button>
  );

  const searching = q.trim() !== "";
  const nearList = nearest && (nearExpanded ? nearest : nearest.slice(0, NEAR_SHOWN));

  return (
    <div className="md:max-w-2xl">
      {/* 1 — GPS, the primary path */}
      <button
        type="button"
        onClick={locate}
        className="flex min-h-[60px] w-full items-center justify-center gap-2.5 rounded-xl bg-gov px-6 text-[18px] font-extrabold text-white shadow-sm active:brightness-110"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        {labels.nearMe}
      </button>

      {/* 2 — global search, right beneath the GPS button */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-gov-line bg-white px-4 focus-within:border-gov">
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
      <p className="mt-1 text-xs text-muted">{labels.searchNote}</p>

      {/* results: search takes precedence, else GPS results */}
      {searching ? (
        <section className="mt-4">
          <p className="text-sm font-bold text-gov-ink">
            {labels.schoolsFound.replace("{n}", num(searchMatches.length))}
          </p>
          <ul className="mt-2 space-y-2.5">
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
            {searchMatches.length > searchResults.length && (
              <li className="px-1 py-2 text-sm text-muted">
                {labels.showingFirst
                  .replace("{shown}", num(searchResults.length))
                  .replace("{n}", num(searchMatches.length))}
              </li>
            )}
          </ul>
        </section>
      ) : (
        <>
          {gps === "loading" && !nearest && (
            <p className="mt-4 text-sm font-semibold text-gov-ink">{labels.nearMeFinding}</p>
          )}
          {gps === "denied" && (
            <p className="mt-4 rounded-xl bg-gov-tint p-3 text-sm text-gov-ink">
              {labels.nearMeDenied}
            </p>
          )}
          {nearList && nearList.length > 0 && (
            <section className="mt-4">
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
                  className="mt-3 min-h-[44px] w-full rounded-xl border-2 border-gov text-[15px] font-bold text-gov"
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

      {/* 3 — tap-only drill-down backup */}
      <section className="mt-7 border-t border-gov-line pt-5">
        <h2 className="text-base font-bold text-gov-ink">{labels.stepFindTitle}</h2>

        {!block && (
          <>
            <p className="mt-2 text-sm font-semibold text-muted">{labels.chooseBlock}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {blocks.map((b) => chip(b, () => setBlock(b)))}
            </div>
          </>
        )}

        {block && (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm">
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
            <ul className="mt-2 space-y-2.5">
              {drillSchools.map((s) => (
                <li key={s.u}>
                  <Card s={s} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
