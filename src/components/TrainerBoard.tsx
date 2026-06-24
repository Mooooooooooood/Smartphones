"use client";

import { useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import type { Square } from "chess.js";
import { legalTargets } from "@/domain/puzzles/puzzleEngine";
import { BOARD_SQUARE_STYLES, BOARD_HL } from "@/components/boardTheme";
import { PIXEL_PIECES } from "@/components/pixel/PixelChessPieces";

/**
 * Generic, controlled interactive board (click- or drag-to-move). Unlike
 * PuzzleBoard it carries no store coupling: it renders `fen`, reports attempted
 * moves via `onMove(from,to) => accepted`, and highlights `lastMove`/`hint`.
 */
export default function TrainerBoard({
  fen,
  orientation,
  onMove,
  lastMove,
  hint,
  disabled = false,
  id = "tabiya-trainer-board",
}: {
  fen: string;
  orientation: "white" | "black";
  onMove: (from: Square, to: Square) => boolean;
  lastMove?: { from: string; to: string } | null;
  hint?: string | null;
  disabled?: boolean;
  id?: string;
}) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Square[]>([]);

  const clear = () => { setSelected(null); setTargets([]); };

  function handleSquareClick(square: Square) {
    if (disabled) return;
    if (selected) {
      if (square === selected) return clear();
      if (targets.includes(square)) {
        onMove(selected, square);
        return clear();
      }
    }
    const t = legalTargets(fen, square);
    if (t.length) { setSelected(square); setTargets(t as Square[]); }
    else clear();
  }

  const styles: Record<string, CSSProperties> = {};
  if (lastMove) {
    styles[lastMove.from] = { ...BOARD_HL.correct };
    styles[lastMove.to] = { ...BOARD_HL.correct };
  }
  if (hint) styles[hint] = { ...(styles[hint] ?? {}), ...BOARD_HL.hint };
  for (const t of targets) styles[t] = { ...(styles[t] ?? {}), ...(isCapture(fen, t) ? BOARD_HL.captureRing : BOARD_HL.moveDot) };
  if (selected) styles[selected] = { ...(styles[selected] ?? {}), ...BOARD_HL.selected };

  return (
    <Chessboard
      options={{
        id,
        position: fen,
        boardOrientation: orientation,
        animationDurationInMs: 180,
        allowDragging: !disabled,
        showNotation: true,
        boardStyle: { borderRadius: "4px", overflow: "hidden" },
        pieces: PIXEL_PIECES,
        ...BOARD_SQUARE_STYLES,
        squareStyles: styles,
        onSquareClick: ({ square }) => handleSquareClick(square as Square),
        onPieceDrop: ({ sourceSquare, targetSquare }) => {
          clear();
          if (disabled || !targetSquare) return false;
          return onMove(sourceSquare as Square, targetSquare as Square);
        },
      }}
    />
  );
}

/** Is `square` occupied (a capture target) in the FEN placement? */
function isCapture(fen: string, square: string): boolean {
  const file = square.charCodeAt(0) - 97;
  const rank = 8 - Number(square[1]);
  const row = fen.split(" ")[0].split("/")[rank];
  if (!row) return false;
  let col = 0;
  for (const ch of row) {
    if (ch >= "1" && ch <= "8") col += Number(ch);
    else { if (col === file) return true; col += 1; }
    if (col > file) break;
  }
  return false;
}
