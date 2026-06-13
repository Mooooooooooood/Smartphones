import type { JSX } from "react";

/**
 * Classic detailed pixel-Staunton piece set for react-chessboard v5. Each piece
 * is a 16-wide silhouette: O = outline, X = body, H = highlight, S = shadow.
 * White = ivory body + dark outline; black = charcoal body + light rim (so the
 * dark pieces stay readable on the blue board). Rows are merged into runs to
 * keep the board's DOM-node count low on iPhone.
 */
const W = 16;

/* Shared foot/base (rows align across all pieces). */
const BASE = [
  "....OXXXXXXO....",
  "...OHXXXXXXSO...",
  "..OXXXXXXXXXXO..",
  "..OXXXXXXXXXXO..",
  "..OOOOOOOOOOOO..",
];

const PAWN = [
  "................",
  "......OOOO......",
  ".....OHHHHO.....",
  ".....OXXXXO.....",
  ".....OXXXSO.....",
  "......OXXO......",
  ".....OXXXXO.....",
  "....OHXXXXXO....",
  ".....OXXXXO.....",
  "......OXXO......",
  ".....OXXXXO.....",
  ...BASE,
];

const KING = [
  ".......OO.......",
  ".....OOOOOO.....",
  ".......OO.......",
  "......OXXO......",
  ".....OXXXXO.....",
  "....OXHHHHXO....",
  "....OXXXXXXO....",
  ".....OXXXXO.....",
  ".....OXXXXO.....",
  "....OXXXXXXO....",
  "...OXXXXXXXXO...",
  ...BASE,
];

const QUEEN = [
  "...O.O.O.O.O....",
  "...OXOXOXOXO....",
  "...OXXXXXXXO....",
  "....OHXXXHO.....",
  "....OXXXXXO.....",
  ".....OXXXO......",
  ".....OXXXXO.....",
  "....OXXXXXXO....",
  ".....OXXXXO.....",
  "....OXXXXXXO....",
  "...OXXXXXXXXO...",
  ...BASE,
];

const ROOK = [
  "................",
  "..OXO.OXO.OXO...",
  "..OXXXXXXXXXO...",
  "..OXHHHHHHHXO...",
  "...OXXXXXXXO....",
  "...OXXXXXXXO....",
  "....OXXXXXO.....",
  "....OXXXXXO.....",
  "....OXXXXXO.....",
  "...OXXXXXXXO....",
  "..OXXXXXXXXXO...",
  ...BASE,
];

const BISHOP = [
  ".......OO.......",
  "......OHHO......",
  "......OXXO......",
  ".....OXXXXO.....",
  ".....OXSXXO.....",
  "....OXXXXXXO....",
  "....OXXSXXXO....",
  ".....OXXXXO.....",
  ".....OXXXXO.....",
  "....OXXXXXXO....",
  "...OXXXXXXXXO...",
  ...BASE,
];

const KNIGHT = [
  "................",
  ".....OOO........",
  "....OXXOOO......",
  "...OXHXXXXO.....",
  "..OXXXXXXXXO....",
  "..OXXOXXXXXO....",
  "..OOXXXXXXXO....",
  "....OXXXXXXO....",
  "....OXXXXXXO....",
  "...OXXXXXXXO....",
  "..OXXXXXXXXXO...",
  ...BASE,
];

const GRIDS: Record<string, string[]> = { p: PAWN, n: KNIGHT, b: BISHOP, r: ROOK, q: QUEEN, k: KING };

interface Palette { o: string; x: string; h: string; s: string }
const WHITE: Palette = { o: "#2a241c", x: "#e8dcc0", h: "#fbf4e2", s: "#c7b896" };
const BLACK: Palette = { o: "#cdd6f0", x: "#2c3349", h: "#454e6e", s: "#191e30" };

function render(grid: string[], p: Palette): JSX.Element {
  const colorFor = (ch: string): string | null =>
    ch === "O" ? p.o : ch === "X" ? p.x : ch === "H" ? p.h : ch === "S" ? p.s : null;
  // Merge horizontal runs of the same colour into one <rect>.
  const rects: JSX.Element[] = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    let x = 0;
    while (x < W) {
      const c = colorFor(row[x] ?? ".");
      if (c === null) { x++; continue; }
      let run = 1;
      while (x + run < W && colorFor(row[x + run] ?? ".") === c) run++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run + 0.02} height={1.02} fill={c} />);
      x += run;
    }
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${grid.length}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated", filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.3))" }}
    >
      {rects}
    </svg>
  );
}

type RenderFn = (props?: { fill?: string; square?: string; svgStyle?: React.CSSProperties }) => JSX.Element;

function build(): Record<string, RenderFn> {
  const out: Record<string, RenderFn> = {};
  for (const [t, grid] of Object.entries(GRIDS)) {
    out[`w${t.toUpperCase()}`] = () => render(grid, WHITE);
    out[`b${t.toUpperCase()}`] = () => render(grid, BLACK);
  }
  return out;
}

/** Piece render map passed to react-chessboard's `pieces` option. */
export const PIXEL_PIECES: Record<string, RenderFn> = build();
