"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Small two-letter language switch: E / ଓ, current one highlighted.
export default function LanguageToggle({ current }: { current: string }) {
  const pathname = usePathname() || `/${current}`;
  const rest = pathname.replace(/^\/(od|en)(?=\/|$)/, "");
  const to = (loc: string) => `/${loc}${rest || "/"}`;

  const seg = (loc: "en" | "od", letter: string, name: string) => {
    const active = loc === current;
    return (
      <Link
        href={to(loc)}
        aria-label={name}
        aria-current={active ? "true" : undefined}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
          active ? "bg-white text-brand" : "text-white/75"
        }`}
      >
        {letter}
      </Link>
    );
  };

  return (
    <div className="no-print flex shrink-0 items-center gap-0.5 rounded-full bg-white/15 p-0.5 ring-1 ring-white/30">
      {seg("en", "E", "English")}
      {seg("od", "ଓ", "ଓଡ଼ିଆ")}
    </div>
  );
}
