"use client";

import { Chessboard } from "react-chessboard";
import type { CSSProperties } from "react";
import type { Square } from "chess.js";
import { useGameStore } from "@/state/gameStore";
import { findKing } from "@/domain/chess/engine";
import { BOARD_SQUARE_STYLES, BOARD_HL } from "@/components/boardTheme";
import { PIXEL_PIECES } from "@/components/pixel/PixelChessPieces";

const moveDot = BOARD_HL.moveDot;
const captureRing = BOARD_HL.captureRing;
const selectedStyle = BOARD_HL.selected;
const lastMoveStyle = BOARD_HL.lastMove;
const checkStyle = BOARD_HL.check;
const hintStyle = BOARD_HL.hint;

export default function Board({ orientation = "white" }: { orientation?: "white" | "black" }) {
  const snap = useGameStore((s) => s.snap);
  const selected = useGameStore((s) => s.selected);
  const targets = useGameStore((s) => s.targets);
  const hint = useGameStore((s) => s.hint);
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
  if (hint) {
    styles[hint.from] = { ...(styles[hint.from] ?? {}), ...hintStyle };
    styles[hint.to] = { ...(styles[hint.to] ?? {}), ...hintStyle };
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
        boardStyle: { borderRadius: "4px", overflow: "hidden" },
        pieces: PIXEL_PIECES,
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
