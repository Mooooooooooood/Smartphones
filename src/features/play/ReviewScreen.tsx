"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { loadMatch } from "@/data/matchRepository";
import {
  buildReplay,
  coachComment,
  matchStats,
  moveKind,
  moveKindLabel,
  type MoveKind,
  type ReplayFrame,
} from "@/domain/chess/replay";
import type { MatchRow } from "@/data/db";
import PixelTopBar from "@/components/pixel/PixelTopBar";
import PixelPanel from "@/components/pixel/PixelPanel";
import PixelButton from "@/components/pixel/PixelButton";
import PixelStat from "@/components/pixel/PixelStat";
import ChessBuddy from "@/components/characters/ChessBuddy";
import { BoardSkeleton } from "@/components/ui/Skeleton";

const LessonBoard = dynamic(() => import("@/components/LessonBoard"), {
  ssr: false,
  loading: () => <BoardSkeleton />,
});

/** Pixel-framed colour token for each move-quality chip. */
const KIND_STYLE: Record<MoveKind, { bg: string; fg: string }> = {
  mate: { bg: "var(--color-brass)", fg: "var(--color-on-accent)" },
  promo: { bg: "var(--color-lav)", fg: "#190a2e" },
  castle: { bg: "var(--color-sky)", fg: "#06122e" },
  capture: { bg: "var(--color-bad)", fg: "#2a0709" },
  check: { bg: "var(--color-good)", fg: "#06220f" },
  develop: { bg: "var(--color-frame)", fg: "var(--color-cream)" },
  quiet: { bg: "var(--color-frame)", fg: "var(--color-muted2)" },
};

function MoveChip({ kind }: { kind: MoveKind }) {
  const s = KIND_STYLE[kind];
  return (
    <span
      className="px-label rounded-[4px] border-2 border-[var(--px-edge)] px-1.5 py-0.5 text-[0.46rem]"
      style={{ background: s.bg, color: s.fg }}
    >
      {moveKindLabel(kind)}
    </span>
  );
}

function NavBtn({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="px-inset flex min-h-[44px] flex-1 items-center justify-center rounded-[6px] text-[0.8rem] text-cream transition-transform active:translate-y-0.5 disabled:opacity-35"
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
  const stats = useMemo(
    () => (frames && match ? matchStats(frames, match.userColor) : null),
    [frames, match],
  );

  // ----- loading / unavailable states -----
  if (!validId || match === null) {
    return (
      <div className="space-y-2.5">
        <PixelTopBar />
        <PixelPanel hue="red" className="p-5 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-[8px] border-2 border-[var(--px-edge)] bg-[var(--color-ink)]">
            <ChessBuddy piece="rook" size={48} />
          </div>
          <h1 className="px-title text-[0.95rem] text-cream">Match not found</h1>
          <p className="mt-1 text-[0.6rem] text-muted2">That game isn&apos;t in your history any more.</p>
          <div className="mt-3">
            <PixelButton onClick={() => router.push("/play")} tone="gold">BACK TO PLAY</PixelButton>
          </div>
        </PixelPanel>
      </div>
    );
  }

  if (match === undefined) {
    return (
      <div className="space-y-3">
        <PixelTopBar />
        <div className="tab-skeleton h-9 w-2/3" />
        <BoardSkeleton />
        <div className="tab-skeleton h-12 w-full" />
      </div>
    );
  }

  const orientation: "white" | "black" = match.userColor === "w" ? "white" : "black";
  const delta = match.ratingAfter - match.ratingBefore;
  const resultLabel = match.result === "win" ? "You won" : match.result === "draw" ? "Draw" : "You lost";
  const resultHue = match.result === "win" ? "green" : match.result === "draw" ? "gold" : "red";

  if (!frames) {
    return (
      <div className="space-y-2.5">
        <PixelTopBar />
        <PixelPanel hue="gray" className="p-5 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-[8px] border-2 border-[var(--px-edge)] bg-[var(--color-ink)]">
            <ChessBuddy piece="rook" size={48} />
          </div>
          <h1 className="px-title text-[0.95rem] text-cream">Replay unavailable</h1>
          <p className="mt-1 text-[0.6rem] text-muted2">
            This older match doesn&apos;t have replay data saved. New matches can be reviewed move by move.
          </p>
          <div className="mt-3">
            <PixelButton onClick={() => router.push("/play")} tone="gold">BACK TO PLAY</PixelButton>
          </div>
        </PixelPanel>
      </div>
    );
  }

  const lastMove = frame?.from && frame?.to ? { from: frame.from, to: frame.to } : null;
  const kind = frame && frame.index > 0 ? moveKind(frame) : null;

  return (
    <div className="space-y-2.5">
      <PixelTopBar />

      {/* Header */}
      <PixelPanel hue={resultHue} className="flex items-center gap-2.5 px-2.5 py-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] border-2 border-[var(--px-edge)] bg-[var(--color-ink)]">
          <ChessBuddy piece="rook" size={38} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="px-label text-[0.5rem] text-brass">Game Review</p>
          <h1 className="truncate px-title text-[0.9rem] text-cream">{resultLabel} vs {match.opponentName}</h1>
        </div>
        <div className="shrink-0 text-right">
          <span className={`block font-display text-[0.7rem] ${delta >= 0 ? "text-good" : "text-bad"}`}>
            {delta >= 0 ? "+" : ""}{delta}
          </span>
          <span className="px-label text-[0.46rem] text-brass">+{match.xpAwarded} XP</span>
        </div>
      </PixelPanel>

      {/* Honest, engine-free match stats */}
      {stats ? (
        <div className="grid grid-cols-4 gap-1.5">
          <PixelStat label="Moves" value={stats.moves} tone="blue" />
          <PixelStat label="Captures" value={stats.captures} tone="gold" />
          <PixelStat label="Checks" value={stats.checks} tone="good" />
          <PixelStat label="Castled" value={stats.castled ? "✓" : "—"} tone={stats.castled ? "good" : "default"} />
        </div>
      ) : null}

      {/* Coach commentary for the current move */}
      {coach ? (
        <PixelPanel hue="green" className="flex items-center gap-2 px-2.5 py-2">
          <ChessBuddy piece={coach.piece} size={30} className="shrink-0" />
          <p className="flex-1 text-[0.62rem] leading-tight text-cream">{coach.text}</p>
          {kind ? <MoveChip kind={kind} /> : null}
        </PixelPanel>
      ) : null}

      {/* Board */}
      <div className="px-board-frame">
        <div className="tabiya-board-wrap overflow-hidden rounded-[4px]">
          <LessonBoard fen={frame!.fen} orientation={orientation} lastMove={lastMove} />
        </div>
      </div>

      {/* Move counter */}
      <div className="px-inset flex items-center justify-between px-2.5 py-1.5 text-[0.56rem]">
        <span className="text-muted2">You played {match.userColor === "w" ? "White" : "Black"}</span>
        <span className="font-display text-[0.56rem] text-cream">
          {ply === 0 ? "Start" : `${ply}/${total} · ${frame?.san}`}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex gap-1.5">
        <NavBtn onClick={() => setPly(0)} disabled={ply === 0} label="First move">⏮</NavBtn>
        <NavBtn onClick={() => setPly((p) => Math.max(0, p - 1))} disabled={ply === 0} label="Previous move">◀</NavBtn>
        <NavBtn onClick={() => setPly((p) => Math.min(total, p + 1))} disabled={ply >= total} label="Next move">▶</NavBtn>
        <NavBtn onClick={() => setPly(total)} disabled={ply >= total} label="Last move">⏭</NavBtn>
      </div>

      {/* Move list with quality chips */}
      <PixelPanel hue="purple" label="Moves" labelHue="purple" className="px-2.5 pb-2.5 pt-3">
        <div className="max-h-40 overflow-y-auto">
          <table className="w-full text-[0.6rem] tabular-nums">
            <tbody>
              {Array.from({ length: Math.ceil(total / 2) }).map((_, r) => {
                const wi = r * 2 + 1;
                const bi = r * 2 + 2;
                return (
                  <tr key={r} className="text-cream">
                    <td className="w-7 py-0.5 pr-1.5 text-right text-muted2">{r + 1}.</td>
                    {[wi, bi].map((mi) => (
                      <td key={mi} className="py-0.5 pr-1.5">
                        {frames[mi] ? (
                          <button
                            onClick={() => setPly(mi)}
                            className={`flex items-center gap-1 rounded-[4px] px-1 py-0.5 ${ply === mi ? "bg-[var(--color-ink)] font-bold text-brass" : "text-cream"}`}
                          >
                            <span>{frames[mi].san}</span>
                            <span className="h-1.5 w-1.5 rounded-[2px]" style={{ background: KIND_STYLE[moveKind(frames[mi])].bg }} aria-hidden />
                          </button>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PixelPanel>

      <PixelButton onClick={() => router.push("/play")} variant="secondary">DONE</PixelButton>
    </div>
  );
}
