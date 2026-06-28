"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Chess, type Square } from "chess.js";
import type { Opening, OpeningNode } from "@/content/openings";
import { isLearnerTurn, candidatesAt, enumeratePaths, variationCount } from "@/content/openings";
import { useProfileStore } from "@/state/profileStore";
import { markOpeningLearned } from "@/lib/openingProgress";
import { recordOpeningRep } from "@/lib/openingReview";
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
  const [path, setPath] = useState<OpeningNode[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const rewarded = useRef(false);

  const maxLen = useMemo(() => Math.max(...enumeratePaths(opening.tree).map((p) => p.length)), [opening]);
  const variations = useMemo(() => variationCount(opening), [opening]);

  const ply = path.length;
  const candidates = candidatesAt(opening, path);
  const done = candidates.length === 0;
  const learnerToMove = !done && isLearnerTurn(opening, ply);
  const note = learnerToMove ? candidates[0]?.note : undefined;

  function restart() {
    rewarded.current = false;
    setFen(START_FEN);
    setPath([]);
    setFeedback(null);
    setLastMove(null);
  }

  // Auto-play the opponent's book reply — randomly among sound variations.
  useEffect(() => {
    if (done || learnerToMove) return;
    const t = setTimeout(() => {
      const replies = candidatesAt(opening, path);
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const g = new Chess(fen);
      const m = g.move(reply.san);
      if (m) {
        setFen(g.fen());
        setLastMove({ from: m.from, to: m.to });
        setPath((p) => [...p, reply]);
      }
    }, 650);
    return () => clearTimeout(t);
  }, [done, learnerToMove, opening, path, fen]);

  // Completion: record a spaced-repetition rep; reward the first time learned.
  useEffect(() => {
    if (!done || rewarded.current) return;
    rewarded.current = true;
    recordOpeningRep(opening.id, true);
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
    const match = candidates.find((c) => c.san === san);
    if (match) {
      setFen(probe.fen());
      setLastMove({ from, to });
      setPath((p) => [...p, match]);
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
            <p className="text-[0.58rem] text-muted2">
              {variations > 1
                ? "Nice — that's one variation. Drill again to see how the opponent's other replies are met."
                : `You have learned the main line of the ${opening.name}. Play it in your next game!`}
            </p>
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
        <span className="px-label text-[0.46rem] text-muted2">Move {ply}</span>
        <div className="px-track h-2 flex-1"><div className="px-track-fill" style={{ width: `${Math.round((ply / maxLen) * 100)}%`, "--fill": "var(--color-good)" } as React.CSSProperties} /></div>
        {learnerToMove ? <span className="px-label text-[0.46rem] text-brass">Your turn</span> : null}
      </div>

      {/* Board */}
      <div className="px-board-frame">
        <div className="tabiya-board-wrap overflow-hidden rounded-[4px]">
          <TrainerBoard fen={fen} orientation={opening.side} onMove={onMove} disabled={!learnerToMove} lastMove={lastMove} />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <PixelButton onClick={restart} variant="secondary" size="sm">{done && variations > 1 ? "↺ Drill again" : "↺ Restart"}</PixelButton>
        <PixelButton onClick={() => router.push("/openings")} tone={done ? "green" : undefined} variant={done ? "solid" : "secondary"} size="sm">{done ? "More openings →" : "Back"}</PixelButton>
      </div>
    </div>
  );
}
