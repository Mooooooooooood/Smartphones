/**
 * Generates public/icon.svg — the Pawnquest app icon: a pixel-art pawn wearing
 * a gold crown (a pawn on its quest to be crowned) in the navy/brass brand
 * palette, matching the in-app PixelSprite aesthetic. Authored as a 24×24 grid
 * so it stays crisp; run `npm run genicon` then `npm run genicons` to rasterize.
 */
import { writeFileSync } from "node:fs";

const GRID = [
  "........g..gg..g........", // 0  crown gems
  "........o..oo..o........", // 1
  ".......oCooCCooCo.......", // 2  crown spikes
  "......oCCCCCCCCCCo......", // 3
  ".....oCCCCCggCCCCCo.....", // 4  band + centre gems
  ".....oddddddddddddo.....", // 5  crown rim
  ".........obbbbo.........", // 6  head top
  ".......ohhbbbbbbo.......", // 7
  "......ohhbbbbbbbbo......", // 8
  ".....ohhbbbbbbbbbbo.....", // 9  head widest
  ".....obbbbbbbbbbbso.....", // 10
  "......obbbbbbbbbso......", // 11
  ".......obbbbbbbso.......", // 12 chin
  "........obbbbbso........", // 13 neck
  ".....obbbbbbbbbbbso.....", // 14 collar disc
  ".....osssssssssssso.....", // 15 collar shade
  ".......obbbbbbbso.......", // 16 waist
  "........obbbbbbo........", // 17
  ".......obbbbbbbbo.......", // 18
  ".....obbbbbbbbbbbbo.....", // 19
  "....obbbbbbbbbbbbbbo....", // 20 flare
  "...obbbbbbbbbbbbbbbbo...", // 21 base
  "...osssssssssssssssso...", // 22 base shade
  "..oooooooooooooooooooo..", // 23 sole
];

const COLORS: Record<string, string> = {
  o: "#0c1230", // outline
  b: "#f0e2bd", // pawn body (ivory)
  h: "#fffdf3", // highlight
  s: "#d3bd92", // shade
  C: "#f7bd3f", // crown gold
  y: "#ffd76b", // crown highlight
  d: "#c98517", // crown deep
  g: "#ff5468", // gem
};

const N = 24;
const CELL = 16;
const OFF = (512 - N * CELL) / 2; // centre the 384px figure → 64px margin

GRID.forEach((row, i) => {
  if (row.length !== N) throw new Error(`row ${i} is ${row.length} cells, expected ${N}`);
});

// Merge horizontal runs of one colour into a single <rect> for a compact file.
const rects: string[] = [];
for (let y = 0; y < N; y++) {
  let x = 0;
  while (x < N) {
    const ch = GRID[y][x];
    if (ch === ".") { x++; continue; }
    let run = 1;
    while (x + run < N && GRID[y][x + run] === ch) run++;
    const px = OFF + x * CELL;
    const py = OFF + y * CELL;
    rects.push(`<rect x="${px}" y="${py}" width="${run * CELL}" height="${CELL}" fill="${COLORS[ch]}"/>`);
    x += run;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" shape-rendering="crispEdges">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="#21337a"/>
      <stop offset="0.55" stop-color="#141f53"/>
      <stop offset="1" stop-color="#0a1130"/>
    </radialGradient>
  </defs>
  <!-- full-bleed navy background (safe for maskable icons) -->
  <rect x="0" y="0" width="512" height="512" fill="url(#bg)"/>
  <!-- brass sparkles flanking the crown -->
  <g fill="#ffd76b">
    <path d="M120 150 l8 22 22 8 -22 8 -8 22 -8 -22 -22 -8 22 -8 z"/>
    <path d="M404 176 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6 z"/>
    <rect x="150" y="300" width="9" height="9"/>
    <rect x="360" y="330" width="9" height="9"/>
  </g>
  <!-- crowned pawn -->
  ${rects.join("\n  ")}
</svg>
`;

writeFileSync("public/icon.svg", svg);
console.log(`✓ public/icon.svg written (${rects.length} pixel rects)`);
