/**
 * Original Tabiya chess-piece guide characters — a small cast of cute, rounded
 * cartoon pieces rendered as plain SVG (no external assets). Each shares the
 * same friendly face for a consistent family look, with a piece-specific
 * topper and a soft pastel colour.
 */

export type BuddyPiece = "pawn" | "knight" | "rook" | "bishop" | "queen" | "king";

export interface BuddyMeta {
  piece: BuddyPiece;
  name: string;
  role: string;
}

export const BUDDIES: Record<BuddyPiece, BuddyMeta> = {
  pawn: { piece: "pawn", name: "Pip", role: "Beginner guide" },
  knight: { piece: "knight", name: "Gallop", role: "Tactics coach" },
  rook: { piece: "rook", name: "Bramble", role: "Sparring partner" },
  bishop: { piece: "bishop", name: "Bea", role: "Lesson mentor" },
  queen: { piece: "queen", name: "Vera", role: "Challenge host" },
  king: { piece: "king", name: "Cassius", role: "Academy master" },
};

const COLORS: Record<BuddyPiece, { fill: string; line: string }> = {
  pawn: { fill: "#bfdbfe", line: "#60a5fa" },
  knight: { fill: "#bbf7d0", line: "#34d399" },
  rook: { fill: "#fed7aa", line: "#fb923c" },
  bishop: { fill: "#ddd6fe", line: "#a78bfa" },
  queen: { fill: "#fecdd3", line: "#fb7185" },
  king: { fill: "#fde68a", line: "#f59e0b" },
};

const INK = "#1e293b";
const CHEEK = "#fda4af";

function Face({ cx, eyeY }: { cx: number; eyeY: number }) {
  return (
    <g>
      <circle cx={cx - 11} cy={eyeY + 4} r={2.6} fill={CHEEK} opacity={0.55} />
      <circle cx={cx + 11} cy={eyeY + 4} r={2.6} fill={CHEEK} opacity={0.55} />
      <circle cx={cx - 6} cy={eyeY} r={2.3} fill={INK} />
      <circle cx={cx + 6} cy={eyeY} r={2.3} fill={INK} />
      <path
        d={`M${cx - 5} ${eyeY + 6} Q${cx} ${eyeY + 10} ${cx + 5} ${eyeY + 6}`}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  );
}

export default function ChessBuddy({
  piece,
  size = 64,
  className = "",
}: {
  piece: BuddyPiece;
  size?: number;
  className?: string;
}) {
  const c = COLORS[piece];
  const sw = 2.5;
  const common = { fill: c.fill, stroke: c.line, strokeWidth: sw, strokeLinejoin: "round" as const };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 64"
      className={className}
      role="img"
      aria-label={`${BUDDIES[piece].name} the ${piece}`}
    >
      {/* shadow */}
      <ellipse cx={28} cy={60} rx={17} ry={3.2} fill={c.line} opacity={0.18} />

      {piece === "pawn" ? (
        <g>
          <path d="M15 58 C13 45 18 41 28 41 C38 41 43 45 41 58 Z" {...common} />
          <circle cx={28} cy={26} r={15} {...common} />
          <Face cx={28} eyeY={24} />
        </g>
      ) : (
        <g>
          {/* shared rounded body */}
          <path
            d="M13 52 C13 33 20 29 28 29 C36 29 43 33 43 52 C43 57 38 58 28 58 C18 58 13 57 13 52 Z"
            {...common}
          />
          {/* piece-specific topper */}
          {piece === "knight" ? (
            <g>
              <path d="M19 30 L17 16 L27 27 Z" {...common} />
              <path d="M37 30 L39 16 L29 27 Z" {...common} />
              <circle cx={28} cy={24} r={4} fill={c.line} opacity={0.5} />
            </g>
          ) : null}
          {piece === "rook" ? (
            <g>
              <rect x={15} y={18} width={26} height={13} rx={2} {...common} />
              <rect x={17.5} y={13} width={6} height={8} rx={1} {...common} />
              <rect x={25} y={13} width={6} height={8} rx={1} {...common} />
              <rect x={32.5} y={13} width={6} height={8} rx={1} {...common} />
            </g>
          ) : null}
          {piece === "bishop" ? (
            <g>
              <path d="M28 8 C36 16 36 27 28 31 C20 27 20 16 28 8 Z" {...common} />
              <circle cx={28} cy={7} r={3.2} {...common} />
              <path d="M28 14 L28 24" stroke={c.line} strokeWidth={2} strokeLinecap="round" />
            </g>
          ) : null}
          {piece === "queen" ? (
            <g>
              <path d="M16 30 L18 16 L23 24 L28 14 L33 24 L38 16 L40 30 Z" {...common} />
              <circle cx={18} cy={15} r={2.6} {...common} />
              <circle cx={28} cy={12} r={2.8} {...common} />
              <circle cx={38} cy={15} r={2.6} {...common} />
            </g>
          ) : null}
          {piece === "king" ? (
            <g>
              <rect x={17} y={20} width={22} height={11} rx={2} {...common} />
              <path d="M17 21 L28 13 L39 21 Z" {...common} />
              <rect x={26} y={3} width={4} height={11} rx={1.4} {...common} />
              <rect x={22} y={6.5} width={12} height={4} rx={1.4} {...common} />
            </g>
          ) : null}
          <Face cx={28} eyeY={42} />
        </g>
      )}
    </svg>
  );
}
