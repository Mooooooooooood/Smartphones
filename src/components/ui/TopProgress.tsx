import Link from "next/link";

/**
 * Full-width focused-stage header: an exit affordance and a chunky progress
 * bar, as used on lesson and puzzle screens.
 */
export default function TopProgress({
  value,
  exitHref,
  onExit,
  trailing,
}: {
  value: number;
  exitHref?: string;
  onExit?: () => void;
  trailing?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const exitClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-panel/60 text-muted2";

  return (
    <div className="flex items-center gap-3">
      {exitHref ? (
        <Link href={exitHref} className={exitClass} aria-label="Exit">
          ✕
        </Link>
      ) : onExit ? (
        <button type="button" onClick={onExit} className={exitClass} aria-label="Exit">
          ✕
        </button>
      ) : null}
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink2">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundImage: "linear-gradient(90deg, #60a5fa, #93c5fd 70%, #bfdbfe)",
          }}
        />
      </div>
      {trailing ? (
        <span className="shrink-0 text-xs font-semibold text-muted">{trailing}</span>
      ) : null}
    </div>
  );
}
