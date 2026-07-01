import en from "./messages/en.json";
import od from "./messages/od.json";
import type { Locale } from "./config";

// English is the shape reference; od.json must mirror it.
export type Messages = typeof en;

const dicts: Record<Locale, Messages> = { en, od: od as Messages };

export function getDict(locale: Locale): Messages {
  return dicts[locale];
}
