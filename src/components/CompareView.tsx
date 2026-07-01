"use client";

import { useEffect, useState } from "react";
import { BAND_COLOR, BAND_TEXT, bandFromScore, type BandKey } from "@/lib/bands";
import { fmtPercent } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

type Idx = { u: string; n: string; b: string; c: string };
type SchoolData = {
  name: string;
  block: string;
  cluster: string;
  score: number;
  band: BandKey;
  byGrade: Record<string, Record<string, number>>;
};

const GRADE_ORDER = ["Grade 5", "Grade 8"];
const SUBJECT_ORDER = ["Odia", "English", "Maths", "EVS", "Science", "SST"];

type Copy = {
  intro: string;
  searchPlaceholder: string;
  change: string;
  overall: string;
  chooseTwo: string;
};

function SlotPicker({
  index,
  placeholder,
  onPick,
}: {
  index: Idx[];
  placeholder: string;
  onPick: (u: string) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const results = query
    ? index
        .filter((s) => s.n.toLowerCase().includes(query) || s.u.includes(query))
        .slice(0, 8)
    : [];
  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand"
      />
      {results.length > 0 && (
        <ul className="mt-1 divide-y divide-brand-line overflow-hidden rounded-lg border border-brand-line bg-white">
          {results.map((s) => (
            <li key={s.u}>
              <button
                type="button"
                onClick={() => onPick(s.u)}
                className="block w-full px-3 py-2 text-left text-sm text-brand-ink active:bg-brand-tint"
              >
                {s.n}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CompareView({
  c,
  bandLabels,
  gradeLabels,
  subjectLabels,
  locale,
}: {
  c: Copy;
  bandLabels: Record<string, string>;
  gradeLabels: Record<string, string>;
  subjectLabels: Record<string, string>;
  locale: Locale;
}) {
  const [index, setIndex] = useState<Idx[]>([]);
  const [aU, setAU] = useState<string | null>(null);
  const [bU, setBU] = useState<string | null>(null);
  const [aData, setAData] = useState<SchoolData | null>(null);
  const [bData, setBData] = useState<SchoolData | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setAU(p.get("a"));
    setBU(p.get("b"));
    fetch("/data/search-index.json")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!aU) return setAData(null);
    fetch(`/data/school/${aU}.json`)
      .then((r) => r.json())
      .then(setAData)
      .catch(() => setAData(null));
  }, [aU]);
  useEffect(() => {
    if (!bU) return setBData(null);
    fetch(`/data/school/${bU}.json`)
      .then((r) => r.json())
      .then(setBData)
      .catch(() => setBData(null));
  }, [bU]);

  const bothReady = aData && bData;

  const overallCell = (d: SchoolData) => (
    <div>
      <span
        className="inline-block rounded px-1.5 py-0.5 text-xs font-bold"
        style={{
          backgroundColor: BAND_COLOR[d.band],
          color: d.band === "needs" ? "#12233d" : "#fff",
        }}
      >
        {fmtPercent(Math.round(d.score), locale)}
      </span>
      <span className="mt-0.5 block text-xs text-muted">{bandLabels[d.band]}</span>
    </div>
  );

  const subjectCell = (d: SchoolData, g: string, s: string) => {
    const v = d.byGrade[g]?.[s];
    if (v === undefined)
      return <span className="text-muted">—</span>;
    return (
      <span
        className="font-semibold tabular-nums"
        style={{ color: BAND_TEXT[bandFromScore(v)] }}
      >
        {fmtPercent(Math.round(v), locale)}
      </span>
    );
  };

  const Row = ({
    label,
    a,
    b,
    head,
  }: {
    label: React.ReactNode;
    a: React.ReactNode;
    b: React.ReactNode;
    head?: boolean;
  }) => (
    <div
      className={`grid grid-cols-[1.1fr,1fr,1fr] items-start gap-2 ${
        head ? "" : "border-t border-brand-line py-2"
      }`}
    >
      <div className="text-sm text-muted">{label}</div>
      <div className="text-sm">{a}</div>
      <div className="text-sm">{b}</div>
    </div>
  );

  return (
    <div>
      <p className="text-muted">{c.intro}</p>

      {/* Slot pickers */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { data: aData, set: setAU },
          { data: bData, set: setBU },
        ].map((slot, i) => (
          <div
            key={i}
            className="rounded-xl border border-brand-line bg-white p-3"
          >
            {slot.data ? (
              <div>
                <p className="line-clamp-2 text-sm font-bold leading-tight text-brand-ink">
                  {slot.data.name}
                </p>
                <button
                  type="button"
                  onClick={() => slot.set(null)}
                  className="mt-1 text-xs font-semibold text-brand underline"
                >
                  {c.change}
                </button>
              </div>
            ) : (
              <SlotPicker
                index={index}
                placeholder={c.searchPlaceholder}
                onPick={(u) => slot.set(u)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {bothReady ? (
        <div className="mt-5">
          <Row
            label=""
            head
            a={
              <span className="block line-clamp-2 font-bold leading-tight text-brand-ink">
                {aData.name}
              </span>
            }
            b={
              <span className="block line-clamp-2 font-bold leading-tight text-brand-ink">
                {bData.name}
              </span>
            }
          />
          <Row
            label={c.overall}
            a={overallCell(aData)}
            b={overallCell(bData)}
          />
          {GRADE_ORDER.filter(
            (g) => aData.byGrade[g] || bData.byGrade[g],
          ).map((g) => (
            <div key={g}>
              <p className="mt-3 text-xs font-bold text-brand-ink">
                {gradeLabels[g]}
              </p>
              {SUBJECT_ORDER.filter(
                (s) =>
                  aData.byGrade[g]?.[s] !== undefined ||
                  bData.byGrade[g]?.[s] !== undefined,
              ).map((s) => (
                <Row
                  key={s}
                  label={subjectLabels[s]}
                  a={subjectCell(aData, g, s)}
                  b={subjectCell(bData, g, s)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-brand-tint p-4 text-sm text-muted">
          {c.chooseTwo}
        </p>
      )}
    </div>
  );
}
