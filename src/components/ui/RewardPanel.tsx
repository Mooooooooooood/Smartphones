"use client";

import { useEffect, type ReactNode } from "react";
import ChessBuddy, { type BuddyPiece } from "@/components/characters/ChessBuddy";
import { fx } from "@/lib/feedback";

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
  sound = "correct",
  children,
}: {
  title: string;
  xp?: number | null;
  subtitle?: string;
  tone?: "brass" | "good";
  piece?: BuddyPiece;
  sound?: "correct" | "win" | "none";
  children?: ReactNode;
}) {
  const accent = tone === "good" ? "text-good" : "text-brass";

  useEffect(() => {
    if (sound === "win") fx.win();
    else if (sound === "correct") fx.correct();
  }, [sound]);

  return (
    <div className="px-card tab-animate-pop tab-glow-reward relative overflow-hidden p-4 text-center" style={{ "--hue": "var(--color-brass)", "--hue-deep": "var(--color-brassdeep)" } as React.CSSProperties}>
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
        <div className="px-inset relative mx-auto flex h-20 w-20 items-center justify-center">
          <ChessBuddy piece={piece} size={62} />
          {xp != null && xp > 0 ? (
            <span className={`tab-floatup absolute -top-1 font-display text-[0.6rem] ${accent}`}>+{xp}</span>
          ) : null}
        </div>
      ) : (
        <div className="px-inset relative mx-auto flex h-14 w-14 items-center justify-center text-2xl text-brass">
          <span aria-hidden>✓</span>
          {xp != null && xp > 0 ? (
            <span className={`tab-floatup absolute -top-1 font-display text-[0.6rem] ${accent}`}>+{xp}</span>
          ) : null}
        </div>
      )}

      <h3 className="px-title mt-3 text-[1.05rem] text-cream">{title}</h3>
      {xp != null && xp > 0 ? (
        <p className={`px-label mt-1 text-[0.6rem] ${accent}`}>+{xp} XP earned</p>
      ) : null}
      {subtitle ? <p className="mt-1 text-[0.68rem] text-muted">{subtitle}</p> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
