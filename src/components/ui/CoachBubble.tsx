import type { ReactNode } from "react";
import ChessBuddy, { BUDDIES, type BuddyPiece } from "@/components/characters/ChessBuddy";

/**
 * A guidance bubble fronted by one of our chess-piece guide characters. Pass a
 * `piece` to show that buddy (with its name); falls back to a simple glyph disc.
 */
export default function CoachBubble({
  children,
  glyph = "♞",
  piece,
  showName = true,
  tone = "default",
}: {
  children: ReactNode;
  glyph?: string;
  piece?: BuddyPiece;
  showName?: boolean;
  tone?: "default" | "good" | "warn";
}) {
  const bubble =
    tone === "good"
      ? "border-good/45 bg-good/10"
      : tone === "warn"
        ? "border-warn/45 bg-surf-sun"
        : "border-line bg-panel/70";

  return (
    <div className="flex items-start gap-2.5">
      <div className="flex shrink-0 flex-col items-center">
        {piece ? (
          <div className="tab-bob flex h-[68px] w-[68px] items-center justify-center rounded-full border border-line bg-surf-blue shadow-[0_8px_16px_-10px_var(--card-shadow)]">
            <ChessBuddy piece={piece} size={56} />
          </div>
        ) : (
          <div
            className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-full border border-brass/40 bg-brass/10 text-2xl text-brass"
            aria-hidden
          >
            {glyph}
          </div>
        )}
        {piece && showName ? (
          <span className="mt-1 rounded-full border border-line bg-panel px-1.5 text-[9px] font-bold text-muted2">
            {BUDDIES[piece].name}
          </span>
        ) : null}
      </div>
      <div className={`relative mt-1 flex-1 rounded-2xl border px-3.5 py-3 text-sm text-cream shadow-[0_6px_14px_-10px_var(--card-shadow)] ${bubble}`}>
        <span
          className={`absolute -left-1.5 top-5 h-3 w-3 rotate-45 border-b border-l ${bubble}`}
          aria-hidden
        />
        {children}
      </div>
    </div>
  );
}
