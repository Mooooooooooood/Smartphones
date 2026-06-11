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
    "px-inset flex h-8 w-8 shrink-0 items-center justify-center text-muted2 active:translate-y-0.5";

  return (
    <div className="flex items-center gap-2.5">
      {exitHref ? (
        <Link href={exitHref} className={exitClass} aria-label="Exit">✕</Link>
      ) : onExit ? (
        <button type="button" onClick={onExit} className={exitClass} aria-label="Exit">✕</button>
      ) : null}
      <div className="px-track h-3 flex-1">
        <div className="px-track-fill" style={{ width: `${pct}%`, "--fill": "var(--color-good)" } as React.CSSProperties} />
      </div>
      {trailing ? <span className="px-label shrink-0 text-[0.52rem] text-muted">{trailing}</span> : null}
    </div>
  );
}
