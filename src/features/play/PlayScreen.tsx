"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "@/state/gameStore";
import MoveList from "@/components/MoveList";
import CapturedPieces from "@/components/CapturedPieces";
import Controls from "@/components/Controls";
import GameCard from "@/components/ui/GameCard";
import { BoardSkeleton } from "@/components/ui/Skeleton";
import type { Color, GameStatus } from "@/domain/chess/types";

const Board = dynamic(() => import("@/components/Board"), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

function statusLabel(status: GameStatus, turn: Color, over: boolean): string {
  if (status === "checkmate") return `Checkmate — ${turn === "w" ? "Black" : "White"} wins`;
  if (status === "stalemate") return "Draw — stalemate";
  if (status === "draw") return "Draw";
  if (status === "check") return `${turn === "w" ? "White" : "Black"} to move — check`;
  if (over) return "Game over";
  return `${turn === "w" ? "White" : "Black"} to move`;
}

export default function PlayScreen() {
  const snap = useGameStore((s) => s.snap);
  const reset = useGameStore((s) => s.reset);
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  useEffect(() => {
    void useGameStore.getState().hydrate();
  }, []);

  const topSide: Color = orientation === "white" ? "b" : "w";
  const bottomSide: Color = orientation === "white" ? "w" : "b";

  const lastMove = snap.history.at(-1);
  const justPromoted = Boolean(lastMove?.promotion) && !snap.isGameOver;
  const inCheck = snap.status === "check";

  return (
    <div className="space-y-3">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted2">Tabiya</p>
          <h1 className="font-display text-2xl text-cream">Practice Board</h1>
        </div>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            snap.isGameOver
              ? "border-brass/60 bg-brass/10 text-brass"
              : inCheck
                ? "border-bad/60 bg-bad/10 text-bad"
                : "border-line bg-panel/60 text-muted"
          }`}
        >
          {statusLabel(snap.status, snap.turn, snap.isGameOver)}
        </span>
      </header>

      {/* Game-over moment */}
      {snap.isGameOver ? (
        <GameCard variant="accent" glow className="tab-animate-pop p-4 text-center">
          <p className="text-[11px] uppercase tracking-wider text-muted2">Game over</p>
          <p className="mt-0.5 font-display text-xl text-cream">
            {statusLabel(snap.status, snap.turn, snap.isGameOver)}
          </p>
          <button
            onClick={reset}
            className="mt-3 inline-flex min-h-[44px] items-center rounded-xl border border-brass/55 bg-brass/15 px-5 text-sm font-semibold text-brass active:scale-[0.98]"
          >
            New game
          </button>
        </GameCard>
      ) : null}

      {/* Auto-promotion feedback */}
      {justPromoted ? (
        <div className="tab-animate-rise flex items-center gap-2 rounded-xl border border-brass/30 bg-brass/10 px-3 py-2 text-sm text-brass">
          <span aria-hidden>♛</span>
          <span>Auto-promoted to Queen.</span>
        </div>
      ) : null}

      <CapturedPieces side={topSide} />
      <div className="tabiya-board-wrap">
        <Board orientation={orientation} />
      </div>
      <CapturedPieces side={bottomSide} />

      <Controls
        orientation={orientation}
        onFlip={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
      />

      <MoveList />
    </div>
  );
}
