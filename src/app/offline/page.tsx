"use client";

import Link from "next/link";
import ChessBuddy from "@/components/characters/ChessBuddy";
import GameCard from "@/components/ui/GameCard";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <GameCard variant="accent" glow className="w-full max-w-xs p-6 text-center">
        <div className="tab-bob mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-line bg-surf-blue">
          <ChessBuddy piece="pawn" size={76} />
        </div>
        <h1 className="mt-4 font-display text-2xl text-cream">You&apos;re offline</h1>
        <p className="mt-1 text-sm text-muted">
          No internet right now — but don&apos;t worry, all your progress is saved safely on this device.
        </p>

        <button
          type="button"
          onClick={() => location.reload()}
          className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-brassdeep bg-brass text-sm font-semibold text-[color:var(--color-on-accent)] shadow-[0_4px_0_0_var(--color-brassdeep)] active:translate-y-0.5"
        >
          Try again
        </button>
        <Link
          href="/"
          className="mt-2 inline-block w-full rounded-2xl border border-line bg-panel py-3 text-sm font-semibold text-cream"
        >
          Go to Home
        </Link>
      </GameCard>
    </div>
  );
}
