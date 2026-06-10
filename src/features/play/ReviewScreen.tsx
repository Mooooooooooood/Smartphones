"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { loadMatch } from "@/data/matchRepository";
import { buildReplay, coachComment, type ReplayFrame } from "@/domain/chess/replay";
import type { MatchRow } from "@/data/db";
import GameCard from "@/components/ui/GameCard";
import ActionButton from "@/components/ui/ActionButton";
import CoachBubble from "@/components/ui/CoachBubble";
import ChessBuddy from "@/components/characters/ChessBuddy";
import { BoardSkeleton } from "@/components/ui/Skeleton";

const LessonBoard = dynamic(() => import("@/components/LessonBoard"), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

function NavBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl border border-line bg-panel text-lg font-bold text-cream shadow-[0_3px_0_0_var(--color-line)] transition-transform active:translate-y-0.5 disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export default function ReviewScreen() {
  const router = useRouter();
  const idParam = useSearchParams().get("id");

  const id = idParam ? Number(idParam) : NaN;
  const validId = idParam !== null && !Number.isNaN(id);

  const [match, setMatch] = useState<MatchRow | null | undefined>(undefined);
  const [frames, setFrames] = useState<ReplayFrame[] | null>(null);
  const [ply, setPly] = useState(0);

  useEffect(() => {
    if (!validId) return;
    let active = true;
    void loadMatch(id).then((m) => {
      if (!active) return;
      setMatch(m);
      if (m) setFrames(buildReplay({ sans: m.sans, pgn: m.pgn }));
    });
    return () => {
      active = false;
    };
  }, [id, validId]);

  const total = frames ? frames.length - 1 : 0;
  const frame = frames ? frames[Math.min(ply, total)] : null;
  const coach = useMemo(() => (frame ? coachComment(frame) : null), [frame]);

  // ----- loading / unavailable states -----
  if (!validId || match === null) {
    return (
      <div className="py-12 text-center">
        <h1 className="font-display text-2xl text-cream">Match not found</h1>
        <button onClick={() => router.back()} className="mt-3 text-brass">
          Go back
        </button>
      </div>
    );
  }

  if (match === undefined) {
    return (
      <div className="space-y-4">
        <div className="tab-skeleton h-9 w-2/3" />
        <BoardSkeleton />
        <div className="tab-skeleton h-12 w-full" />
      </div>
    );
  }

  const orientation: "white" | "black" = match.userColor === "w" ? "white" : "black";
  const delta = match.ratingAfter - match.ratingBefore;
  const resultLabel = match.result === "win" ? "You won" : match.result === "draw" ? "Draw" : "You lost";

  if (!frames) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="text-sm text-muted">
          ‹ Back
        </button>
        <GameCard className="p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surf-blue">
            <ChessBuddy piece="rook" size={52} />
          </div>
          <h1 className="mt-3 font-display text-xl text-cream">Replay unavailable</h1>
          <p className="mt-1 text-sm text-muted">
            This older match doesn&apos;t have replay data saved. New matches can be reviewed move by move.
          </p>
        </GameCard>
      </div>
    );
  }

  const lastMove = frame?.from && frame?.to ? { from: frame.from, to: frame.to } : null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <GameCard className="flex items-center gap-3 p-3">
        <button onClick={() => router.back()} className="shrink-0 text-muted" aria-label="Back">
          ‹
        </button>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surf-blue">
          <ChessBuddy piece="rook" size={40} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-brass">Game review</p>
          <h1 className="truncate font-display text-base text-cream">{resultLabel} vs {match.opponentName}</h1>
        </div>
        <div className="shrink-0 text-right text-[11px]">
          <span className={`block font-semibold ${delta >= 0 ? "text-gooddeep" : "text-bad"}`}>
            {delta >= 0 ? "+" : ""}
            {delta}
          </span>
          <span className="text-brass">+{match.xpAwarded} XP</span>
        </div>
      </GameCard>

      {/* Coach */}
      {coach ? (
        <CoachBubble piece={coach.piece}>{coach.text}</CoachBubble>
      ) : null}

      {/* Board */}
      <GameCard className="p-2.5">
        <div className="tabiya-board-wrap overflow-hidden rounded-lg ring-1 ring-frame">
          <LessonBoard fen={frame!.fen} orientation={orientation} lastMove={lastMove} />
        </div>
      </GameCard>

      {/* Move counter */}
      <div className="flex items-center justify-between rounded-xl border border-line bg-panel/60 px-3 py-2 text-sm">
        <span className="text-muted2">
          You played {match.userColor === "w" ? "White" : "Black"}
        </span>
        <span className="font-semibold text-cream">
          {ply === 0 ? "Starting position" : `Move ${ply} / ${total} · ${frame?.san}`}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <NavBtn onClick={() => setPly(0)} disabled={ply === 0}>
          ⏮
        </NavBtn>
        <NavBtn onClick={() => setPly((p) => Math.max(0, p - 1))} disabled={ply === 0}>
          ◀
        </NavBtn>
        <NavBtn onClick={() => setPly((p) => Math.min(total, p + 1))} disabled={ply >= total}>
          ▶
        </NavBtn>
        <NavBtn onClick={() => setPly(total)} disabled={ply >= total}>
          ⏭
        </NavBtn>
      </div>

      {/* Move list */}
      <div className="tab-card p-3">
        <p className="mb-1.5 text-[11px] uppercase tracking-wider text-muted2">Moves</p>
        <div className="max-h-40 overflow-y-auto">
          <table className="w-full text-sm tabular-nums">
            <tbody>
              {Array.from({ length: Math.ceil(total / 2) }).map((_, r) => {
                const wi = r * 2 + 1;
                const bi = r * 2 + 2;
                return (
                  <tr key={r} className="text-cream">
                    <td className="w-8 py-0.5 pr-2 text-right text-muted2">{r + 1}.</td>
                    <td className="py-0.5 pr-2">
                      {frames[wi] ? (
                        <button
                          onClick={() => setPly(wi)}
                          className={`rounded px-1 ${ply === wi ? "bg-brass/20 font-bold text-brass" : "text-cream"}`}
                        >
                          {frames[wi].san}
                        </button>
                      ) : null}
                    </td>
                    <td className="py-0.5">
                      {frames[bi] ? (
                        <button
                          onClick={() => setPly(bi)}
                          className={`rounded px-1 ${ply === bi ? "bg-brass/20 font-bold text-brass" : "text-cream"}`}
                        >
                          {frames[bi].san}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ActionButton onClick={() => router.back()} variant="secondary">
        Done
      </ActionButton>
    </div>
  );
}
