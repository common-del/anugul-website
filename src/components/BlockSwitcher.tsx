"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

// In-page block/district switcher, shared by the block report and the
// district report (same top-row position on both). The "District / All
// Blocks" option opens the district report; pass current="" on that page so
// it shows as selected.
export default function BlockSwitcher({
  locale,
  current,
  slugs,
  labels,
}: {
  locale: Locale;
  current: string; // current block name, or "" on the district report
  slugs: Record<string, string>; // name -> slug
  labels: { switchBlock: string; allBlocks: string };
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-muted">
      <span className="hidden sm:inline">{labels.switchBlock}:</span>
      <select
        value={current}
        onChange={(e) => {
          const val = e.target.value;
          router.push(val === "" ? `/${locale}/gov/district/` : `/${locale}/gov/${slugs[val]}/`);
        }}
        aria-label={labels.switchBlock}
        className="min-h-[44px] rounded-xl border border-gov-line bg-white px-3 text-[14px] font-semibold text-gov-ink shadow-sm"
      >
        <option value="">{labels.allBlocks}</option>
        {Object.keys(slugs)
          .sort()
          .map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
      </select>
    </label>
  );
}
