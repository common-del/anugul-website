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
