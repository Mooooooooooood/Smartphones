"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { BOARD_SQUARE_STYLES, BOARD_HL } from "@/components/boardTheme";
import { PIXEL_PIECES } from "@/components/pixel/PixelChessPieces";
import {
  isMoveCorrect,
  isTapCorrect,
  type BoardDemoStep,
  type MakeMoveStep,
  type TapPieceStep,
  type TapSquareStep,
} from "@/domain/academy/lessonSteps";

type BoardStep = BoardDemoStep | TapSquareStep | TapPieceStep | MakeMoveStep;

const demoHighlight = BOARD_HL.demo;
const moveDot = BOARD_HL.moveDot;
const captureRing = BOARD_HL.captureRing;
const selectedStyle = BOARD_HL.selected;
const correctStyle = BOARD_HL.correct;
const wrongStyle = BOARD_HL.wrong;
const hintStyle = BOARD_HL.hint;

/**
 * Interactive board for lesson stages. Supports read-only demos with
 * highlighted squares, tap-the-square / tap-the-piece challenges, and
 * make-the-move challenges (legality validated with chess.js). State resets
 * when the parent remounts it with a new `key` per step.
 */
export default function LessonInteractiveBoard({
  step,
  solved,
  onResult,
  showHint = false,
}: {
  step: BoardStep;
  solved: boolean;
  onResult: (correct: boolean) => void;
  showHint?: boolean;
}) {
  const orientation = step.orientation ?? "white";
  const demo = step.type === "board-demo";

  // chess.js rejects kingless positions (the coordinates board is empty), so
  // construct lazily — only make-move steps actually need legality checking.
  const game = useMemo(() => {
    try {
      return new Chess(step.fen);
    } catch {
      return null;
    }
  }, [step.fen]);

  const [displayFen, setDisplayFen] = useState(step.fen);
  const [selected, setSelected] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Square[]>([]);
  const [chosen, setChosen] = useState<Square | null>(null);
  const [wrong, setWrong] = useState<Square | null>(null);
  const [moveSquares, setMoveSquares] = useState<{ from: Square; to: Square } | null>(null);

  function clearSelection() {
    setSelected(null);
    setTargets([]);
  }

  function legalTargetsFor(sq: Square): Square[] {
    if (!game) return [];
    try {
      return game.moves({ square: sq, verbose: true }).map((m) => m.to as Square);
    } catch {
      return [];
    }
  }

  function uciFor(from: Square, to: Square): string {
    const piece = game?.get(from);
    const lastRank = to[1] === "8" || to[1] === "1";
    const promo = piece && piece.type === "p" && lastRank ? "q" : "";
    return `${from}${to}${promo}`;
  }

  function handleTap(square: Square) {
    if (solved) return;

    if (step.type === "tap-square" || step.type === "tap-piece") {
      if (isTapCorrect(step, square)) {
        setChosen(square);
        setWrong(null);
        onResult(true);
      } else {
        setWrong(square);
        onResult(false);
      }
      return;
    }

    if (step.type === "make-move") {
      if (selected) {
        if (square === selected) return clearSelection();
        if (targets.includes(square)) {
          const uci = uciFor(selected, square);
          if (isMoveCorrect(step, uci)) {
            try {
              if (game) {
                game.move({ from: selected, to: square, promotion: "q" });
                setDisplayFen(game.fen());
              }
            } catch {
              /* keep position */
            }
            setMoveSquares({ from: selected, to: square });
            setWrong(null);
            clearSelection();
            onResult(true);
          } else {
            setWrong(square);
            clearSelection();
            onResult(false);
          }
          return;
        }
      }
      const t = legalTargetsFor(square);
      if (t.length) {
        setSelected(square);
        setTargets(t);
        setWrong(null);
      } else {
        clearSelection();
      }
    }
  }

  function handleDrop(from: Square, to: Square): boolean {
    if (solved || step.type !== "make-move") return false;
    if (!to) return false;
    if (!legalTargetsFor(from).includes(to)) return false;
    const uci = uciFor(from, to);
    if (isMoveCorrect(step, uci)) {
      try {
        if (game) {
          game.move({ from, to, promotion: "q" });
          setDisplayFen(game.fen());
        }
      } catch {
        /* ignore */
      }
      setMoveSquares({ from, to });
      setWrong(null);
      clearSelection();
      onResult(true);
      return true;
    }
    setWrong(to);
    onResult(false);
    return false;
  }

  /* ---- square styling ---- */
  const styles: Record<string, CSSProperties> = {};
  if (demo && step.highlights) {
    for (const sq of step.highlights) styles[sq] = { ...demoHighlight };
  }
  if (showHint && !solved) {
    if (step.type === "make-move") {
      const want = Array.isArray(step.correctUci) ? step.correctUci[0] : step.correctUci;
      styles[want.slice(0, 2)] = { ...(styles[want.slice(0, 2)] ?? {}), ...hintStyle };
    } else if (step.type === "tap-square" || step.type === "tap-piece") {
      styles[step.targets[0]] = { ...(styles[step.targets[0]] ?? {}), ...hintStyle };
    }
  }
  for (const t of targets) {
    const occupied = Boolean(game?.get(t));
    styles[t] = { ...(styles[t] ?? {}), ...(occupied ? captureRing : moveDot) };
  }
  if (selected) styles[selected] = { ...(styles[selected] ?? {}), ...selectedStyle };
  if (moveSquares) {
    styles[moveSquares.from] = { ...(styles[moveSquares.from] ?? {}), ...correctStyle };
    styles[moveSquares.to] = { ...(styles[moveSquares.to] ?? {}), ...correctStyle };
  }
  if (chosen) styles[chosen] = { ...(styles[chosen] ?? {}), ...correctStyle };
  if (wrong) styles[wrong] = { ...(styles[wrong] ?? {}), ...wrongStyle };

  return (
    <Chessboard
      options={{
        id: "lesson-interactive-board",
        position: displayFen,
        boardOrientation: orientation,
        animationDurationInMs: 200,
        allowDragging: step.type === "make-move" && !solved,
        showNotation: true,
        boardStyle: { borderRadius: "4px", overflow: "hidden" },
        pieces: PIXEL_PIECES,
        ...BOARD_SQUARE_STYLES,
        squareStyles: styles,
        onSquareClick: ({ square }) => handleTap(square as Square),
        onPieceDrop: ({ sourceSquare, targetSquare }) =>
          handleDrop(sourceSquare as Square, targetSquare as Square),
      }}
    />
  );
}
