"use client";

import Link from "next/link";
import ChessBuddy from "@/components/characters/ChessBuddy";
import GameCard from "@/components/ui/GameCard";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <GameCard variant="accent" glow className="w-full max-w-xs p-6 text-center">
        <div className="px-inset tab-bob mx-auto flex h-24 w-24 items-center justify-center">
          <ChessBuddy piece="pawn" size={72} />
        </div>
        <h1 className="mt-4 px-title text-[1.05rem] text-cream">You&apos;re offline</h1>
        <p className="mt-1.5 text-[0.66rem] text-muted">
          No internet right now — but don&apos;t worry, all your progress is saved safely on this device.
        </p>

        <button type="button" onClick={() => location.reload()} className="px-btn mt-4 w-full">Try again</button>
        <Link href="/" className="px-btn px-btn-secondary mt-2 w-full">Go to Home</Link>
      </GameCard>
    </div>
  );
}
