"use client";

import { useEffect, useRef, useState } from "react";

const HOST = "anugul-website.vercel.app";
const START = "/od/";
// Laptop screen renders a real 1280×800 viewport, scaled to sit beside the phone.
const LAPTOP_W = 1280;
const LAPTOP_H = 800;
const LAPTOP_SCALE = 0.55;

// Internal demo stage: the same site in a phone and a computer frame, side by
// side, navigation kept in sync (via DemoSync inside each frame). Not linked
// from the site — open /demo directly.
export default function DemoPage() {
  const phoneRef = useRef<HTMLIFrameElement>(null);
  const laptopRef = useRef<HTMLIFrameElement>(null);
  const [phoneUrl, setPhoneUrl] = useState(START);
  const [laptopUrl, setLaptopUrl] = useState(START);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || d.type !== "demo-nav" || typeof d.href !== "string") return;
      const fromPhone = e.source === phoneRef.current?.contentWindow;
      const other = fromPhone ? laptopRef.current : phoneRef.current;
      (fromPhone ? setPhoneUrl : setLaptopUrl)(d.href);
      other?.contentWindow?.postMessage(
        { type: "demo-goto", href: d.href },
        window.location.origin,
      );
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-800 px-6 py-8">
      <p className="mx-auto mb-6 max-w-4xl text-center text-sm text-neutral-300">
        ଅନୁଗୁଳ ବିଦ୍ୟାଳୟ · Angul Schools — one site, phone and computer, in sync
      </p>

      <div className="flex flex-col items-center justify-center gap-10 xl:flex-row xl:items-start">
        {/* Phone */}
        <div className="shrink-0 rounded-[2rem] bg-neutral-900 p-3 shadow-2xl">
          <div className="flex h-[640px] w-[360px] flex-col overflow-hidden rounded-[1.3rem] bg-white">
            <div className="flex shrink-0 items-center gap-2 border-b border-neutral-200 bg-neutral-100 px-3 py-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="shrink-0 text-neutral-500" aria-hidden>
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <div className="flex-1 truncate rounded-full bg-white px-3 py-1 text-xs text-neutral-700 ring-1 ring-neutral-200">
                {HOST}
                <span className="text-neutral-400">{phoneUrl}</span>
              </div>
              <span className="text-lg leading-none text-neutral-500" aria-hidden>⋮</span>
            </div>
            <iframe
              ref={phoneRef}
              src={START}
              title="Phone preview"
              className="h-full w-full flex-1 border-0"
            />
          </div>
        </div>

        {/* Computer */}
        <div className="shrink-0">
          <div className="rounded-t-xl bg-neutral-900 p-2.5 shadow-2xl">
            <div
              className="overflow-hidden rounded-lg bg-white"
              style={{ width: LAPTOP_W * LAPTOP_SCALE, height: (LAPTOP_H + 40) * LAPTOP_SCALE }}
            >
              <div style={{ width: LAPTOP_W, transform: `scale(${LAPTOP_SCALE})`, transformOrigin: "top left" }}>
                <div className="flex h-10 items-center gap-3 border-b border-neutral-200 bg-neutral-100 px-4">
                  <span className="flex gap-1.5" aria-hidden>
                    <span className="h-3 w-3 rounded-full bg-neutral-300" />
                    <span className="h-3 w-3 rounded-full bg-neutral-300" />
                    <span className="h-3 w-3 rounded-full bg-neutral-300" />
                  </span>
                  <div className="flex-1 truncate rounded-full bg-white px-4 py-1.5 text-sm text-neutral-700 ring-1 ring-neutral-200">
                    {HOST}
                    <span className="text-neutral-400">{laptopUrl}</span>
                  </div>
                </div>
                <iframe
                  ref={laptopRef}
                  src={START}
                  title="Computer preview"
                  className="border-0"
                  style={{ width: LAPTOP_W, height: LAPTOP_H }}
                />
              </div>
            </div>
          </div>
          {/* laptop base */}
          <div className="mx-auto h-3 rounded-b-xl bg-neutral-700" style={{ width: LAPTOP_W * LAPTOP_SCALE + 60 }} />
        </div>
      </div>
    </div>
  );
}
