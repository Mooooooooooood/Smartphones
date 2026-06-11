/**
 * Achievement emblem for the profile shelf. Unlocked badges glow in brass with
 * a sparkle; locked ones are friendly "future collectibles" — a soft dashed
 * tile with a faint silhouette and a "?" — not a dead disabled box.
 */
export default function BadgeEmblem({
  glyph,
  label,
  unlocked,
}: {
  glyph: string;
  label: string;
  unlocked: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div
        className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl ${
          unlocked
            ? "border-brass/50 text-brass tab-glow"
            : "border-dashed border-muted2/45 bg-ink2"
        }`}
        style={
          unlocked
            ? { backgroundImage: "linear-gradient(160deg, var(--color-surf-sun), var(--color-panel))" }
            : undefined
        }
        aria-hidden
      >
        {unlocked ? (
          <>
            <span>{glyph}</span>
            <span className="tab-twinkle absolute -right-1 -top-1 text-xs text-sun">✦</span>
          </>
        ) : (
          <>
            <span className="text-muted2/30">{glyph}</span>
            <span className="absolute bottom-1 right-1.5 text-[11px] font-bold text-muted2/70">?</span>
          </>
        )}
      </div>
      <span className={`text-[10px] font-semibold leading-tight ${unlocked ? "text-cream" : "text-muted2"}`}>
        {label}
      </span>
    </div>
  );
}
