"use client";

import { Chessboard } from "react-chessboard";

export default function LessonBoard({ fen }: { fen: string }) {
  return (
    <Chessboard
      options={{
        id: "lesson-board",
        position: fen,
        allowDragging: false,
        showNotation: true,
        boardStyle: { borderRadius: "8px", overflow: "hidden" },
        darkSquareStyle: { backgroundColor: "#9c6f47" },
        lightSquareStyle: { backgroundColor: "#e9d6b0" },
        darkSquareNotationStyle: { color: "rgba(245,232,206,0.70)" },
        lightSquareNotationStyle: { color: "rgba(70,48,24,0.65)" },
      }}
    />
  );
}
