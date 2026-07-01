import type { Locale } from "./i18n/config";

// Odia uses its own numerals (୦–୯). Keep numbers locale-correct without pulling
// in Intl overhead; deterministic and tiny.
const ODIA_DIGITS = ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"];

export function fmtNum(n: number, locale: Locale): string {
  const s = String(n);
  return locale === "od" ? s.replace(/[0-9]/g, (d) => ODIA_DIGITS[Number(d)]) : s;
}

export function fmtPercent(n: number, locale: Locale): string {
  return `${fmtNum(n, locale)}%`;
}
