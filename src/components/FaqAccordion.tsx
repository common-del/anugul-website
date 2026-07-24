"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

type Item = { id: string; q: string; a: string; tags: string[] };
type Group = "all" | "parents" | "heads" | "researchers" | "government";

type Labels = {
  search: string;
  groupsLabel: string;
  groups: { all: string; parents: string; heads: string; researchers: string; government: string };
  noResults: string;
  stillTitle: string;
  stillText: string;
  contactCta: string;
};

export default function FaqAccordion({
  items,
  labels,
  locale,
  bandLegend,
}: {
  items: Item[];
  labels: Labels;
  locale: Locale;
  bandLegend?: { color: string; label: string }[];
}) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<Group>("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const matches = (it: Item) =>
      !needle || `${it.q} ${it.a}`.toLowerCase().includes(needle);
    // On a specific role tab, that role's own questions come FIRST, followed by
    // the general ("all"-tagged) questions. The "All" tab shows everything in
    // document order (general first, then the role-specific groups).
    const ordered =
      group === "all"
        ? items
        : [
            ...items.filter((it) => it.tags.includes(group)),
            ...items.filter(
              (it) => it.tags.includes("all") && !it.tags.includes(group),
            ),
          ];
    return ordered.filter(matches);
  }, [items, q, group]);

  const groups: Group[] = ["all", "parents", "heads", "researchers"];

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-gov-line bg-white px-4 shadow-sm focus-within:border-gov">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="shrink-0 text-muted">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.search}
          aria-label={labels.search}
          className="min-h-[50px] w-full bg-transparent text-base text-gov-ink outline-none"
        />
      </div>

      <p className="mt-4 text-sm font-bold text-gov-ink">{labels.groupsLabel}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            aria-pressed={group === g}
            className={`min-h-[40px] rounded-full px-4 text-sm font-semibold ring-1 shadow-sm transition-shadow ${
              group === g
                ? "bg-gov text-white ring-gov"
                : "bg-white text-gov-dark ring-gov-line hover:bg-gov-tint hover:shadow"
            }`}
          >
            {labels.groups[g]}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {filtered.map((it) => (
          <details key={it.id} className="group gov-card">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 font-bold text-gov-ink">
              {it.q}
              <span aria-hidden className="shrink-0 text-gov transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            {it.id === "bands" && bandLegend ? (
              (() => {
                const parts = it.a.split("\n\n");
                return (
                  <div className="border-t border-gov-line px-4 py-3 text-[15px] leading-relaxed text-muted">
                    {parts[0] && <p>{parts[0]}</p>}
                    <ul className="my-2.5 space-y-1.5">
                      {bandLegend.map((b, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className="h-3.5 w-3.5 shrink-0 rounded-full"
                            style={{ backgroundColor: b.color }}
                          />
                          <span>{b.label}</span>
                        </li>
                      ))}
                    </ul>
                    {parts.slice(1).map((p, i) => (
                      <p key={i} className="mt-1">{p}</p>
                    ))}
                  </div>
                );
              })()
            ) : (
              <p className="whitespace-pre-line border-t border-gov-line px-4 py-3 text-[15px] leading-relaxed text-muted">
                {it.a}
              </p>
            )}
          </details>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-gov-line bg-white px-4 py-4 text-sm text-muted">
            {labels.noResults}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gov-tint p-5">
        <div>
          <p className="font-bold text-gov-ink">{labels.stillTitle}</p>
          <p className="text-sm text-muted">{labels.stillText}</p>
        </div>
        <Link
          href={`/${locale}/contact/`}
          className="rounded-xl bg-gov px-5 py-2.5 text-sm font-bold text-white"
        >
          {labels.contactCta}
        </Link>
      </div>
    </div>
  );
}
