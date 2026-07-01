// Locale config — single source of truth. Adding Hindi later is: add "hi" here,
// drop in messages/hi.json, add the Devanagari font. No routing/code changes.
export const locales = ["od", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "od";

// <html lang> value (BCP-47). Odia = "or".
export const htmlLang: Record<Locale, string> = { od: "or", en: "en" };

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}
