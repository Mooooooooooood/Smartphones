/**
 * Original pixel-art treasure chest drawn with <rect>s on a 16×16 grid.
 * states: locked (gray, shut), ready (gold, glinting), open (lid up, glow).
 */
export default function PixelChest({
  state = "ready",
  size = 56,
  className = "",
}: {
  state?: "locked" | "ready" | "open";
  size?: number;
  className?: string;
}) {
  const locked = state === "locked";
  const wood = locked ? "#5b6896" : "#b9743a";
  const woodHi = locked ? "#7683b3" : "#d68f50";
  const woodLo = locked ? "#3f4a72" : "#8a5226";
  const band = locked ? "#9aa6cc" : "#f7bd3f";
  const bandHi = locked ? "#c2cbe6" : "#ffe08a";
  const open = state === "open";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      className={`px-crisp ${className}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`treasure chest ${state}`}
    >
      {/* glow / shadow base */}
      {!locked ? <rect x="2" y="14" width="12" height="1" fill={open ? "#ffe08a" : "#000"} opacity={open ? 0.5 : 0.3} /> : null}

      {/* open: spilling glow */}
      {open ? (
        <>
          <rect x="5" y="3" width="6" height="3" fill="#fff3c4" opacity="0.85" />
          <rect x="6" y="2" width="1" height="1" fill="#fff3c4" />
          <rect x="9" y="2" width="1" height="1" fill="#fff3c4" />
        </>
      ) : null}

      {/* lid */}
      {open ? (
        <g>
          <rect x="3" y="3" width="10" height="1" fill={woodLo} />
          <rect x="3" y="4" width="10" height="1" fill={wood} />
          <rect x="4" y="2" width="8" height="1" fill={woodHi} />
        </g>
      ) : (
        <g>
          <rect x="3" y="5" width="10" height="3" fill={wood} />
          <rect x="3" y="5" width="10" height="1" fill={woodHi} />
          <rect x="7" y="5" width="2" height="3" fill={band} />
          <rect x="7" y="5" width="2" height="1" fill={bandHi} />
        </g>
      )}

      {/* body */}
      <rect x="3" y="8" width="10" height="6" fill={wood} />
      <rect x="3" y="8" width="10" height="1" fill={woodHi} />
      <rect x="3" y="13" width="10" height="1" fill={woodLo} />
      <rect x="7" y="8" width="2" height="6" fill={band} />
      <rect x="7" y="8" width="2" height="1" fill={bandHi} />
      {/* latch */}
      <rect x="7" y="10" width="2" height="2" fill={locked ? "#3f4a72" : "#8a5226"} />
      <rect x="7.4" y="10.4" width="1.2" height="1.2" fill={bandHi} />

      {/* ready sparkle */}
      {state === "ready" ? (
        <g className="tab-twinkle">
          <rect x="12" y="3" width="1" height="1" fill="#fff3c4" />
          <rect x="2" y="4" width="1" height="1" fill="#fff3c4" />
        </g>
      ) : null}
    </svg>
  );
}
