import type { CSSProperties } from "react";

export type MapNodeStatus = "completed" | "current" | "locked";

function Star({ on }: { on: boolean }) {
  return (
    <svg width={9} height={9} viewBox="0 0 8 8" className="px-crisp" shapeRendering="crispEdges" aria-hidden>
      <rect x="3" y="0" width="2" height="8" fill={on ? "#ffd76b" : "#3a4a8c"} />
      <rect x="0" y="3" width="8" height="2" fill={on ? "#ffd76b" : "#3a4a8c"} />
      <rect x="2" y="1" width="4" height="6" fill={on ? "#ffe9a6" : "#2b3a78"} />
      <rect x="1" y="2" width="6" height="4" fill={on ? "#ffe9a6" : "#2b3a78"} />
    </svg>
  );
}

/**
 * A numbered level node on the Academy world-map, matching the mockup: a round
 * metallic disc (blue when reachable, dark when locked), with a ★★★ rating row
 * beneath completed nodes and a flag/glow on the current one.
 */
export default function PixelMapNode({
  n,
  status,
  stars = 0,
  size = 48,
}: {
  n: number;
  status: MapNodeStatus;
  stars?: number;
  size?: number;
}) {
  const locked = status === "locked";
  const current = status === "current";
  const ring: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: `3px solid ${locked ? "#243056" : current ? "var(--color-brass)" : "#2f64c4"}`,
    background: locked
      ? "radial-gradient(circle at 38% 32%, #3a4670, #1a2344)"
      : "radial-gradient(circle at 38% 32%, #5b8df0, #234a9e)",
    boxShadow: `0 0 0 2px var(--px-edge), inset 0 2px 0 rgba(255,255,255,0.3), 0 3px 0 0 var(--px-edge)`,
  };
  return (
    <div className={`relative flex flex-col items-center ${current ? "tab-bob" : ""}`}>
      {current ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.7rem]" aria-hidden>🚩</span>
      ) : null}
      <div className={`flex items-center justify-center ${current ? "tab-pulse" : ""}`} style={ring}>
        {locked ? (
          <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="#8493cf" strokeWidth="2.5" aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        ) : (
          <span className="font-display text-cream" style={{ fontSize: size * 0.34 }}>{n}</span>
        )}
      </div>
      {!locked ? (
        <div className="-mt-1 flex gap-0.5">
          <Star on={stars >= 1} />
          <Star on={stars >= 2} />
          <Star on={stars >= 3} />
        </div>
      ) : null}
    </div>
  );
}
