/**
 * Achievement emblem for the profile shelf. Unlocked badges glow in brass;
 * locked ones are dimmed silhouettes. Glyphs are plain chess symbols.
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
        className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl ${
          unlocked
            ? "border-brass/50 bg-brass/15 text-brass tab-glow"
            : "border-line bg-panel2 text-muted2 opacity-70"
        }`}
        aria-hidden
      >
        {unlocked ? glyph : "🔒".replace("🔒", "")}
        {!unlocked ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        ) : null}
      </div>
      <span className={`text-[10px] leading-tight ${unlocked ? "text-muted" : "text-muted2"}`}>
        {label}
      </span>
    </div>
  );
}
