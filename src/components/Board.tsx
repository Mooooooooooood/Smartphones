"use client";

import { Chessboard } from "react-chessboard";
import type { CSSProperties } from "react";
import type { Square } from "chess.js";
import { useGameStore } from "@/state/gameStore";
import { findKing } from "@/domain/chess/engine";

const BRASS = "#d9b25a";

const moveDot: CSSProperties = {
  backgroundImage: "radial-gradient(circle, rgba(20,14,8,0.32) 18%, transparent 20%)",
};
const captureRing: CSSProperties = {
  boxShadow: "inset 0 0 0 4px rgba(196,106,79,0.6)",
};
const selectedStyle: CSSProperties = {
  boxShadow: `inset 0 0 0 3px ${BRASS}`,
};
const lastMoveStyle: CSSProperties = {
  backgroundImage: "linear-gradient(rgba(217,178,90,0.28), rgba(217,178,90,0.28))",
};
const checkStyle: CSSProperties = {
  background: "radial-gradient(circle, rgba(196,70,50,0.9) 0%, rgba(196,70,50,0) 72%)",
};

export default function Board({ orientation = "white" }: { orientation?: "white" | "black" }) {
  const snap = useGameStore((s) => s.snap);
  const selected = useGameStore((s) => s.selected);
  const targets = useGameStore((s) => s.targets);
  const game = useGameStore((s) => s.game);
  const selectSquare = useGameStore((s) => s.selectSquare);
  const grab = useGameStore((s) => s.grab);
  const move = useGameStore((s) => s.move);

  const styles: Record<string, CSSProperties> = {};

  if (snap.lastMove) {
    styles[snap.lastMove.from] = { ...lastMoveStyle };
    styles[snap.lastMove.to] = { ...lastMoveStyle };
  }
  for (const t of targets) {
    const occupied = Boolean(game.get(t));
    styles[t] = { ...(styles[t] ?? {}), ...(occupied ? captureRing : moveDot) };
  }
  if (selected) {
    styles[selected] = { ...(styles[selected] ?? {}), ...selectedStyle };
  }
  if (snap.status === "check" || snap.status === "checkmate") {
    const king = findKing(game, snap.turn);
    if (king) styles[king] = { ...(styles[king] ?? {}), ...checkStyle };
  }

  return (
    <Chessboard
      options={{
        id: "tabiya-board",
        position: snap.fen,
        boardOrientation: orientation,
        animationDurationInMs: 180,
        allowDragging: true,
        showNotation: true,
        boardStyle: { borderRadius: "8px", overflow: "hidden" },
        darkSquareStyle: { backgroundColor: "#9c6f47" },
        lightSquareStyle: { backgroundColor: "#e9d6b0" },
        darkSquareNotationStyle: { color: "rgba(245,232,206,0.70)" },
        lightSquareNotationStyle: { color: "rgba(70,48,24,0.65)" },
        squareStyles: styles,
        onSquareClick: ({ square }) => selectSquare(square as Square),
        onPieceDrag: ({ square }) => {
          if (square) grab(square as Square);
        },
        onPieceDrop: ({ sourceSquare, targetSquare }) => {
          if (!targetSquare) return false;
          return move(sourceSquare as Square, targetSquare as Square);
        },
      }}
    />
  );
}
