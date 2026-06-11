/**
 * Reusable platformer-world scenery — soft custom SVG clouds, floating islands,
 * and sparkles shared across the Academy map, lesson stages, and previews.
 * Everything is theme-aware via the scene CSS variables in globals.css, so the
 * same components render a sunny day world and a magical night world.
 */
import type { CSSProperties } from "react";

/* ---------- Blocky pixel cloud ---------- */
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
  const f = "var(--cloud-fill)";
  const t = "var(--cloud-top)";
  return (
    <svg
      width={104 * scale}
      height={52 * scale}
      viewBox="0 0 26 13"
      className={`px-crisp ${className}`}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden
    >
      <g opacity={far ? 0.5 : 1}>
        {/* stepped puffy silhouette */}
        <rect x="9" y="2" width="6" height="2" fill={f} />
        <rect x="6" y="4" width="14" height="2" fill={f} />
        <rect x="3" y="6" width="20" height="3" fill={f} />
        <rect x="2" y="9" width="22" height="2" fill={f} />
        {/* top highlight band */}
        <rect x="9" y="3" width="6" height="1" fill={t} />
        <rect x="6" y="5" width="6" height="1" fill={t} />
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
      height={w * 0.7}
      viewBox="0 0 20 14"
      className={`px-crisp ${className}`}
      aria-hidden
      shapeRendering="crispEdges"
      style={{ filter: "drop-shadow(0 4px 0 var(--island-shadow))", ...style }}
    >
      {/* grass cap — highlight, base */}
      <rect x="2" y="1" width="16" height="2" fill="var(--island-grass-hi)" />
      <rect x="1" y="3" width="18" height="2" fill="var(--island-grass)" />
      <rect x="1" y="5" width="18" height="1" fill="var(--island-grass2)" />
      {/* dirt body, tapering */}
      <rect x="2" y="6" width="16" height="2" fill="var(--island-dirt)" />
      <rect x="3" y="8" width="14" height="2" fill="var(--island-dirt)" />
      <rect x="5" y="10" width="10" height="2" fill="var(--island-dirt2)" />
      <rect x="7" y="12" width="6" height="1" fill="var(--island-dirt2)" />
      {/* dangling rock bits */}
      <rect x="4" y="10" width="1" height="1" fill="var(--island-dirt2)" />
      <rect x="15" y="9" width="1" height="2" fill="var(--island-dirt2)" />
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
