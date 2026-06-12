import type { CSSProperties, JSX } from "react";

/**
 * Tiny helper to render an original pixel-art sprite from a character grid.
 * Rows are padded to `w`, each non-empty cell maps to a colour. Crisp,
 * dependency-free, and scales to any size.
 */
export function PixelArt({
  grid,
  colors,
  w,
  size,
  className = "",
  style,
  shadow = true,
}: {
  grid: string[];
  colors: Record<string, string>;
  w: number;
  size: number;
  className?: string;
  style?: CSSProperties;
  shadow?: boolean;
}) {
  const h = grid.length;
  const rects: JSX.Element[] = [];
  for (let y = 0; y < h; y++) {
    const row = grid[y] ?? "";
    for (let x = 0; x < w; x++) {
      const ch = row[x] ?? " ";
      const c = colors[ch];
      if (c) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={c} />);
    }
  }
  return (
    <svg
      width={size}
      height={(size * h) / w}
      viewBox={`0 0 ${w} ${h}`}
      className={`px-crisp ${className}`}
      style={style}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {shadow ? <rect x={Math.round(w * 0.18)} y={h - 0.6} width={Math.round(w * 0.64)} height={0.7} fill="#000" opacity={0.25} /> : null}
      {rects}
    </svg>
  );
}
