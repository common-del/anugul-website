import cardList from "../../public/data/pdf-cards.json";

// Compressed printed report cards hosted on Vercel Blob (store: parent-report).
// URL shape: <BASE>/cards/<UDISE>.pdf  (uploaded with addRandomSuffix:false).
export const CARD_BASE =
  "https://hzvbydclz8z1ageu.public.blob.vercel-storage.com/cards";

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
  return `/data/cardimg/${udise}.webp`;
}
