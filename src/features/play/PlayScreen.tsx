"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "@/state/gameStore";
import MoveList from "@/components/MoveList";
import CapturedPieces from "@/components/CapturedPieces";
import Controls from "@/components/Controls";
import type { Color, GameStatus } from "@/domain/chess/types";

const Board = dynamic(() => import("@/components/Board"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full animate-pulse rounded-lg bg-panel2" />,
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
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  useEffect(() => {
    void useGameStore.getState().hydrate();
  }, []);

  const topSide: Color = orientation === "white" ? "b" : "w";
  const bottomSide: Color = orientation === "white" ? "w" : "b";

  return (
    <div className="space-y-3">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted2">Tabiya</p>
          <h1 className="font-display text-2xl text-cream">Play</h1>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            snap.isGameOver ? "border-brass/60 text-brass" : "border-line text-muted"
          }`}
        >
          {statusLabel(snap.status, snap.turn, snap.isGameOver)}
        </span>
      </header>

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
