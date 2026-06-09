"use client";

import { Chessboard } from "react-chessboard";
import type { CSSProperties } from "react";
import type { Square } from "chess.js";
import { useGameStore } from "@/state/gameStore";
import { findKing } from "@/domain/chess/engine";
import { BOARD_SQUARE_STYLES } from "@/components/boardTheme";

const ACCENT = "#3b82f6";

const moveDot: CSSProperties = {
  backgroundImage: "radial-gradient(circle, rgba(96,165,250,0.60) 17%, transparent 19%)",
};
const captureRing: CSSProperties = {
  boxShadow: "inset 0 0 0 5px rgba(244,63,94,0.65)",
  borderRadius: "4px",
};
const selectedStyle: CSSProperties = {
  boxShadow: `inset 0 0 0 3px ${ACCENT}`,
};
const lastMoveStyle: CSSProperties = {
  backgroundImage: "linear-gradient(rgba(253,230,138,0.55), rgba(253,230,138,0.55))",
};
const checkStyle: CSSProperties = {
  background: "radial-gradient(circle, rgba(244,63,94,0.75) 0%, rgba(244,63,94,0) 72%)",
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
        ...BOARD_SQUARE_STYLES,
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
