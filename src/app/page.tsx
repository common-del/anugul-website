"use client";

import { useEffect } from "react";

// Odia is the default locale. Vercel also redirects "/" → "/od/" at the edge
// (see vercel.json); this covers local dev and the static fallback.
export default function RootRedirect() {
  useEffect(() => {
    window.location.replace("/od/");
  }, []);
  return (
    <main className="p-8 text-center text-muted">
      <a href="/od/" className="text-brand underline">
        Angul Schools · ଅନୁଗୁଳ ବିଦ୍ୟାଳୟ
      </a>
    </main>
  );
}
