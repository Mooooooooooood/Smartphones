/** Streak flame. Animates gently unless the streak is cold (0). */
export default function FlameIcon({
  active = true,
  size = 16,
}: {
  active?: boolean;
  size?: number;
}) {
  const hot = active ? "#ff8f3c" : "#5b6896";
  const core = active ? "#ffd23c" : "#7683b3";
  const tip = active ? "#ffe27a" : "#94a3b8";
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" className={`px-crisp ${active ? "tab-flame-icon" : ""}`} shapeRendering="crispEdges" aria-hidden>
      <rect x="3" y="0" width="2" height="2" fill={hot} />
      <rect x="2" y="2" width="4" height="2" fill={hot} />
      <rect x="1" y="4" width="6" height="3" fill={hot} />
      <rect x="2" y="5" width="4" height="2" fill={core} />
      <rect x="3" y="3" width="2" height="3" fill={tip} />
    </svg>
  );
}
