"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

// Consent-gated Google Analytics (owner 2026-07-27, replacing Vercel Analytics).
// GA4 is loaded ONLY after the visitor accepts, so no analytics cookies are set
// before consent. The choice is stored in localStorage (not a cookie), so
// recording the decision itself sets nothing tracking-related.
const GA_ID = "G-ERVHWZPKGC";
const STORE_KEY = "saksham-analytics-consent";

type Consent = "granted" | "denied" | null;

export default function ConsentBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved: Consent = null;
    try {
      const v = localStorage.getItem(STORE_KEY);
      if (v === "granted" || v === "denied") saved = v;
    } catch {
      /* localStorage unavailable — treat as undecided */
    }
    setConsent(saved);
    setReady(true);
  }, []);

  const decide = (value: "granted" | "denied") => {
    try {
      localStorage.setItem(STORE_KEY, value);
    } catch {
      /* ignore */
    }
    setConsent(value);
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}

      {ready && consent === null && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-gov-footer text-white shadow-lg"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] leading-relaxed text-white/90">
              We use Google Analytics to understand how this site is used. It is
              optional — analytics cookies are set only if you accept.{" "}
              <a
                href="/en/website-policies/#privacy"
                className="underline underline-offset-2 hover:text-white"
              >
                Learn more
              </a>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="min-h-[38px] rounded-lg border border-white/30 px-4 text-sm font-bold text-white hover:bg-white/10"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="min-h-[38px] rounded-lg bg-white px-4 text-sm font-bold text-gov-ink hover:brightness-95"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
