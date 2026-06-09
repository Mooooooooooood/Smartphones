"use client";

import { useState } from "react";
import type { BuddyPiece } from "@/components/characters/ChessBuddy";
import RewardChest from "@/components/ui/RewardChest";
import RewardModal from "@/components/ui/RewardModal";

/**
 * A tappable treasure chest. When `state` is "ready" it glows, bobs, and opens
 * on tap — calling `onClaim` (which must grant the reward once) and showing a
 * celebratory modal. Locked taps show a friendly nudge; claimed chests are
 * static and never re-reward.
 */
export default function ClaimableChest({
  state,
  size = 64,
  onClaim,
  rewardTitle,
  rewardPiece = "king",
  lockedMessage = "Keep going to unlock this reward!",
}: {
  state: "locked" | "ready" | "claimed";
  size?: number;
  onClaim: () => Promise<number>;
  rewardTitle: string;
  rewardPiece?: BuddyPiece;
  lockedMessage?: string;
}) {
  const [modal, setModal] = useState<{ open: boolean; xp: number }>({ open: false, xp: 0 });
  const [nudge, setNudge] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (state === "claimed") return;
    if (state === "locked") {
      setNudge(true);
      setTimeout(() => setNudge(false), 1800);
      return;
    }
    if (busy) return;
    setBusy(true);
    const xp = await onClaim();
    setBusy(false);
    if (xp > 0) setModal({ open: true, xp });
  }

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        aria-label={state === "ready" ? "Open reward chest" : "Reward chest"}
        className={`relative grid place-items-center rounded-full transition-transform ${
          state === "ready" ? "tab-pulse tab-bob active:scale-90" : ""
        } ${state === "claimed" ? "cursor-default" : ""}`}
        style={{ width: size + 8, height: size + 8 }}
      >
        <RewardChest state={state} size={size} />
      </button>

      {nudge ? (
        <span className="tab-animate-rise absolute -bottom-5 whitespace-nowrap rounded-full border border-line bg-panel px-2.5 py-1 text-[10px] font-semibold text-muted shadow-[0_4px_10px_-6px_var(--card-shadow)]">
          {lockedMessage}
        </span>
      ) : null}

      <RewardModal
        open={modal.open}
        onClose={() => setModal({ open: false, xp: 0 })}
        title={rewardTitle}
        xp={modal.xp}
        piece={rewardPiece}
      />
    </div>
  );
}
