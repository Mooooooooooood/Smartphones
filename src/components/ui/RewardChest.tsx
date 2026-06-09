/**
 * Original soft-cartoon treasure chest (not a copied asset). Larger and more
 * celebratory than before: a rounded chest with a wood-tone body, gold bands,
 * and sparkles when it's ready to open.
 */
export default function RewardChest({
  state = "locked",
  size = 56,
}: {
  state?: "locked" | "ready" | "claimed";
  size?: number;
}) {
  const locked = state === "locked";
  const body = locked ? "#cbd5e1" : "#fcd34d";
  const bodyDeep = locked ? "#94a3b8" : "#f59e0b";
  const lid = locked ? "#e2e8f0" : "#fde68a";
  const band = locked ? "#94a3b8" : "#d97706";
  const latch = locked ? "#e2e8f0" : "#fffbeb";
  const open = state === "claimed";

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      {/* glow base */}
      {!locked ? <ellipse cx="24" cy="42" rx="17" ry="3.5" fill={bodyDeep} opacity={0.18} /> : null}

      {/* body */}
      <rect x="8" y="22" width="32" height="17" rx="4" fill={body} stroke={bodyDeep} strokeWidth="1.6" />
      {/* lid (lifted a touch when claimed/open) */}
      <path
        d={open ? "M7 20a17 9 0 0 1 34 0v3H7z" : "M8 24a16 8.5 0 0 1 32 0v2.5H8z"}
        fill={lid}
        stroke={bodyDeep}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* vertical band + latch */}
      <rect x="21.5" y="16" width="5" height="23" rx="1.5" fill={band} />
      <rect x="20" y="25" width="8" height="7" rx="2" fill={band} />
      <circle cx="24" cy="28.5" r="2" fill={latch} />

      {/* sparkles when ready */}
      {state === "ready" ? (
        <g className="tab-flame-icon" style={{ transformOrigin: "24px 12px" }}>
          <path d="M24 6 L25.4 10 L29 11.4 L25.4 12.8 L24 16.8 L22.6 12.8 L19 11.4 L22.6 10 Z" fill="#fde68a" />
          <circle cx="11" cy="15" r="1.6" fill="#fbbf24" />
          <circle cx="38" cy="14" r="1.6" fill="#fbbf24" />
        </g>
      ) : null}
      {open ? (
        <g>
          <circle cx="24" cy="18" r="2.4" fill="#fff7d6" />
          <circle cx="16" cy="20" r="1.4" fill="#fbbf24" />
          <circle cx="32" cy="20" r="1.4" fill="#fbbf24" />
        </g>
      ) : null}
    </svg>
  );
}
