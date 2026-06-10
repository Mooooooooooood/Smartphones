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
import type { MatchResultState } from "@/state/gameStore";
import type { Opponent } from "@/content/opponents";

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

function reasonText(reason: string): string {
  if (reason === "checkmate") return "by checkmate";
  if (reason === "stalemate") return "stalemate";
  if (reason === "resignation") return "you resigned";
  return "draw";
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

/* ---------- match recap ---------- */

function StatPill({ label, value, tone = "cream" }: { label: string; value: string; tone?: "cream" | "good" | "brass" }) {
  const color = tone === "good" ? "text-gooddeep" : tone === "brass" ? "text-brass" : "text-cream";
  return (
    <div className="rounded-xl border border-line bg-panel px-2 py-1.5 text-center">
      <div className={`font-display text-base leading-none ${color}`}>{value}</div>
      <div className="mt-0.5 text-[9px] uppercase tracking-wide text-muted2">{label}</div>
    </div>
  );
}

function MatchRecap({
  result,
  opponent,
  onRematch,
  onChange,
}: {
  result: MatchResultState;
  opponent: Opponent | undefined;
  onRematch: () => void;
  onChange: () => void;
}) {
  const delta = result.ratingAfter - result.ratingBefore;
  const ratingStr = result.pending ? "…" : `${delta >= 0 ? "+" : ""}${delta}`;
  const xpStr = result.pending ? "…" : `+${result.xpAwarded}`;
  const reaction = opponent?.reactions[result.outcome] ?? "Good game!";
  const piece = opponent?.piece ?? "rook";

  const title =
    result.outcome === "win" ? "Victory!" : result.outcome === "draw" ? "It's a draw!" : "Defeat";

  const stats = (
    <>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatPill label="XP" value={xpStr} tone="brass" />
        <StatPill label="Rating" value={ratingStr} tone={delta >= 0 ? "good" : "cream"} />
        <StatPill label="Moves" value={`${result.moves}`} />
      </div>
      <p className="mt-2 text-[11px] text-muted2">Match ended {reasonText(result.reason)}</p>
      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <ActionButton onClick={onChange} variant="secondary">
            New opponent
          </ActionButton>
          <ActionButton onClick={onRematch}>Rematch ›</ActionButton>
        </div>
        <ActionButton href="/" variant="ghost">
          Continue training →
        </ActionButton>
      </div>
    </>
  );

  if (result.outcome === "win") {
    return (
      <RewardPanel title={title} xp={result.pending ? null : result.xpAwarded} tone="good" piece={piece} subtitle={reaction}>
        {stats}
      </RewardPanel>
    );
  }

  return (
    <GameCard variant="accent" className="tab-animate-pop p-5 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-line bg-surf-blue">
        <ChessBuddy piece={piece} size={64} />
      </div>
      <h3 className="mt-3 font-display text-xl text-cream">{title}</h3>
      <p className="mt-1 text-sm text-muted">{reaction}</p>
      {stats}
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
  const matchOver = isBot && result !== null;

  const oppFirst = opponent?.name?.split(" ")[0] ?? "Bot";
  const myTurn = snap.turn === userColor;
  const turnText = matchOver
    ? "Game over"
    : botThinking
      ? `${oppFirst} is thinking…`
      : isBot
        ? myTurn
          ? "Your move"
          : `${oppFirst}'s move`
        : `${snap.turn === "w" ? "White" : "Black"} to move`;

  const topLabel = isBot ? oppFirst : topSide === "w" ? "White" : "Black";
  const bottomLabel = isBot ? "You" : bottomSide === "w" ? "White" : "Black";

  return (
    <div className="space-y-3">
      {/* Match header */}
      <GameCard className="flex items-center gap-3 p-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-surf-blue">
          <ChessBuddy piece={opponent?.piece ?? "rook"} size={46} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-display text-base text-cream">{isBot ? opponent?.name ?? "Bot" : "Practice Board"}</h1>
            {isBot ? (
              <span className="shrink-0 rounded-full border border-line bg-panel px-2 py-0.5 text-[10px] font-semibold text-muted2">
                ~{opponent?.rating}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs">
            {botThinking ? <span className="tab-bob inline-block text-brass">●</span> : null}
            <span className={`font-semibold ${matchOver ? "text-muted" : inCheck ? "text-bad" : "text-brass"}`}>
              {inCheck && !matchOver ? "Check! " : ""}
              {turnText}
            </span>
            {isBot ? <span className="text-muted2">· You: {userColor === "w" ? "White" : "Black"}</span> : null}
          </p>
        </div>
        <button onClick={exitMatch} className="shrink-0 rounded-full border border-line bg-panel/60 px-3 py-1.5 text-xs font-semibold text-muted">
          Leave
        </button>
      </GameCard>

      {justPromoted ? (
        <div className="tab-animate-rise flex items-center gap-2 rounded-xl border border-brass/30 bg-brass/10 px-3 py-2 text-sm text-brass">
          <span aria-hidden>♛</span>
          <span>Promoted to Queen.</span>
        </div>
      ) : null}

      {/* Board with labelled material */}
      <GameCard className="p-2.5">
        <CapturedPieces side={topSide} label={topLabel} />
        <div className="tabiya-board-wrap my-1.5 overflow-hidden rounded-lg ring-1 ring-frame">
          <Board orientation={orientation} />
        </div>
        <CapturedPieces side={bottomSide} label={bottomLabel} />
      </GameCard>

      {notice ? (
        <div className="tab-animate-rise rounded-xl border border-bad/40 bg-bad/10 px-3 py-2 text-center text-sm text-bad">
          {notice}
        </div>
      ) : null}

      {/* Recap (bot) or game-over note (practice) */}
      {matchOver && result ? (
        <MatchRecap
          result={result}
          opponent={opponent}
          onRematch={() => startMatch(opponentId!)}
          onChange={exitMatch}
        />
      ) : !isBot && snap.isGameOver ? (
        <GameCard variant="accent" glow className="tab-animate-pop p-4 text-center">
          <p className="text-[11px] uppercase tracking-wider text-muted2">Game over</p>
          <p className="mt-0.5 font-display text-xl text-cream">{statusLabel(snap.status, snap.turn, snap.isGameOver)}</p>
        </GameCard>
      ) : null}

      {/* Controls — hidden once a bot match is over */}
      {isBot ? (
        !matchOver ? (
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
