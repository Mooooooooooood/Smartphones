"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "@/state/gameStore";
import { useProfileStore } from "@/state/profileStore";
import { OPPONENTS, opponentById } from "@/content/opponents";
import MoveList from "@/components/MoveList";
import CapturedPieces from "@/components/CapturedPieces";
import Controls from "@/components/Controls";
import GameCard from "@/components/ui/GameCard";
import ActionButton from "@/components/ui/ActionButton";
import RewardPanel from "@/components/ui/RewardPanel";
import ChessBuddy from "@/components/characters/ChessBuddy";
import { BoardSkeleton } from "@/components/ui/Skeleton";
import type { Color, GameStatus } from "@/domain/chess/types";

const Board = dynamic(() => import("@/components/Board"), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

function statusLabel(status: GameStatus, turn: Color, over: boolean): string {
  if (status === "checkmate") return `Checkmate — ${turn === "w" ? "Black" : "White"} wins`;
  if (status === "stalemate") return "Draw — stalemate";
  if (status === "draw") return "Draw";
  if (status === "check") return `${turn === "w" ? "White" : "Black"} to move — check`;
  if (over) return "Game over";
  return `${turn === "w" ? "White" : "Black"} to move`;
}

/* ---------- opponent selection ---------- */

function OpponentSelect({ onStart, onPractice }: { onStart: (id: string) => void; onPractice: () => void }) {
  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted2">Play</p>
        <h1 className="font-display text-3xl text-cream">Choose your match</h1>
        <p className="mt-1 text-sm text-muted">Pick a friendly opponent — they only play legal moves.</p>
      </header>

      <div className="space-y-3">
        {OPPONENTS.map((o) => (
          <div key={o.id} className={`flex items-center gap-3 rounded-2xl border border-line p-3.5 ${o.surface}`}>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-line bg-panel">
              <ChessBuddy piece={o.piece} size={52} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-base text-cream">{o.name}</h2>
                <span className="shrink-0 rounded-full border border-line bg-panel px-2 py-0.5 text-[10px] font-semibold text-muted2">
                  ~{o.rating}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-muted">{o.level} · +{o.xpReward} XP</p>
              <p className="mt-0.5 truncate text-xs text-muted2">{o.line}</p>
            </div>
            <button
              type="button"
              onClick={() => onStart(o.id)}
              className="shrink-0 rounded-full border border-brassdeep bg-brass px-3.5 py-2 text-xs font-bold text-[color:var(--color-on-accent)] shadow-[0_3px_0_0_var(--color-brassdeep)] active:translate-y-0.5"
            >
              Play ›
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onPractice}
        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-panel p-3.5 text-left active:scale-[0.99]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-ink2 text-2xl">
          ♟
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base text-cream">Practice Board</h2>
          <p className="text-xs text-muted2">Free play — move both sides yourself</p>
        </div>
        <span className="shrink-0 text-muted2">›</span>
      </button>
    </div>
  );
}

/* ---------- result banner ---------- */

function ResultBanner({
  outcome,
  opponentName,
  opponentPiece,
  xp,
  onRematch,
  onChange,
}: {
  outcome: "win" | "loss" | "draw";
  opponentName: string;
  opponentPiece: Parameters<typeof ChessBuddy>[0]["piece"];
  xp: number;
  onRematch: () => void;
  onChange: () => void;
}) {
  const buttons = (
    <div className="flex gap-2">
      <ActionButton onClick={onChange} variant="secondary">
        New opponent
      </ActionButton>
      <ActionButton onClick={onRematch}>Rematch ›</ActionButton>
    </div>
  );

  if (outcome === "win") {
    return (
      <RewardPanel title={`You beat ${opponentName}!`} xp={xp} tone="good" piece={opponentPiece} subtitle="Great play!">
        {buttons}
      </RewardPanel>
    );
  }

  return (
    <GameCard variant="accent" className="tab-animate-pop p-5 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surf-blue">
        <ChessBuddy piece={opponentPiece} size={52} />
      </div>
      <h3 className="mt-3 font-display text-xl text-cream">
        {outcome === "draw" ? "It's a draw!" : `${opponentName} won this round`}
      </h3>
      <p className="mt-1 text-sm text-brass">+{xp} XP earned</p>
      <p className="mt-0.5 text-xs text-muted2">
        {outcome === "draw" ? "Evenly matched — try again?" : "Good effort — rematch and turn it around!"}
      </p>
      <div className="mt-4">{buttons}</div>
    </GameCard>
  );
}

/* ---------- screen ---------- */

export default function PlayScreen() {
  const mode = useGameStore((s) => s.mode);
  const snap = useGameStore((s) => s.snap);
  const notice = useGameStore((s) => s.notice);
  const botThinking = useGameStore((s) => s.botThinking);
  const result = useGameStore((s) => s.result);
  const opponentId = useGameStore((s) => s.opponentId);
  const userColor = useGameStore((s) => s.userColor);
  const userMoveCount = useGameStore((s) => s.userMoveCount);
  const clearNotice = useGameStore((s) => s.clearNotice);

  const startMatch = useGameStore((s) => s.startMatch);
  const startPractice = useGameStore((s) => s.startPractice);
  const exitMatch = useGameStore((s) => s.exitMatch);
  const resignMatch = useGameStore((s) => s.resignMatch);

  const [flip, setFlip] = useState(false);

  useEffect(() => {
    void useGameStore.getState().hydrate();
    void useProfileStore.getState().hydrate();
  }, []);

  const markedPlay = useRef(false);
  useEffect(() => {
    if (userMoveCount > 0 && !markedPlay.current) {
      markedPlay.current = true;
      void useProfileStore.getState().markDailyTask("play");
    }
  }, [userMoveCount]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(clearNotice, 1800);
    return () => clearTimeout(t);
  }, [notice, clearNotice]);

  if (mode === "idle") {
    return <OpponentSelect onStart={startMatch} onPractice={startPractice} />;
  }

  const opponent = opponentById(opponentId);
  const isBot = mode === "bot";
  const baseWhite = isBot ? userColor === "w" : true;
  const orientation: "white" | "black" = (flip ? !baseWhite : baseWhite) ? "white" : "black";
  const topSide: Color = orientation === "white" ? "b" : "w";
  const bottomSide: Color = orientation === "white" ? "w" : "b";
  const inCheck = snap.status === "check";
  const lastMove = snap.history.at(-1);
  const justPromoted = Boolean(lastMove?.promotion) && !snap.isGameOver;

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surf-blue">
            <ChessBuddy piece={opponent?.piece ?? "rook"} size={40} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.14em] text-muted2">
              {isBot ? `vs ${opponent?.name ?? "Bot"} · ~${opponent?.rating ?? ""}` : "Free practice"}
            </p>
            <h1 className="font-display text-xl text-cream">{isBot ? "Match" : "Practice Board"}</h1>
          </div>
        </div>
        <button onClick={exitMatch} className="shrink-0 rounded-full border border-line bg-panel/60 px-3 py-1.5 text-xs font-semibold text-muted">
          Leave
        </button>
      </header>

      {/* status / thinking */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            snap.isGameOver
              ? "border-brass/60 bg-brass/10 text-brass"
              : inCheck
                ? "border-bad/60 bg-bad/10 text-bad"
                : "border-line bg-panel/60 text-muted"
          }`}
        >
          {statusLabel(snap.status, snap.turn, snap.isGameOver)}
        </span>
        {botThinking ? (
          <span className="flex items-center gap-1.5 rounded-full border border-brass/40 bg-brass/10 px-3 py-1.5 text-xs font-semibold text-brass">
            <span className="tab-bob inline-block">●</span>
            {opponent?.name?.split(" ")[0] ?? "Bot"} is thinking…
          </span>
        ) : null}
      </div>

      {justPromoted ? (
        <div className="tab-animate-rise flex items-center gap-2 rounded-xl border border-brass/30 bg-brass/10 px-3 py-2 text-sm text-brass">
          <span aria-hidden>♛</span>
          <span>Promoted to Queen.</span>
        </div>
      ) : null}

      {/* board */}
      <GameCard className="p-2.5">
        <CapturedPieces side={topSide} />
        <div className="tabiya-board-wrap my-1.5 overflow-hidden rounded-lg ring-1 ring-frame">
          <Board orientation={orientation} />
        </div>
        <CapturedPieces side={bottomSide} />
      </GameCard>

      {notice ? (
        <div className="tab-animate-rise rounded-xl border border-bad/40 bg-bad/10 px-3 py-2 text-center text-sm text-bad">
          {notice}
        </div>
      ) : null}

      {/* result */}
      {isBot && result ? (
        <ResultBanner
          outcome={result.outcome}
          opponentName={opponent?.name ?? "Bot"}
          opponentPiece={opponent?.piece ?? "rook"}
          xp={result.xpAwarded}
          onRematch={() => startMatch(opponentId!)}
          onChange={exitMatch}
        />
      ) : null}

      {!isBot && snap.isGameOver ? (
        <GameCard variant="accent" glow className="tab-animate-pop p-4 text-center">
          <p className="text-[11px] uppercase tracking-wider text-muted2">Game over</p>
          <p className="mt-0.5 font-display text-xl text-cream">{statusLabel(snap.status, snap.turn, snap.isGameOver)}</p>
        </GameCard>
      ) : null}

      {/* controls */}
      {isBot ? (
        !result ? (
          <div className="grid grid-cols-2 gap-2.5">
            <ActionButton onClick={resignMatch} variant="secondary">
              Resign
            </ActionButton>
            <ActionButton onClick={() => setFlip((f) => !f)} variant="secondary">
              ⇅ Flip
            </ActionButton>
          </div>
        ) : null
      ) : (
        <Controls orientation={orientation} onFlip={() => setFlip((f) => !f)} />
      )}

      <MoveList />
    </div>
  );
}
