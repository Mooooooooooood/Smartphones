"use client";

import type { CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import { BOARD_SQUARE_STYLES } from "@/components/boardTheme";

const lastMoveStyle: CSSProperties = {
  backgroundImage: "linear-gradient(rgba(253,230,138,0.55), rgba(253,230,138,0.55))",
};

/** Read-only board for lessons and match replay. Optional last-move highlight. */
export default function LessonBoard({
  fen,
  orientation = "white",
  lastMove,
}: {
  fen: string;
  orientation?: "white" | "black";
  lastMove?: { from: string; to: string } | null;
}) {
  const squareStyles: Record<string, CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { ...lastMoveStyle };
    squareStyles[lastMove.to] = { ...lastMoveStyle };
  }

  return (
    <Chessboard
      options={{
        id: "lesson-board",
        position: fen,
        boardOrientation: orientation,
        allowDragging: false,
        showNotation: true,
        boardStyle: { borderRadius: "8px", overflow: "hidden" },
        ...BOARD_SQUARE_STYLES,
        squareStyles,
      }}
    />
  );
}
