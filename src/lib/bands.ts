// Result bands. Colour is always paired with the band word + number in the UI,
// so it never carries meaning on its own (accessibility).
export type BandKey = "urgent" | "needs" | "developing" | "excelling";

export const BAND_COLOR: Record<BandKey, string> = {
  urgent: "#C24E36", // critical → coral-700
  needs: "#E5A24F", // mid-low / needs attention → amber
  developing: "#2D3A47", // mid-high → slate
  excelling: "#1A1F26", // top → slate-700
};

// Darker variants for band-coloured TEXT on light backgrounds — the fills above
// fail WCAG AA as small text (esp. amber), so text uses these (>=4.5:1 on white).
export const BAND_TEXT: Record<BandKey, string> = {
  urgent: "#C24E36", // coral-700
  needs: "#A85A0F", // dark amber (amber fill is too light for text)
  developing: "#2D3A47", // slate
  excelling: "#1A1F26", // slate-700
};

export function bandFromScore(s: number): BandKey {
  if (s <= 25) return "urgent";
  if (s <= 50) return "needs";
  if (s <= 75) return "developing";
  return "excelling";
}
