import cardList from "../../public/data/pdf-cards.json";

// Printed report cards are self-hosted in the deploy (public/data/cards and
// public/data/hcards). Blob hosting was retired 2026-07-07: exceeding the
// Hobby write cap got the whole store blocked (403 on reads), breaking every
// download — local static files have no such failure mode.
const cardSet = new Set(cardList as string[]);

export function hasCard(udise: string): boolean {
  return cardSet.has(udise);
}

export function cardUrl(udise: string): string {
  return `/data/cards/${udise}.pdf`;
}

// Page-1 preview image of the printed card (in-repo, public/data/cardimg).
// Same set as the hosted PDFs, so hasCard() also gates the image.
export function cardImg(udise: string): string {
  return `/data/cardimg/${udise}.webp`;
}

// Official School-Head report cards (3-page, with the how-to-read guide),
// self-hosted at public/data/hcards. Manifest: public/data/hcards.json.
import hcardList from "../../public/data/hcards.json";

const hcardSet = new Set(hcardList as string[]);

export function hasHcard(udise: string): boolean {
  return hcardSet.has(udise);
}

export function hcardUrl(udise: string): string {
  return `/data/hcards/${udise}.pdf`;
}
