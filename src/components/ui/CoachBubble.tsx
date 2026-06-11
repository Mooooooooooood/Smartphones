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
  const tint = tone === "good" ? "var(--color-good)" : tone === "warn" ? "var(--color-bad)" : "var(--panel-border)";

  return (
    <div className="flex items-start gap-2">
      <div className="flex shrink-0 flex-col items-center">
        {piece ? (
          <div className="px-inset tab-bob flex h-[60px] w-[60px] items-center justify-center">
            <ChessBuddy piece={piece} size={48} />
          </div>
        ) : (
          <div className="px-inset mt-0.5 flex h-12 w-12 items-center justify-center text-2xl text-brass" aria-hidden>
            {glyph}
          </div>
        )}
        {piece && showName ? (
          <span className="px-label mt-1 rounded-[4px] border-2 border-[var(--px-edge)] bg-[var(--color-panel)] px-1 text-[0.42rem] text-brass">
            {BUDDIES[piece].name}
          </span>
        ) : null}
      </div>
      <div className="px-inset relative mt-1 flex-1 px-3 py-2.5 text-[0.72rem] text-cream" style={{ boxShadow: `inset 0 0 0 2px ${tint}` }}>
        {children}
      </div>
    </div>
  );
}
