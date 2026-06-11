/**
 * Reusable platformer-world scenery — soft custom SVG clouds, floating islands,
 * and sparkles shared across the Academy map, lesson stages, and previews.
 * Everything is theme-aware via the scene CSS variables in globals.css, so the
 * same components render a sunny day world and a magical night world.
 */
import type { CSSProperties } from "react";

/* ---------- Soft rounded cloud ---------- */
export function Cloud({
  className = "",
  scale = 1,
  far = false,
  style,
}: {
  className?: string;
  scale?: number;
  far?: boolean;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={104 * scale}
      height={52 * scale}
      viewBox="0 0 104 52"
      className={className}
      style={style}
      aria-hidden
    >
      {/* puffy body built from overlapping rounded lobes for a soft toy look */}
      <g opacity={far ? 0.55 : 1}>
        <ellipse cx="34" cy="34" rx="22" ry="16" fill="var(--cloud-fill)" />
        <ellipse cx="58" cy="30" rx="26" ry="20" fill="var(--cloud-fill)" />
        <ellipse cx="78" cy="36" rx="18" ry="13" fill="var(--cloud-fill)" />
        <rect x="22" y="36" width="64" height="12" rx="6" fill="var(--cloud-fill)" />
        {/* soft top highlight */}
        <ellipse cx="54" cy="24" rx="20" ry="8" fill="var(--cloud-top)" />
      </g>
    </svg>
  );
}

/* ---------- Four-point sparkle ---------- */
export function Sparkle({ className = "", size = 12 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} aria-hidden>
      <path d="M6 0 C6.4 3.2 8.8 5.6 12 6 C8.8 6.4 6.4 8.8 6 12 C5.6 8.8 3.2 6.4 0 6 C3.2 5.6 5.6 3.2 6 0 Z" fill="var(--sparkle)" />
    </svg>
  );
}

/* ---------- Floating grass-topped island ---------- */
export function FloatingIsland({
  w,
  className = "",
  style,
}: {
  w: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={w}
      height={w * 0.66}
      viewBox="0 0 100 66"
      className={className}
      aria-hidden
      style={{ filter: "drop-shadow(0 8px 6px var(--island-shadow))", ...style }}
    >
      {/* dirt / rock base */}
      <path d="M7 22 C11 46 27 60 50 60 C73 60 89 46 93 22 C73 33 27 33 7 22 Z" fill="var(--island-dirt)" />
      <path d="M15 27 C21 47 33 55 50 55 C40 52 29 47 22 38 C18 33 16 29 15 27 Z" fill="var(--island-dirt2)" opacity="0.6" />
      {/* dangling rocks */}
      <ellipse cx="33" cy="57" rx="3.2" ry="6.5" fill="var(--island-dirt2)" />
      <ellipse cx="63" cy="58" rx="2.8" ry="7.5" fill="var(--island-dirt2)" />
      <ellipse cx="49" cy="61" rx="2.4" ry="5" fill="var(--island-dirt2)" />
      {/* grass cap — base, mid band, bright highlight */}
      <ellipse cx="50" cy="20" rx="47" ry="14" fill="var(--island-grass2)" />
      <ellipse cx="50" cy="18" rx="46" ry="13" fill="var(--island-grass)" />
      <ellipse cx="46" cy="14" rx="32" ry="6.5" fill="var(--island-grass-hi)" opacity="0.7" />
    </svg>
  );
}

/* ---------- Tiny distant islet for depth ---------- */
export function MiniIslet({ className = "", w = 34 }: { className?: string; w?: number }) {
  return (
    <svg width={w} height={w * 0.6} viewBox="0 0 50 30" className={className} aria-hidden style={{ opacity: 0.5 }}>
      <path d="M4 12 C6 22 14 27 25 27 C36 27 44 22 46 12 C36 18 14 18 4 12 Z" fill="var(--island-dirt)" />
      <ellipse cx="25" cy="11" rx="22" ry="7" fill="var(--island-grass)" />
      <ellipse cx="23" cy="9" rx="15" ry="3.5" fill="var(--island-grass-hi)" opacity="0.6" />
    </svg>
  );
}

/* ---------- Crescent moon (night only) ---------- */
export function Moon({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <radialGradient id="moonglow" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="rgba(252,243,200,0.35)" />
          <stop offset="100%" stopColor="rgba(252,243,200,0)" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#moonglow)" />
      <circle cx="20" cy="20" r="11" fill="#fdf3c8" />
      <circle cx="25" cy="17" r="10" fill="var(--sky-1)" />
    </svg>
  );
}
