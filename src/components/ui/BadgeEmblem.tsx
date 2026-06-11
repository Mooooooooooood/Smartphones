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
        className={`relative flex h-14 w-14 items-center justify-center rounded-[7px] border-[3px] text-2xl ${
          unlocked
            ? "border-[var(--px-edge)] bg-brass text-[color:var(--color-on-accent)] tab-glow-reward shadow-[0_3px_0_0_var(--color-brassdeep)]"
            : "border-[var(--px-edge)] bg-ink2"
        }`}
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
