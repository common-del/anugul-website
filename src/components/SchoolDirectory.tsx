"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fmtNum, fmtPercent } from "@/lib/format";
import { BAND_COLOR, BAND_TEXT, type BandKey } from "@/lib/bands";
import type { Locale } from "@/lib/i18n/config";

export type DirRow = {
  udise: string; name: string; block: string; cluster: string;
  score: number; band: BandKey; students: number;
};

type Copy = {
  dirIntro: string; dirSearch: string; dirAllBlocks: string; dirName: string;
  dirBand: string; dirCount: string; dirEmpty: string; dirSortHint: string;
  leagueScore: string; leagueCluster: string; leagueStudents: string; blockTitle: string;
};

const BAND_RANK: Record<BandKey, number> = { urgent: 0, needs: 1, developing: 2, excelling: 3 };
type SortKey = "name" | "block" | "cluster" | "band" | "score" | "students";

export default function SchoolDirectory({
  rows,
  blocks,
  bandLabels,
  o,
  locale,
}: {
  rows: DirRow[];
  blocks: string[];
  bandLabels: Record<BandKey, string>;
  o: Copy;
  locale: Locale;
}) {
  const [q, setQ] = useState("");
  const [block, setBlock] = useState("");
  const [sort, setSort] = useState<SortKey>("score");
  const [asc, setAsc] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        (!block || r.block === block) &&
        (!needle ||
          r.name.toLowerCase().includes(needle) ||
          r.cluster.toLowerCase().includes(needle) ||
          r.udise.includes(needle)),
    );
    out.sort((a, z) => {
      let d: number;
      switch (sort) {
        case "name": d = a.name.localeCompare(z.name); break;
        case "block": d = a.block.localeCompare(z.block) || a.name.localeCompare(z.name); break;
        case "cluster": d = a.cluster.localeCompare(z.cluster) || a.name.localeCompare(z.name); break;
        case "band": d = BAND_RANK[a.band] - BAND_RANK[z.band] || a.score - z.score; break;
        case "students": d = a.students - z.students; break;
        default: d = a.score - z.score;
      }
      return asc ? d : -d;
    });
    return out;
  }, [rows, q, block, sort, asc]);

  function head(key: SortKey, label: string, align: "left" | "right") {
    const active = sort === key;
    return (
      <th className={`py-1 ${align === "right" ? "pl-2 text-right" : "pr-2 text-left"} font-semibold`}>
        <button
          type="button"
          onClick={() => (active ? setAsc((v) => !v) : (setSort(key), setAsc(key === "name" || key === "block" || key === "cluster")))}
          className={`inline-flex items-center gap-0.5 ${active ? "text-brand" : "hover:text-brand"}`}
        >
          {label}
          {active && <span aria-hidden>{asc ? "▲" : "▼"}</span>}
        </button>
      </th>
    );
  }

  return (
    <div>
      <p className="mt-1 text-muted">{o.dirIntro}</p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={o.dirSearch}
          className="min-h-[44px] flex-1 rounded-xl border border-brand-line bg-white px-4 text-brand-ink placeholder:text-muted"
        />
        <select
          value={block}
          onChange={(e) => setBlock(e.target.value)}
          className="min-h-[44px] rounded-xl border border-brand-line bg-white px-3 text-brand-ink"
        >
          <option value="">{o.dirAllBlocks}</option>
          {blocks.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <p className="mt-2 text-xs text-muted">
        {o.dirCount.replace("{n}", fmtNum(filtered.length, locale))} · {o.dirSortHint}
      </p>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-brand-line text-xs text-muted">
              {head("name", o.dirName, "left")}
              {head("block", o.blockTitle, "left")}
              {head("cluster", o.leagueCluster, "left")}
              {head("band", o.dirBand, "left")}
              {head("score", o.leagueScore, "right")}
              {head("students", o.leagueStudents, "right")}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.udise} className="border-b border-brand-line">
                <td className="py-1.5 pr-2">
                  <Link href={`/${locale}/officials/school/${r.udise}/`} className="text-brand underline-offset-2 hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="py-1.5 pr-2 text-muted">{r.block}</td>
                <td className="py-1.5 pr-2 text-muted">{r.cluster}</td>
                <td className="py-1.5 pr-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: BAND_COLOR[r.band], color: r.band === "needs" ? "#12233d" : "#fff" }}
                  >
                    {bandLabels[r.band]}
                  </span>
                </td>
                <td className="py-1.5 pl-2 text-right font-semibold tabular-nums" style={{ color: BAND_TEXT[r.band] }}>
                  {fmtPercent(Math.round(r.score), locale)}
                </td>
                <td className="py-1.5 pl-2 text-right tabular-nums text-muted">{fmtNum(r.students, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <p className="mt-4 text-sm text-muted">{o.dirEmpty}</p>}
    </div>
  );
}
