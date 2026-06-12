"use client";

import { useEffect } from "react";
import type { BuddyPiece } from "@/components/characters/ChessBuddy";
import ChessBuddy from "@/components/characters/ChessBuddy";
import PixelChest from "@/components/pixel/PixelChest";
import { fx } from "@/lib/feedback";

const BURST = [
  "#fbbf24", "#60a5fa", "#86efac", "#c4b5fd", "#fb7185", "#fdba74",
  "#fbbf24", "#60a5fa", "#86efac", "#c4b5fd", "#fb7185", "#fdba74",
  "#fbbf24", "#60a5fa",
];

/** Full-screen celebratory reward sheet shown after a chest is opened. */
export default function RewardModal({
  open,
  onClose,
  title,
  xp,
  piece = "king",
  subtitle,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  xp: number;
  piece?: BuddyPiece;
  subtitle?: string;
}) {
  useEffect(() => {
    if (open) fx.chest();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,12,24,0.55)] p-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* confetti burst */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-0 w-0">
        {BURST.map((c, i) => (
          <span
            key={i}
            className="tab-burst absolute h-2.5 w-2.5 rounded-[2px]"
            style={{
              background: c,
              left: `${(i - 7) * 14}px`,
              animationDelay: `${(i % 5) * 0.06}s`,
            }}
          />
        ))}
      </div>

      <div
        className="px-card tab-animate-pop tab-glow-reward relative w-full max-w-xs overflow-hidden p-5 text-center"
        style={{ "--hue": "var(--color-brass)", "--hue-deep": "var(--color-brassdeep)" } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <PixelChest state="open" size={84} />
          <div className="px-inset absolute -bottom-1 -right-1 flex h-12 w-12 items-center justify-center">
            <ChessBuddy piece={piece} size={38} />
          </div>
        </div>

        <p className="px-label mt-3 text-[0.5rem] text-brass">Reward unlocked</p>
        <h3 className="px-title mt-1 text-[1.05rem] text-cream">{title}</h3>
        {xp > 0 ? <p className="px-label mt-1.5 text-[0.7rem] text-brass">+{xp} XP</p> : null}
        {subtitle ? <p className="mt-1 text-[0.66rem] text-muted">{subtitle}</p> : null}

        <button type="button" onClick={onClose} className="px-btn mt-4 w-full">Awesome!</button>
      </div>
    </div>
  );
}
