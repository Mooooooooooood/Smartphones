import type { ReactNode } from "react";

/**
 * A guidance bubble with an original chess-emblem "coach" (a brass knight
 * disc — not a mascot/character). Used to frame instructions on focused
 * lesson and puzzle screens.
 */
export default function CoachBubble({
  children,
  glyph = "♞",
  tone = "default",
}: {
  children: ReactNode;
  glyph?: string;
  tone?: "default" | "good" | "warn";
}) {
  const bubble =
    tone === "good"
      ? "border-good/45 bg-good/10"
      : tone === "warn"
        ? "border-warn/45 bg-warn/10"
        : "border-line bg-panel/70";

  return (
    <div className="flex items-start gap-2.5">
      <div
        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brass/40 bg-brass/10 text-2xl text-brass"
        aria-hidden
      >
        {glyph}
      </div>
      <div className={`relative flex-1 rounded-2xl border px-3.5 py-3 text-sm text-cream ${bubble}`}>
        {/* speech-bubble tail */}
        <span
          className={`absolute -left-1.5 top-4 h-3 w-3 rotate-45 border-b border-l ${bubble}`}
          aria-hidden
        />
        {children}
      </div>
    </div>
  );
}
