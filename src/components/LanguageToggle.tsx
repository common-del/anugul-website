"use client";

import { usePathname } from "next/navigation";

// Small two-letter language switch: E / ଓ, current one highlighted.
// Plain <a> + click-time query capture: keeps ?block= / ?a=&b= across the
// switch (usePathname has no query, and useSearchParams needs Suspense under
// static export). Full page load — simple and reliable on a static site.
export default function LanguageToggle({ current }: { current: string }) {
  const pathname = usePathname() || `/${current}`;
  const rest = pathname.replace(/^\/(od|en)(?=\/|$)/, "");
  const to = (loc: string) => `/${loc}${rest || "/"}`;

  const seg = (loc: "en" | "od", letter: string, name: string) => {
    const active = loc === current;
    return (
      <a
        href={to(loc)}
        aria-label={name}
        aria-current={active ? "true" : undefined}
        onClick={(e) => {
          e.preventDefault();
          window.location.href = to(loc) + window.location.search;
        }}
        className={`flex h-9 items-center justify-center rounded-full px-3 text-[13px] font-bold ${
          active ? "bg-gov text-white" : "text-gov-dark"
        }`}
      >
        {letter}
      </a>
    );
  };

  return (
    <div className="no-print flex shrink-0 items-center gap-0.5 rounded-full bg-gov-tint p-0.5 ring-1 ring-gov-line">
      {seg("en", "EN", "English")}
      {seg("od", "ଓଡ଼ିଆ", "ଓଡ଼ିଆ")}
    </div>
  );
}
