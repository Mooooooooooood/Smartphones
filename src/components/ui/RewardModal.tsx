"use client";

import type { BuddyPiece } from "@/components/characters/ChessBuddy";
import ChessBuddy from "@/components/characters/ChessBuddy";
import RewardChest from "@/components/ui/RewardChest";

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
        className="tab-card-accent tab-animate-pop tab-glow relative w-full max-w-xs overflow-hidden p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <RewardChest state="claimed" size={88} />
          <div className="absolute -bottom-1 -right-1 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surf-blue">
            <ChessBuddy piece={piece} size={40} />
          </div>
        </div>

        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-brass">Reward unlocked</p>
        <h3 className="mt-0.5 font-display text-2xl text-cream">{title}</h3>
        {xp > 0 ? <p className="mt-1 text-lg font-bold text-brass">+{xp} XP</p> : null}
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-brassdeep bg-brass text-sm font-semibold text-[color:var(--color-on-accent)] shadow-[0_4px_0_0_var(--color-brassdeep)] active:translate-y-0.5 active:shadow-[0_2px_0_0_var(--color-brassdeep)]"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
