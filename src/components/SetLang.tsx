"use client";

import { useEffect } from "react";

// Corrects <html lang> on the client (root layout defaults to Odia). Cheap and
// robust with static export; the visible content is already locale-correct.
export default function SetLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
