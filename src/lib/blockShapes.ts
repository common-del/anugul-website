// Simplified, hand-authored block outlines for Angul, matching the tehsil map's
// layout (relative positions + rough shapes) — NOT survey-accurate. Names match
// the data's block names exactly so a tap filters correctly. Swap in a real
// GeoJSON later for precise boundaries. viewBox is 0 0 95 92.
export const BLOCK_SHAPES: {
  name: string;
  points: string;
  lx: number;
  ly: number;
}[] = [
  { name: "Pallahara", points: "44,28 49,10 67,6 80,18 82,35 68,41 54,40 45,33", lx: 63, ly: 22 },
  { name: "Kaniha", points: "45,33 54,40 68,41 72,51 62,55 52,49 47,41", lx: 59, ly: 46 },
  { name: "Talcher", points: "72,51 82,36 86,54 76,60 66,56 62,55", lx: 75, ly: 49 },
  { name: "Chhendipada", points: "28,34 45,33 47,41 52,49 49,57 37,58 29,49", lx: 39, ly: 45 },
  { name: "Kishore Nagar", points: "11,45 28,34 29,49 37,58 33,62 17,60 9,53", lx: 21, ly: 49 },
  { name: "Banarpal", points: "52,49 62,55 66,56 68,63 58,62 49,57", lx: 58, ly: 58 },
  { name: "Athamallik", points: "9,53 17,60 33,62 38,71 30,81 15,73 7,62", lx: 21, ly: 67 },
  { name: "Angul", points: "33,62 37,58 49,57 58,62 68,63 65,73 50,85 35,80", lx: 48, ly: 71 },
];
