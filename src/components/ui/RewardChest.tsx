/**
 * Original brass treasure marker (not a copied asset). Rendered with simple
 * SVG shapes so it scales crisply. States change the metal tone.
 */
export default function RewardChest({
  state = "locked",
  size = 44,
}: {
  state?: "locked" | "ready" | "claimed";
  size?: number;
}) {
  const body = state === "locked" ? "#3a3024" : "#b8923c";
  const lid = state === "locked" ? "#4a3d2c" : "#d9b25a";
  const band = state === "locked" ? "#2a2118" : "#8a6a28";
  const latch = state === "locked" ? "#6a5a3e" : "#f0cf80";

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      {/* body */}
      <rect x="9" y="22" width="30" height="17" rx="3" fill={body} />
      {/* lid */}
      <path d="M9 24a15 8 0 0 1 30 0v2H9z" fill={lid} />
      {/* vertical bands */}
      <rect x="22.5" y="16" width="3" height="23" fill={band} />
      {/* latch */}
      <rect x="21" y="24" width="6" height="7" rx="1.5" fill={band} />
      <circle cx="24" cy="27.5" r="1.7" fill={latch} />
      {state === "ready" ? (
        <circle cx="24" cy="13" r="2.2" fill="#f0cf80" className="tab-flame-icon" />
      ) : null}
    </svg>
  );
}
