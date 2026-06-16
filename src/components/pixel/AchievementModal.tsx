"use client";

import type { AchievementView } from "@/content/achievements";
import { CoinIcon } from "@/components/pixel/PixelIcon";

/**
 * Achievement detail sheet — badge art, name, locked/unlocked state, the
 * "how to unlock" copy, a progress bar, and (when unlocked & unclaimed) a Claim
 * button that grants coins.
 */
export default function AchievementModal({
  achievement, claimed, onClaim, onClose,
}: {
  achievement: AchievementView | null;
  claimed?: boolean;
  onClaim?: () => void;
  onClose: () => void;
}) {
  if (!achievement) return null;
  const a = achievement;
  const canClaim = a.unlocked && a.coins > 0 && onClaim && !claimed;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(4,6,20,0.7)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-[300px]" onClick={(e) => e.stopPropagation()}>
        <div
          className={`px-card ${a.unlocked ? "tab-glow-reward tab-animate-pop" : ""} px-4 py-5 text-center`}
          style={{ "--hue": a.unlocked ? "var(--color-brass)" : "var(--color-frame)", "--hue-deep": a.unlocked ? "var(--color-brassdeep)" : "var(--px-edge)" } as React.CSSProperties}
        >
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[8px] border-[3px] text-3xl ${a.unlocked ? "border-[var(--px-edge)] bg-brass text-[color:var(--color-on-accent)] shadow-[0_3px_0_0_var(--color-brassdeep)]" : "border-[var(--px-edge)] bg-ink2 text-muted2"}`}>
            {a.unlocked ? a.glyph : "🔒"}
          </div>
          <h3 className="px-title mt-3 text-[1rem] text-cream">{a.name}</h3>
          <span className={`px-label mt-1 inline-block rounded-[4px] border-2 border-[var(--px-edge)] px-2 py-0.5 text-[0.46rem] ${a.unlocked ? "bg-good text-[color:var(--color-on-good)]" : "bg-[var(--color-ink)] text-muted2"}`}>
            {a.unlocked ? (claimed ? "Claimed" : "Unlocked") : "Locked"}
          </span>
          <p className="mx-auto mt-2.5 max-w-[230px] text-[0.66rem] leading-relaxed text-muted">{a.description}</p>

          <div className="mt-3">
            <div className="px-track h-3">
              <div className="px-track-fill" style={{ width: `${Math.round(a.pct * 100)}%`, "--fill": a.unlocked ? "var(--color-good)" : "var(--color-sky)" } as React.CSSProperties} />
            </div>
            <p className="px-label mt-1 text-[0.46rem] text-muted2">{Math.min(a.current, a.target)} / {a.target}</p>
          </div>

          {a.coins > 0 ? (
            <p className="mt-2 flex items-center justify-center gap-1 text-[0.6rem] text-brass">Reward <CoinIcon size={11} /> {a.coins}{claimed ? " (claimed)" : ""}</p>
          ) : a.reward ? <p className="mt-2 text-[0.56rem] text-brass">Reward: {a.reward}</p> : null}

          {canClaim ? (
            <button type="button" onClick={onClaim} className="px-btn mt-4 w-full">★ CLAIM {a.coins} COINS ★</button>
          ) : (
            <button type="button" onClick={onClose} className="px-btn px-btn-secondary mt-4 w-full">{a.unlocked ? "Nice!" : "Got it"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

