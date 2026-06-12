"use client";

import { useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import type { Square } from "chess.js";
import { usePuzzleStore, currentPuzzle } from "@/state/puzzleStore";
import { legalTargets } from "@/domain/puzzles/puzzleEngine";
import { BOARD_SQUARE_STYLES, BOARD_HL } from "@/components/boardTheme";
import { PIXEL_PIECES } from "@/components/pixel/PixelChessPieces";

const moveDot = BOARD_HL.moveDot;
const captureRing = BOARD_HL.captureRing;
const selectedStyle = BOARD_HL.selected;
const solvedStyle = BOARD_HL.correct;
const hintStyle = BOARD_HL.hint;

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
        boardStyle: { borderRadius: "4px", overflow: "hidden" },
        pieces: PIXEL_PIECES,
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
