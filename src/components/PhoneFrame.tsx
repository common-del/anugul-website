"use client";

import { usePathname } from "next/navigation";

const HOST = "angul-schools.vercel.app";

// Desktop: a fixed 360×640 phone with a mobile-Chrome address bar; content
// scrolls inside the screen (visible scrollbar) so the device keeps its size.
// Real mobile: full-bleed, native browser chrome, normal page scroll.
export default function PhoneFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  return (
    <div className="min-h-screen w-full bg-neutral-300 print:bg-white sm:flex sm:items-start sm:justify-center sm:py-6">
      <div className="device-bezel sm:rounded-[2rem] sm:bg-neutral-900 sm:p-3 sm:shadow-2xl">
        <div className="device-screen flex flex-col bg-white sm:h-[640px] sm:w-[360px] sm:overflow-hidden sm:rounded-[1.3rem]">
          {/* Fake mobile-Chrome address bar — desktop mockup only */}
          <div className="no-print hidden shrink-0 items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-3 py-2 sm:flex">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="shrink-0 text-neutral-500"
              aria-hidden
            >
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <div className="flex-1 truncate rounded-full bg-white px-3 py-1 text-xs text-neutral-700 ring-1 ring-neutral-200">
              {HOST}
              <span className="text-neutral-400">{pathname}</span>
            </div>
            <span className="text-lg leading-none text-neutral-500" aria-hidden>
              ⋮
            </span>
          </div>
          {/* Screen — scrolls inside the fixed device on desktop */}
          <div className="sm:flex-1 sm:overflow-y-auto sm:overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
