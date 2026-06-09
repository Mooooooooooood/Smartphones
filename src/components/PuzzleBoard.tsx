"use client";

import { useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import type { Square } from "chess.js";
import { usePuzzleStore, currentPuzzle } from "@/state/puzzleStore";
import { legalTargets } from "@/domain/puzzles/puzzleEngine";
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
const solvedStyle: CSSProperties = {
  backgroundImage: "linear-gradient(rgba(134,239,172,0.55), rgba(134,239,172,0.55))",
};
const hintStyle: CSSProperties = {
  boxShadow: `inset 0 0 0 3px rgba(96,165,250,0.85)`,
};

export default function PuzzleBoard() {
  const queue = usePuzzleStore((s) => s.queue);
  const index = usePuzzleStore((s) => s.index);
  const displayFen = usePuzzleStore((s) => s.displayFen);
  const status = usePuzzleStore((s) => s.status);
  const hintShown = usePuzzleStore((s) => s.hintShown);
  const lastPlayedUci = usePuzzleStore((s) => s.lastPlayedUci);
  const submitMove = usePuzzleStore((s) => s.submitMove);

  const [selected, setSelected] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Square[]>([]);

  const puzzle = currentPuzzle({ queue, index });
  const orientation = puzzle.sideToMove === "w" ? "white" : "black";
  const solved = status === "correct";

  function clearSelection() {
    setSelected(null);
    setTargets([]);
  }

  function handleSquareClick(square: Square) {
    if (solved) return;

    if (selected) {
      if (square === selected) {
        clearSelection();
        return;
      }
      if (targets.includes(square)) {
        submitMove(selected, square);
        clearSelection();
        return;
      }
    }

    const t = legalTargets(displayFen, square);
    if (t.length) {
      setSelected(square);
      setTargets(t as Square[]);
    } else {
      clearSelection();
    }
  }

  const styles: Record<string, CSSProperties> = {};

  if (solved && lastPlayedUci) {
    styles[lastPlayedUci.slice(0, 2)] = { ...solvedStyle };
    styles[lastPlayedUci.slice(2, 4)] = { ...solvedStyle };
  }
  if (hintShown && !solved) {
    styles[puzzle.correctUci.slice(0, 2)] = { ...(styles[puzzle.correctUci.slice(0, 2)] ?? {}), ...hintStyle };
  }
  for (const t of targets) {
    const occupied = displayFen.split(" ")[0] !== "" && t !== selected;
    styles[t] = {
      ...(styles[t] ?? {}),
      ...(occupied && legalTargetIsCapture(displayFen, t) ? captureRing : moveDot),
    };
  }
  if (selected) {
    styles[selected] = { ...(styles[selected] ?? {}), ...selectedStyle };
  }

  return (
    <Chessboard
      options={{
        id: "tabiya-puzzle-board",
        position: displayFen,
        boardOrientation: orientation,
        animationDurationInMs: 180,
        allowDragging: !solved,
        showNotation: true,
        boardStyle: { borderRadius: "8px", overflow: "hidden" },
        ...BOARD_SQUARE_STYLES,
        squareStyles: styles,
        onSquareClick: ({ square }) => handleSquareClick(square as Square),
        onPieceDrop: ({ sourceSquare, targetSquare }) => {
          clearSelection();
          if (!targetSquare) return false;
          return submitMove(sourceSquare as Square, targetSquare as Square);
        },
      }}
    />
  );
}

/** Whether moving to `square` would be a capture (the square is occupied by an enemy piece). */
function legalTargetIsCapture(fen: string, square: Square): boolean {
  const placement = fen.split(" ")[0];
  // Cheap occupancy check: decode the square from the FEN board.
  const file = square.charCodeAt(0) - 97; // a..h -> 0..7
  const rank = 8 - Number(square[1]); // '8'..'1' -> 0..7
  const rows = placement.split("/");
  const row = rows[rank];
  if (!row) return false;
  let col = 0;
  for (const ch of row) {
    if (ch >= "1" && ch <= "8") {
      col += Number(ch);
    } else {
      if (col === file) return true; // a piece sits on the target square
      col += 1;
    }
    if (col > file) break;
  }
  return false;
}
