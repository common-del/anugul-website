import cardList from "../../public/data/pdf-cards.json";

// Asset base URLs. Default to the in-repo /data paths (self-hosted in the
// deploy). Set the NEXT_PUBLIC_*_BASE env vars (no trailing slash) to serve the
// PDFs / preview images from a CDN / object store instead — that lets the
// ~470 MB of report-card assets leave the Vercel deploy. Cutover steps:
// scripts/OFFLOAD_PDFS.md.
//   e.g. NEXT_PUBLIC_CARD_BASE=https://cdn.example.com/cards
const CARD_BASE = process.env.NEXT_PUBLIC_CARD_BASE || "/data/cards";
const CARDIMG_BASE = process.env.NEXT_PUBLIC_CARDIMG_BASE || "/data/cardimg";
const HCARD_BASE = process.env.NEXT_PUBLIC_HCARD_BASE || "/data/hcards";

const cardSet = new Set(cardList as string[]);

export function hasCard(udise: string): boolean {
  return cardSet.has(udise);
}

export function cardUrl(udise: string): string {
  return `${CARD_BASE}/${udise}.pdf`;
}

// Page-1 preview image of the printed card (in-repo, public/data/cardimg).
// Same set as the hosted PDFs, so hasCard() also gates the image.
export function cardImg(udise: string): string {
  return `${CARDIMG_BASE}/${udise}.webp`;
}

// Official School-Head report cards (3-page, with the how-to-read guide),
// self-hosted at public/data/hcards. Manifest: public/data/hcards.json.
import hcardList from "../../public/data/hcards.json";

const hcardSet = new Set(hcardList as string[]);

export function hasHcard(udise: string): boolean {
  return hcardSet.has(udise);
}

export function hcardUrl(udise: string): string {
  return `${HCARD_BASE}/${udise}.pdf`;
}
