import type { ReactNode } from "react";
import ChessBuddy, { type BuddyPiece } from "@/components/characters/ChessBuddy";

const CONFETTI = [
  { left: "12%", color: "#fbbf24", delay: "0s" },
  { left: "28%", color: "#60a5fa", delay: "0.08s" },
  { left: "44%", color: "#86efac", delay: "0.02s" },
  { left: "60%", color: "#c4b5fd", delay: "0.12s" },
  { left: "76%", color: "#fb7185", delay: "0.05s" },
  { left: "88%", color: "#fbbf24", delay: "0.1s" },
];

/**
 * Celebratory completion moment. A guide character (optional) cheers, confetti
 * rains, and the XP floats up. Used for lessons, puzzles, and boss wins.
 */
export default function RewardPanel({
  title,
  xp = null,
  subtitle,
  tone = "brass",
  piece,
  children,
}: {
  title: string;
  xp?: number | null;
  subtitle?: string;
  tone?: "brass" | "good";
  piece?: BuddyPiece;
  children?: ReactNode;
}) {
  const accent = tone === "good" ? "text-good" : "text-brass";
  const ring =
    tone === "good" ? "border-good/50 bg-good/15 text-good" : "border-brass/50 bg-brass/15 text-brass";

  return (
    <div className="tab-card-accent tab-animate-pop tab-glow relative overflow-hidden p-5 text-center">
      {/* confetti */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="tab-floatup absolute top-2 h-2 w-2 rounded-[2px]"
            style={{ left: c.left, background: c.color, animationDelay: c.delay }}
          />
        ))}
      </div>

      {piece ? (
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-line bg-surf-blue">
          <ChessBuddy piece={piece} size={64} />
          {xp != null && xp > 0 ? (
            <span className={`tab-floatup absolute -top-1 text-sm font-bold ${accent}`}>+{xp}</span>
          ) : null}
        </div>
      ) : (
        <div
          className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border text-2xl ${ring}`}
        >
          <span aria-hidden>✓</span>
          {xp != null && xp > 0 ? (
            <span className={`tab-floatup absolute -top-1 text-sm font-bold ${accent}`}>+{xp}</span>
          ) : null}
        </div>
      )}

      <h3 className="mt-3 font-display text-xl text-cream">{title}</h3>
      {xp != null && xp > 0 ? (
        <p className={`mt-1 text-sm font-semibold ${accent}`}>+{xp} XP earned</p>
      ) : null}
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
