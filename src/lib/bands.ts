// Result bands. Colour is always paired with the band word + number in the UI,
// so it never carries meaning on its own (accessibility).
export type BandKey = "urgent" | "needs" | "developing" | "excelling";

export const BAND_COLOR: Record<BandKey, string> = {
  urgent: "#C24E36", // critical → coral-700
  needs: "#F2B01E", // mid-low / needs attention → gold (distinct from developing orange)
  developing: "#DD6B20", // developing → orange
  excelling: "#15803D", // best performing → green
};

// Darker variants for band-coloured TEXT on light backgrounds — the fills above
// fail WCAG AA as small text (esp. amber), so text uses these (>=4.5:1 on white).
export const BAND_TEXT: Record<BandKey, string> = {
  urgent: "#C24E36", // coral-700
  needs: "#A85A0F", // dark amber (amber fill is too light for text)
  developing: "#B5530C", // dark orange (readable on white)
  excelling: "#15803D", // green
};

export function bandFromScore(s: number): BandKey {
  if (s <= 25) return "urgent";
  if (s <= 50) return "needs";
  if (s <= 75) return "developing";
  return "excelling";
}

// Muted / translucent band fills for row backgrounds (e.g. nearby-schools
// lists). Same hues as BAND_COLOR but at low alpha, so the tint stays subtle —
// a hint, not the primary signal (the score + stars carry that).
export const BAND_TINT: Record<BandKey, string> = {
  urgent: "rgba(194,78,54,0.12)", // red
  needs: "rgba(242,176,30,0.16)", // gold (lighter hue → a touch more alpha)
  developing: "rgba(221,107,32,0.13)", // orange
  excelling: "rgba(21,128,61,0.12)", // green
};

// Band tint for a /10 school score, matching the Schools-by-band legend
// (8-10 excelling, 6-7 developing, 3-5 needs, 0-2 critical).
export function bandTint10(s10: number): string {
  return BAND_TINT[bandFromScore(Math.round(s10) * 10)];
}
