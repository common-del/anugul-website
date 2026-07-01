// Result bands. Colour is always paired with the band word + number in the UI,
// so it never carries meaning on its own (accessibility).
export type BandKey = "urgent" | "needs" | "developing" | "excelling";

export const BAND_COLOR: Record<BandKey, string> = {
  urgent: "#b3261e",
  needs: "#e07b1a",
  developing: "#2f74c0",
  excelling: "#123c7b",
};

// Darker variants for band-coloured TEXT on light backgrounds — the fills above
// fail WCAG AA as small text (esp. amber), so text uses these (>=4.5:1 on white).
export const BAND_TEXT: Record<BandKey, string> = {
  urgent: "#b3261e",
  needs: "#a85a0f",
  developing: "#205a9e",
  excelling: "#123c7b",
};

export function bandFromScore(s: number): BandKey {
  if (s <= 25) return "urgent";
  if (s <= 50) return "needs";
  if (s <= 75) return "developing";
  return "excelling";
}
