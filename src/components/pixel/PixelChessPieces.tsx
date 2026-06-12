import type { JSX } from "react";

/**
 * Original pixel-art chess piece set for react-chessboard v5. Each piece is a
 * silhouette drawn on a 12×14 grid: `O` = outline, `X` = fill. White pieces use
 * a cream fill + dark outline; black pieces use a dark fill + light rim so both
 * stay high-contrast and readable on the blue pixel board at iPhone sizes.
 */
const PAWN = [
  "............",
  "............",
  "....OOOO....",
  "...OXXXXO...",
  "...OXXXXO...",
  "....OXXO....",
  "...OXXXXO...",
  "..OXXXXXXO..",
  "..OXXXXXXO..",
  ".OXXXXXXXXO.",
  ".OXXXXXXXXO.",
  "OXXXXXXXXXXO",
  "OOOOOOOOOOOO",
  "............",
];
const KNIGHT = [
  "............",
  "....OOO.....",
  "...OXXOO....",
  "..OXXXXXO...",
  ".OXOXXXXO...",
  ".OXXXOXXO...",
  ".OOXXXXXO...",
  "...OXXXXO...",
  "...OXXXXO...",
  "..OXXXXXO...",
  ".OXXXXXXXO..",
  ".OXXXXXXXO..",
  "OOOOOOOOOOO.",
  "............",
];
const BISHOP = [
  ".....OO.....",
  "....OXXO....",
  "....OXXO....",
  "...OXXXXO...",
  "...OXOXXO...",
  "...OXXXXO...",
  "....OXXO....",
  "....OXXO....",
  "...OXXXXO...",
  "..OXXXXXXO..",
  ".OXXXXXXXXO.",
  ".OXXXXXXXXO.",
  ".OOOOOOOOOO.",
  "............",
];
const ROOK = [
  "............",
  ".OO..OO..OO.",
  ".OOOOOOOOOO.",
  ".OXXXXXXXXO.",
  "..OXXXXXXO..",
  "..OXXXXXXO..",
  "..OXXXXXXO..",
  "..OXXXXXXO..",
  "..OXXXXXXO..",
  ".OXXXXXXXXO.",
  ".OXXXXXXXXO.",
  ".OOOOOOOOOO.",
  "............",
  "............",
];
const QUEEN = [
  "............",
  "O.O.O.O.O.O.",
  ".OOOOOOOOOO.",
  ".OXXXXXXXXO.",
  ".OXXXXXXXXO.",
  "..OXXXXXXO..",
  "..OXXXXXXO..",
  "...OXXXXO...",
  "...OXXXXO...",
  "..OXXXXXXO..",
  ".OXXXXXXXXO.",
  ".OXXXXXXXXO.",
  ".OOOOOOOOOO.",
  "............",
];
const KING = [
  ".....OO.....",
  ".....OO.....",
  "...OOOOOO...",
  ".....OO.....",
  "....OXXO....",
  "...OXXXXO...",
  "..OXXXXXXO..",
  ".OXXXXXXXXO.",
  ".OXXXXXXXXO.",
  ".OXXXXXXXXO.",
  "..OXXXXXXO..",
  ".OXXXXXXXXO.",
  ".OOOOOOOOOO.",
  "............",
];

const GRIDS: Record<string, string[]> = { p: PAWN, n: KNIGHT, b: BISHOP, r: ROOK, q: QUEEN, k: KING };

const W = 12;

function render(grid: string[], fill: string, outline: string, hi: string): JSX.Element {
  const rects: JSX.Element[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < W; x++) {
      const ch = grid[y][x];
      if (ch === "O") rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={outline} />);
      else if (ch === "X") {
        // top third gets a lighter highlight for a touch of pixel shading
        const c = y < grid.length * 0.45 ? hi : fill;
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={c} />);
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${grid.length}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated", filter: "drop-shadow(0 1px 0 rgba(0,0,0,0.35))" }}
    >
      {rects}
    </svg>
  );
}

const WHITE = { fill: "#ede6cf", outline: "#26201c", hi: "#fbf7ea" };
const BLACK = { fill: "#222a44", outline: "#0a0e1c", hi: "#39456e" };
// Light rim helps black pieces pop on dark squares.
const BLACK_RIM = "#aab6e0";

type RenderFn = (props?: { fill?: string; square?: string; svgStyle?: React.CSSProperties }) => JSX.Element;

function build(): Record<string, RenderFn> {
  const out: Record<string, RenderFn> = {};
  for (const [t, grid] of Object.entries(GRIDS)) {
    out[`w${t.toUpperCase()}`] = () => render(grid, WHITE.fill, WHITE.outline, WHITE.hi);
    out[`b${t.toUpperCase()}`] = () => render(grid, BLACK.fill, BLACK_RIM, BLACK.hi);
  }
  return out;
}

/** Piece render map passed to react-chessboard's `pieces` option. */
export const PIXEL_PIECES: Record<string, RenderFn> = build();
