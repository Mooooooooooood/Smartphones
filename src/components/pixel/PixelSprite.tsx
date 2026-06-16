/**
 * Original pixel-art guide characters — a small cast of chess-piece mascots
 * drawn on a fixed 12×14 grid. Each row is exactly 12 chars; cells map to a
 * shared palette. No external assets. A consistent face keeps them a family;
 * a per-piece "topper" makes each recognisable.
 */
export type BuddyPiece = "pawn" | "knight" | "rook" | "bishop" | "queen" | "king";

const W = 12;

/* Per-piece topper (rows 0-5). Body+face (rows 6-13) is shared. */
const TOPPERS: Record<BuddyPiece, string[]> = {
  pawn: [
    "............",
    ".....oo.....",
    "....ohho....",
    "....obbo....",
    ".....oo.....",
    "............",
  ],
  knight: [
    "...o....o...",
    "...oa..ao...",
    "...oab.bao..",
    "....obbo....",
    ".....oo.....",
    "............",
  ],
  rook: [
    "...o.o.o.o..",
    "...oaoaoao..",
    "...obbbbbo..",
    "...obbbbbo..",
    "....ooooo...",
    "............",
  ],
  bishop: [
    ".....oo.....",
    "....obbo....",
    "....oaao....",
    "....obbo....",
    ".....oo.....",
    "............",
  ],
  queen: [
    "..o.o.o.o...",
    "..oaoaoao...",
    "..oa.a.ao...",
    "..obbbbbo...",
    "...ooooo....",
    "............",
  ],
  king: [
    ".....o......",
    "...ooooo....",
    ".....o......",
    "..oaoaoao...",
    "..obbbbbo...",
    "...ooooo....",
  ],
};

/* Shared body + face (rows 6-13). e=eye, k=cheek, m=mouth. */
const BODY: string[] = [
  "....oooo....",
  "...obbbbo...",
  "..obebebbo..",
  "..obkbbkbo..",
  ".obbmmmmbbo.",
  ".obbbbbbbbo.",
  "oobbbbbbbboo",
  "oooooooooooo",
];

const PALETTE: Record<BuddyPiece, { body: string; hi: string; line: string; accent: string }> = {
  pawn: { body: "#5b9bff", hi: "#9cc3ff", line: "#1d3f8a", accent: "#cfe0ff" },
  knight: { body: "#4cce7a", hi: "#8ef0a8", line: "#1d7344", accent: "#d6ffe4" },
  rook: { body: "#ff9b46", hi: "#ffc285", line: "#a8531a", accent: "#ffe3c2" },
  bishop: { body: "#b48cff", hi: "#d6c2ff", line: "#5a3fc0", accent: "#efe6ff" },
  queen: { body: "#ff7d92", hi: "#ffb0bd", line: "#b32436", accent: "#ffd76b" },
  king: { body: "#ffd24a", hi: "#ffe79a", line: "#b8841a", accent: "#fff3c4" },
};

export interface SpritePalette {
  body: string;
  hi: string;
  line: string;
  accent: string;
}

/** Named palette overrides for special identities (player avatar, rival). */
export const PLAYER_PALETTES: Record<string, SpritePalette> = {
  gold: { body: "#ffd24a", hi: "#ffe79a", line: "#b8841a", accent: "#fff3c4" },
  red: { body: "#ff5468", hi: "#ff8f9e", line: "#a01b2c", accent: "#ffd0d6" },
  blue: { body: "#4d8dff", hi: "#9cc3ff", line: "#1d3f8a", accent: "#dbe9ff" },
  green: { body: "#45d36c", hi: "#8ef0a8", line: "#1d7344", accent: "#d6ffe4" },
  purple: { body: "#8a6fe0", hi: "#cdb8ff", line: "#4a2fa0", accent: "#efe6ff" },
  // Premium tints (bought in the Shop).
  ember: { body: "#ff7a2f", hi: "#ffb066", line: "#a8400c", accent: "#ffe0a0" },
  frost: { body: "#5fd6e8", hi: "#b6f0fa", line: "#1d7a8a", accent: "#e0fbff" },
  mint: { body: "#3fd6a0", hi: "#8ff0cf", line: "#1a8a64", accent: "#d8fff0" },
  void: { body: "#6a4fa0", hi: "#a98fe0", line: "#1a1030", accent: "#d8c8ff" },
};

/** The striking elite-rival palette (intense crimson with a hot rim). */
export const RIVAL_PALETTE: SpritePalette = { body: "#e01034", hi: "#ff5a72", line: "#6e0014", accent: "#ffd23c" };

export default function PixelSprite({
  piece,
  size = 56,
  className = "",
  palette,
}: {
  piece: BuddyPiece;
  size?: number;
  className?: string;
  palette?: SpritePalette;
}) {
  const p = palette ?? PALETTE[piece];
  const grid = [...TOPPERS[piece], ...BODY];
  const H = grid.length;
  const fill = (ch: string): string | null => {
    switch (ch) {
      case "o":
        return p.line;
      case "b":
        return p.body;
      case "h":
        return p.hi;
      case "a":
        return p.accent;
      case "e":
        return "#101730"; // eyes
      case "k":
        return "#ff9bb0"; // cheeks
      case "m":
        return p.line; // mouth
      default:
        return null;
    }
  };

  const rects: React.ReactNode[] = [];
  for (let y = 0; y < H; y++) {
    const row = grid[y];
    for (let x = 0; x < W; x++) {
      const c = fill(row[x]);
      if (c) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={c} />);
    }
  }

  return (
    <svg
      width={size}
      height={(size * H) / W}
      viewBox={`0 0 ${W} ${H}`}
      className={`px-crisp ${className}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${piece} guide`}
    >
      {/* soft shadow */}
      <rect x={2} y={H - 0.5} width={8} height={0.6} fill="#000" opacity={0.25} />
      {rects}
    </svg>
  );
}
