"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useGameStore } from "@/state/gameStore";
import { useProfileStore } from "@/state/profileStore";
import { OPPONENTS, opponentById } from "@/content/opponents";
import MoveList from "@/components/MoveList";
import CapturedPieces from "@/components/CapturedPieces";
import Controls from "@/components/Controls";
import RewardPanel from "@/components/ui/RewardPanel";
import ChessBuddy from "@/components/characters/ChessBuddy";
import TopBar from "@/components/pixel/TopBar";
import PixelPanel, { type PixelHue } from "@/components/pixel/PixelPanel";
import PixelButton from "@/components/pixel/PixelButton";
import PixelStat from "@/components/pixel/PixelStat";
import { BoardSkeleton } from "@/components/ui/Skeleton";
import type { Color, GameStatus } from "@/domain/chess/types";
import type { MatchResultState } from "@/state/gameStore";
import type { Opponent } from "@/content/opponents";
import type { BuddyPiece } from "@/components/characters/ChessBuddy";
import type { SideChoice } from "@/domain/chess/side";

const Board = dynamic(() => import("@/components/Board"), { ssr: false, loading: () => <BoardSkeleton /> });

/** Opponent piece → arcade card hue. */
const PIECE_HUE: Record<BuddyPiece, PixelHue> = {
  pawn: "blue", rook: "orange", knight: "green", bishop: "purple", queen: "red", king: "gold",
};

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

function OpponentSelect({ onChoose, onPractice }: { onChoose: (id: string) => void; onPractice: () => void }) {
  return (
    <div className="space-y-2.5">
      <TopBar />
      <h1 className="px-title px-1 text-[1.5rem] leading-tight">Choose Your Match</h1>
      <p className="px-1 text-[0.62rem] text-muted">Pick a friendly opponent — they only play legal moves.</p>

      <div className="space-y-2.5">
        {OPPONENTS.map((o) => (
          <button key={o.id} type="button" onClick={() => onChoose(o.id)} className="block w-full text-left active:translate-y-0.5">
            <PixelPanel hue={PIECE_HUE[o.piece]} className="flex items-center gap-2.5 px-2.5 py-2.5">
              <div className="px-inset flex h-14 w-14 shrink-0 items-center justify-center">
                <ChessBuddy piece={o.piece} size={44} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="truncate px-label text-[0.7rem] text-cream">{o.name}</h2>
                  <span className="px-inset shrink-0 px-1 py-0.5 text-[0.5rem] font-bold text-muted">~{o.rating}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="px-label text-[0.46rem] text-brass">{o.level}</span>
                  <span className="px-label text-[0.46rem] text-good">+{o.xpReward} XP</span>
                  {o.recommended ? (
                    <span className="px-label rounded-[4px] border-2 border-[var(--px-edge)] bg-good px-1 py-0.5 text-[0.42rem] text-[color:#06220f]">Start Here</span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-[0.6rem] text-muted2">{o.line}</p>
              </div>
              <span className="px-btn !min-h-0 !px-2.5 !py-2 shrink-0 text-cream" aria-hidden>→</span>
            </PixelPanel>
          </button>
        ))}

        <button type="button" onClick={onPractice} className="block w-full text-left active:translate-y-0.5">
          <PixelPanel hue="gray" className="flex items-center gap-2.5 px-2.5 py-2.5">
            <div className="px-inset flex h-12 w-12 shrink-0 items-center justify-center">
              <ChessBuddy piece="bishop" size={38} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="px-label text-[0.7rem] text-cream">Practice Board</h2>
              <p className="text-[0.6rem] text-muted2">Free play — move both sides yourself</p>
            </div>
            <span className="shrink-0 text-muted2">›</span>
          </PixelPanel>
        </button>
      </div>
    </div>
  );
}

/* ---------- match setup ---------- */

const SIDES: { value: SideChoice; label: string; sub: string; glyph: string }[] = [
  { value: "w", label: "White", sub: "Move first", glyph: "♙" },
  { value: "b", label: "Black", sub: "They move first", glyph: "♟" },
  { value: "random", label: "Random", sub: "Surprise me", glyph: "?" },
];

function MatchSetup({ opponent, onStart, onBack }: { opponent: Opponent; onStart: (side: SideChoice) => void; onBack: () => void }) {
  const [side, setSide] = useState<SideChoice>("w");
  return (
    <div className="space-y-3">
      <TopBar />
      <button onClick={onBack} className="px-label px-1 text-[0.56rem] text-muted">‹ Opponents</button>

      <PixelPanel hue={PIECE_HUE[opponent.piece]} rivets className="px-4 py-4 text-center">
        <div className="px-inset mx-auto flex h-24 w-24 items-center justify-center">
          <ChessBuddy piece={opponent.piece} size={72} />
        </div>
        <p className="px-label mt-2.5 text-[0.52rem] text-brass">You vs</p>
        <h1 className="px-title text-[1.1rem] text-cream">{opponent.name}</h1>
        <p className="mt-1 text-[0.66rem] text-muted">&ldquo;{opponent.line}&rdquo;</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="px-inset px-2 py-0.5 text-[0.54rem] text-muted">~{opponent.rating}</span>
          <span className="px-inset px-2 py-0.5 text-[0.54rem] font-bold text-brass">Win = +{opponent.xpReward} XP</span>
        </div>
      </PixelPanel>

      <div>
        <p className="px-label mb-1.5 text-[0.54rem] text-muted2">Choose your side</p>
        <div className="grid grid-cols-3 gap-2">
          {SIDES.map((s) => {
            const active = side === s.value;
            return (
              <button key={s.value} type="button" onClick={() => setSide(s.value)}
                className={`px-inset flex flex-col items-center gap-0.5 py-2.5 text-center ${active ? "!border-brass" : ""}`}
                style={active ? { boxShadow: "inset 0 0 0 2px var(--color-brass)" } : undefined}>
                <span className={`text-xl ${active ? "text-brass" : "text-muted"}`} aria-hidden>{s.glyph}</span>
                <span className="px-label text-[0.5rem] text-cream">{s.label}</span>
                <span className="text-[0.5rem] leading-tight text-muted2">{s.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <PixelButton onClick={() => onStart(side)} tone="gold">⚔ START MATCH ⚔</PixelButton>
    </div>
  );
}

/* ---------- recap ---------- */

function MatchRecap({ result, opponent, reviewHref, onRematch, onChange }: {
  result: MatchResultState; opponent: Opponent | undefined; reviewHref?: string; onRematch: () => void; onChange: () => void;
}) {
  const delta = result.ratingAfter - result.ratingBefore;
  const ratingStr = result.pending ? "…" : `${delta >= 0 ? "+" : ""}${delta}`;
  const xpStr = result.pending ? "…" : `+${result.xpAwarded}`;
  const reaction = opponent?.reactions[result.outcome] ?? "Good game!";
  const piece = opponent?.piece ?? "rook";
  const title = result.outcome === "win" ? "Victory!" : result.outcome === "draw" ? "It's a Draw!" : "Defeat";

  const stats = (
    <>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <PixelStat label="XP" value={xpStr} tone="gold" />
        <PixelStat label="Rating" value={ratingStr} tone={delta >= 0 ? "good" : "default"} />
        <PixelStat label="Moves" value={`${result.moves}`} />
      </div>
      <p className="mt-2 text-[0.58rem] text-muted2">Match ended {reasonText(result.reason)}</p>
      <div className="mt-3 space-y-2">
        {reviewHref ? <PixelButton href={reviewHref} tone="blue">🔍 REVIEW GAME</PixelButton> : null}
        <div className="grid grid-cols-2 gap-2">
          <PixelButton onClick={onChange} variant="secondary" size="sm">New foe</PixelButton>
          <PixelButton onClick={onRematch} tone="green" size="sm">Rematch ›</PixelButton>
        </div>
        <PixelButton href="/" variant="ghost" size="sm">Continue training →</PixelButton>
      </div>
    </>
  );

  if (result.outcome === "win") {
    return <RewardPanel title={title} xp={result.pending ? null : result.xpAwarded} tone="good" piece={piece} subtitle={reaction}>{stats}</RewardPanel>;
  }
  const hue: PixelHue = result.outcome === "draw" ? "gold" : "red";
  return (
    <PixelPanel hue={hue} rivets className="tab-animate-pop px-4 py-4 text-center">
      <span className="px-label rounded-[4px] border-2 border-[var(--px-edge)] bg-[var(--color-ink)] px-2 py-0.5 text-[0.5rem] text-brass">
        {result.outcome === "draw" ? "DRAW" : "DEFEAT"}
      </span>
      <div className="tab-bob px-inset mx-auto mt-2.5 flex h-24 w-24 items-center justify-center">
        <ChessBuddy piece={piece} size={72} />
      </div>
      <h3 className="px-title mt-2.5 text-[1.1rem] text-cream">{title}</h3>
      <p className="mt-1 text-[0.7rem] text-muted">{reaction}</p>
      {stats}
    </PixelPanel>
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
  const latestMatchId = useProfileStore((s) => s.matches[0]?.id);
  const clearNotice = useGameStore((s) => s.clearNotice);

  const startMatch = useGameStore((s) => s.startMatch);
  const startPractice = useGameStore((s) => s.startPractice);
  const exitMatch = useGameStore((s) => s.exitMatch);
  const resignMatch = useGameStore((s) => s.resignMatch);

  const [flip, setFlip] = useState(false);
  const [setupId, setSetupId] = useState<string | null>(null);

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
    const setupOpponent = setupId ? opponentById(setupId) : undefined;
    if (setupOpponent) {
      return <MatchSetup opponent={setupOpponent} onBack={() => setSetupId(null)} onStart={(side) => { setSetupId(null); startMatch(setupOpponent.id, side); }} />;
    }
    return <OpponentSelect onChoose={setSetupId} onPractice={startPractice} />;
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
  const turnText = matchOver ? "Game over" : botThinking ? `${oppFirst} is thinking…` : isBot ? (myTurn ? "Your move" : `${oppFirst}'s move`) : `${snap.turn === "w" ? "White" : "Black"} to move`;
  const topLabel = isBot ? oppFirst : topSide === "w" ? "White" : "Black";
  const bottomLabel = isBot ? "You" : bottomSide === "w" ? "White" : "Black";

  return (
    <div className="space-y-2.5">
      <TopBar />
      {/* Battle header */}
      <PixelPanel hue={opponent ? PIECE_HUE[opponent.piece] : "gray"} className="flex items-center gap-2.5 px-2.5 py-2">
        <div className="px-inset flex h-12 w-12 shrink-0 items-center justify-center">
          <ChessBuddy piece={opponent?.piece ?? "rook"} size={38} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate px-label text-[0.66rem] text-cream">{isBot ? opponent?.name ?? "Bot" : "Practice Board"}</h1>
            {isBot ? <span className="px-inset shrink-0 px-1 py-0.5 text-[0.5rem] font-bold text-muted">~{opponent?.rating}</span> : null}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-[0.6rem]">
            {botThinking ? <span className="tab-bob inline-block text-brass">●</span> : null}
            <span className={`font-bold ${matchOver ? "text-muted" : inCheck ? "text-bad" : "text-brass"}`}>{inCheck && !matchOver ? "Check! " : ""}{turnText}</span>
            {isBot ? <span className="text-muted2">· You: {userColor === "w" ? "White" : "Black"}</span> : null}
          </p>
        </div>
        <PixelButton onClick={exitMatch} tone="red" variant="solid" size="sm" className="!w-auto">Leave</PixelButton>
      </PixelPanel>

      {justPromoted ? (
        <div className="px-inset tab-animate-rise flex items-center gap-2 px-3 py-1.5 text-[0.66rem] text-brass">
          <span aria-hidden>♛</span><span>Promoted to Queen.</span>
        </div>
      ) : null}

      {/* Board */}
      <div className="px-board-frame">
        <CapturedPieces side={topSide} label={topLabel} />
        <div className="tabiya-board-wrap my-1 overflow-hidden rounded-[4px]">
          <Board orientation={orientation} />
        </div>
        <CapturedPieces side={bottomSide} label={bottomLabel} />
      </div>

      {notice ? (
        <div className="px-inset tab-animate-rise px-3 py-2 text-center text-[0.66rem] text-bad" style={{ borderColor: "var(--color-bad)" }}>{notice}</div>
      ) : null}

      {matchOver && result ? (
        <MatchRecap result={result} opponent={opponent} reviewHref={!result.pending && latestMatchId ? `/play/review?id=${latestMatchId}` : undefined} onRematch={() => startMatch(opponentId!)} onChange={exitMatch} />
      ) : !isBot && snap.isGameOver ? (
        <PixelPanel hue="gold" className="tab-animate-pop px-4 py-3 text-center">
          <p className="px-label text-[0.5rem] text-muted2">Game over</p>
          <p className="px-title mt-0.5 text-[0.9rem] text-cream">{statusLabel(snap.status, snap.turn, snap.isGameOver)}</p>
        </PixelPanel>
      ) : null}

      {isBot ? (
        !matchOver ? (
          <div className="grid grid-cols-2 gap-2">
            <PixelButton onClick={resignMatch} variant="secondary" size="sm">⚑ Resign</PixelButton>
            <PixelButton onClick={() => setFlip((f) => !f)} variant="secondary" size="sm">⇅ Flip</PixelButton>
          </div>
        ) : null
      ) : (
        <Controls orientation={orientation} onFlip={() => setFlip((f) => !f)} />
      )}

      <MoveList />
    </div>
  );
}
