"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Chess, type Square } from "chess.js";
import type { Opening } from "@/content/openings";
import { isLearnerTurn } from "@/content/openings";
import { useProfileStore } from "@/state/profileStore";
import { markOpeningLearned } from "@/lib/openingProgress";
import { fx } from "@/lib/feedback";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelButton from "@/components/pixel/PixelButton";
import ChessBuddy from "@/components/characters/ChessBuddy";
import { BoardSkeleton } from "@/components/ui/Skeleton";

const TrainerBoard = dynamic(() => import("@/components/TrainerBoard"), { ssr: false, loading: () => <BoardSkeleton /> });

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const REWARD = 40;

export default function OpeningTrainer({ opening }: { opening: Opening }) {
  const router = useRouter();
  const [fen, setFen] = useState(START_FEN);
  const [ply, setPly] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const rewarded = useRef(false);

  const total = opening.line.length;
  const done = ply >= total;
  const learnerToMove = !done && isLearnerTurn(opening, ply);
  const note = learnerToMove ? opening.line[ply].note : ply > 0 ? opening.line[ply - 1].note : undefined;

  function restart() {
    rewarded.current = false;
    setFen(START_FEN);
    setPly(0);
    setFeedback(null);
  }

  // Auto-play the opponent's book replies.
  useEffect(() => {
    if (done || isLearnerTurn(opening, ply)) return;
    const t = setTimeout(() => {
      const g = new Chess(fen);
      const m = g.move(opening.line[ply].san);
      if (m) { setFen(g.fen()); setPly((p) => p + 1); }
    }, 650);
    return () => clearTimeout(t);
  }, [ply, done, fen, opening]);

  // Completion reward (side-effect only — no setState).
  useEffect(() => {
    if (!done || rewarded.current) return;
    rewarded.current = true;
    if (markOpeningLearned(opening.id)) {
      fx.chest();
      void useProfileStore.getState().addCoins(REWARD);
    } else {
      fx.win();
    }
  }, [done, opening.id]);

  function onMove(from: Square, to: Square): boolean {
    if (!learnerToMove) return false;
    const probe = new Chess(fen);
    let san: string | null = null;
    try { san = probe.move({ from, to, promotion: "q" })?.san ?? null; } catch { san = null; }
    if (!san) return false;
    if (san === opening.line[ply].san) {
      setFen(probe.fen());
      setPly((p) => p + 1);
      setFeedback(null);
      fx.correct();
      return true;
    }
    setFeedback("That is not the book move here — follow the plan and try again.");
    fx.wrong();
    return false;
  }

  return (
    <div className="space-y-2.5">
      <PixelTopBar />

      {/* Header */}
      <PixelPanel hue={opening.side === "white" ? "gold" : "purple"} className="flex items-center gap-2.5 px-2.5 py-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border-2 border-[var(--px-edge)] bg-[var(--color-ink)]">
          <ChessBuddy piece={opening.guide} size={38} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="px-label text-[0.5rem] text-brass">Opening Trainer · {opening.eco}</p>
          <h1 className="truncate px-title text-[0.9rem] text-cream">{opening.name}</h1>
        </div>
        <span className="px-label shrink-0 rounded-[5px] border-2 border-[var(--px-edge)] bg-[var(--color-ink)] px-2 py-1 text-[0.5rem] text-cream">{opening.side === "white" ? "♔ White" : "♚ Black"}</span>
      </PixelPanel>

      {/* Coach / status */}
      {done ? (
        <PixelPanel hue="green" glow="reward" className="flex items-center gap-2 px-2.5 py-2.5">
          <ChessBuddy piece={opening.guide} size={32} className="tab-bob shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="px-label text-[0.56rem] text-good">Line complete! 🎉</p>
            <p className="text-[0.58rem] text-muted2">You have learned the main line of the {opening.name}. Play it in your next game!</p>
          </div>
        </PixelPanel>
      ) : (
        <PixelPanel hue={feedback ? "red" : "blue"} className="flex items-center gap-2 px-2.5 py-2">
          <ChessBuddy piece={opening.guide} size={30} className="shrink-0" />
          <p className="flex-1 text-[0.6rem] leading-tight text-cream">
            {feedback ?? (learnerToMove ? note ?? "Your move — play the next move of the line." : "Watch the reply…")}
          </p>
        </PixelPanel>
      )}

      {/* Progress */}
      <div className="px-inset flex items-center gap-2 px-2.5 py-1.5">
        <span className="px-label text-[0.46rem] text-muted2">Move {Math.min(ply + (done ? 0 : 1), total)}/{total}</span>
        <div className="px-track h-2 flex-1"><div className="px-track-fill" style={{ width: `${Math.round((ply / total) * 100)}%`, "--fill": "var(--color-good)" } as React.CSSProperties} /></div>
        {learnerToMove ? <span className="px-label text-[0.46rem] text-brass">Your turn</span> : null}
      </div>

      {/* Board */}
      <div className="px-board-frame">
        <div className="tabiya-board-wrap overflow-hidden rounded-[4px]">
          <TrainerBoard fen={fen} orientation={opening.side} onMove={onMove} disabled={!learnerToMove} />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <PixelButton onClick={restart} variant="secondary" size="sm">↺ Restart</PixelButton>
        <PixelButton onClick={() => router.push("/openings")} tone={done ? "green" : undefined} variant={done ? "solid" : "secondary"} size="sm">{done ? "More openings →" : "Back"}</PixelButton>
      </div>
    </div>
  );
}
