/**
 * Tiny original pixel-art icons drawn on an 8×8 / 12×12 grid with <rect>s so
 * they stay crisp at any size. No external assets. Each icon takes a `size`.
 */
type IconProps = { size?: number; className?: string };

function Svg({ size = 16, vb = 8, children, className }: IconProps & { vb?: number; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      className={`px-crisp ${className ?? ""}`}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Gold coin. */
export function CoinIcon({ size = 16, className }: IconProps) {
  return (
    <Svg size={size} vb={8} className={className}>
      <rect x="2" y="0" width="4" height="8" fill="#c98517" />
      <rect x="0" y="2" width="8" height="4" fill="#c98517" />
      <rect x="2" y="1" width="4" height="6" fill="#f7bd3f" />
      <rect x="1" y="2" width="6" height="4" fill="#f7bd3f" />
      <rect x="3" y="2" width="2" height="4" fill="#ffe08a" />
      <rect x="2" y="1" width="1" height="1" fill="#ffe08a" />
    </Svg>
  );
}

/** Cyan gem. */
export function GemIcon({ size = 16, className }: IconProps) {
  return (
    <Svg size={size} vb={8} className={className}>
      <rect x="2" y="1" width="4" height="1" fill="#7fe3ff" />
      <rect x="1" y="2" width="6" height="1" fill="#39c6ef" />
      <rect x="1" y="3" width="6" height="1" fill="#23a7d4" />
      <rect x="2" y="4" width="4" height="1" fill="#1f8fbf" />
      <rect x="3" y="5" width="2" height="1" fill="#176f99" />
      <rect x="3" y="2" width="1" height="2" fill="#d6f7ff" />
    </Svg>
  );
}

/** Star. */
export function StarIcon({ size = 16, className }: IconProps) {
  return (
    <Svg size={size} vb={8} className={className}>
      <rect x="3" y="0" width="2" height="8" fill="#ffd76b" />
      <rect x="0" y="3" width="8" height="2" fill="#ffd76b" />
      <rect x="2" y="1" width="4" height="6" fill="#ffe9a6" />
      <rect x="1" y="2" width="6" height="4" fill="#ffe9a6" />
      <rect x="3" y="2" width="2" height="4" fill="#fff6d8" />
    </Svg>
  );
}

/** Flame (streak). */
export function FlameIcon({ size = 16, className }: IconProps) {
  return (
    <Svg size={size} vb={8} className={className}>
      <rect x="3" y="0" width="2" height="2" fill="#ff8f3c" />
      <rect x="2" y="2" width="4" height="2" fill="#ff6a2c" />
      <rect x="1" y="4" width="6" height="3" fill="#ff8f3c" />
      <rect x="2" y="5" width="4" height="2" fill="#ffd23c" />
      <rect x="3" y="3" width="2" height="3" fill="#ffe27a" />
    </Svg>
  );
}

/** Section / nav glyphs — drawn on a 12×12 grid. */
export function HomeGlyph({ size = 22, className }: IconProps) {
  return (
    <Svg size={size} vb={12} className={className}>
      <rect x="5" y="1" width="2" height="2" fill="currentColor" />
      <rect x="4" y="2" width="4" height="1" fill="currentColor" />
      <rect x="3" y="3" width="6" height="1" fill="currentColor" />
      <rect x="2" y="4" width="8" height="1" fill="currentColor" />
      <rect x="3" y="5" width="6" height="6" fill="currentColor" />
      <rect x="5" y="7" width="2" height="4" fill="var(--color-ink)" />
    </Svg>
  );
}
export function AcademyGlyph({ size = 22, className }: IconProps) {
  return (
    <Svg size={size} vb={12} className={className}>
      <rect x="2" y="3" width="8" height="2" fill="currentColor" />
      <rect x="1" y="4" width="10" height="1" fill="currentColor" />
      <rect x="5" y="2" width="2" height="2" fill="currentColor" />
      <rect x="3" y="6" width="6" height="3" fill="currentColor" />
      <rect x="4" y="9" width="4" height="1" fill="currentColor" />
    </Svg>
  );
}
export function PuzzleGlyph({ size = 22, className }: IconProps) {
  return (
    <Svg size={size} vb={12} className={className}>
      <rect x="2" y="2" width="4" height="4" fill="currentColor" />
      <rect x="6" y="3" width="4" height="3" fill="currentColor" />
      <rect x="3" y="6" width="3" height="4" fill="currentColor" />
      <rect x="6" y="6" width="4" height="4" fill="currentColor" />
      <rect x="5" y="1" width="2" height="2" fill="currentColor" />
    </Svg>
  );
}
export function PlayGlyph({ size = 22, className }: IconProps) {
  return (
    <Svg size={size} vb={12} className={className}>
      <rect x="2" y="2" width="8" height="8" fill="currentColor" />
      <rect x="2" y="2" width="2" height="2" fill="var(--color-ink)" />
      <rect x="6" y="2" width="2" height="2" fill="var(--color-ink)" />
      <rect x="4" y="4" width="2" height="2" fill="var(--color-ink)" />
      <rect x="2" y="6" width="2" height="2" fill="var(--color-ink)" />
      <rect x="6" y="6" width="2" height="2" fill="var(--color-ink)" />
    </Svg>
  );
}
export function ProfileGlyph({ size = 22, className }: IconProps) {
  return (
    <Svg size={size} vb={12} className={className}>
      <rect x="4" y="2" width="4" height="4" fill="currentColor" />
      <rect x="3" y="7" width="6" height="3" fill="currentColor" />
      <rect x="2" y="9" width="8" height="1" fill="currentColor" />
    </Svg>
  );
}
export function GearGlyph({ size = 18, className }: IconProps) {
  return (
    <Svg size={size} vb={12} className={className}>
      <rect x="5" y="1" width="2" height="10" fill="currentColor" />
      <rect x="1" y="5" width="10" height="2" fill="currentColor" />
      <rect x="2.5" y="2.5" width="2" height="2" fill="currentColor" transform="rotate(0)" />
      <rect x="3" y="3" width="6" height="6" fill="currentColor" />
      <rect x="5" y="5" width="2" height="2" fill="var(--color-panel)" />
    </Svg>
  );
}
