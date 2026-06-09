"use client";

import { Chessboard } from "react-chessboard";
import { BOARD_SQUARE_STYLES } from "@/components/boardTheme";

export default function LessonBoard({ fen }: { fen: string }) {
  return (
    <Chessboard
      options={{
        id: "lesson-board",
        position: fen,
        allowDragging: false,
        showNotation: true,
        boardStyle: { borderRadius: "8px", overflow: "hidden" },
        ...BOARD_SQUARE_STYLES,
      }}
    />
  );
}
