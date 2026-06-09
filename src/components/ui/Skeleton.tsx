/** Branded shimmer block. Compose these into route-specific loading layouts. */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`tab-skeleton ${className}`} />;
}

/** Square board placeholder with the same footprint as a real board. */
export function BoardSkeleton() {
  return <div className="tabiya-board-wrap tab-skeleton aspect-square" />;
}
