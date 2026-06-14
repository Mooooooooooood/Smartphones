import { Chess } from "chess.js";
import type { BuddyPiece } from "@/components/characters/ChessBuddy";

/**
 * Pure match-replay reconstruction from a SAN move list (preferred) or a PGN
 * string (fallback for older matches). No engine evaluation — just the moves.
 */

export interface ReplayFrame {
  index: number; // 0 = starting position
  fen: string;
  san?: string;
  color?: "w" | "b";
  from?: string;
  to?: string;
  captured?: string;
  promotion?: string;
  flags?: string;
}

/** Build the list of board frames (start + one per move), or null if unreplayable. */
export function buildReplay(input: { sans?: string[]; pgn?: string }): ReplayFrame[] | null {
  let sans = input.sans;

  if (!sans || sans.length === 0) {
    if (!input.pgn) return null;
    try {
      const g = new Chess();
      g.loadPgn(input.pgn);
      sans = g.history();
    } catch {
      return null;
    }
  }
  if (!sans || sans.length === 0) return null;

  const g = new Chess();
  const frames: ReplayFrame[] = [{ index: 0, fen: g.fen() }];
  for (let i = 0; i < sans.length; i++) {
    try {
      const mv = g.move(sans[i]);
      frames.push({
        index: i + 1,
        fen: g.fen(),
        san: mv.san,
        color: mv.color,
        from: mv.from,
        to: mv.to,
        captured: mv.captured,
        promotion: mv.promotion,
        flags: mv.flags,
      });
    } catch {
      return frames.length > 1 ? frames : null; // stop at the last good move
    }
  }
  return frames;
}

export interface Coach {
  text: string;
  piece: BuddyPiece;
}

/**
 * Friendly, non-engine commentary for a frame. Never claims "best move",
 * "blunder", or "accuracy" — just describes what visibly happened.
 */
export function coachComment(frame: ReplayFrame): Coach {
  if (frame.index === 0) {
    return { text: "The game begins — fight for the center!", piece: "pawn" };
  }
  const san = frame.san ?? "";
  const flags = frame.flags ?? "";
  const isMate = san.includes("#");
  const isCheck = san.includes("+");
  const isCastle = flags.includes("k") || flags.includes("q");
  const bigCapture = frame.captured === "q" || frame.captured === "r";

  if (isMate) return { text: "That was the finishing move — checkmate!", piece: "rook" };
  if (frame.promotion) return { text: "A pawn promoted into a powerful new piece!", piece: "pawn" };
  if (isCastle) return { text: "Castling — the king tucks away to safety.", piece: "pawn" };
  if (bigCapture) return { text: "Big material swing — a major piece came off!", piece: "knight" };
  if (isCheck) return { text: "Check! The king is under attack.", piece: "knight" };
  if (frame.captured) return { text: "A capture happened here.", piece: "knight" };
  if (frame.index <= 4) return { text: "Developing pieces and grabbing space.", piece: "pawn" };
  return { text: "A calm, positional move.", piece: "pawn" };
}

/**
 * A short, honest tag for what visibly happened on a move — derived purely from
 * SAN + flags, never an engine verdict. Used for the move-quality chips.
 */
export type MoveKind = "mate" | "promo" | "castle" | "capture" | "check" | "develop" | "quiet";

const MOVE_KIND_LABEL: Record<MoveKind, string> = {
  mate: "Checkmate",
  promo: "Promotion",
  castle: "Castle",
  capture: "Capture",
  check: "Check",
  develop: "Develop",
  quiet: "Quiet",
};

export function moveKind(frame: ReplayFrame): MoveKind {
  const san = frame.san ?? "";
  const flags = frame.flags ?? "";
  if (san.includes("#")) return "mate";
  if (frame.promotion) return "promo";
  if (flags.includes("k") || flags.includes("q")) return "castle";
  if (frame.captured) return "capture";
  if (san.includes("+")) return "check";
  if (frame.index <= 4) return "develop";
  return "quiet";
}

export function moveKindLabel(kind: MoveKind): string {
  return MOVE_KIND_LABEL[kind];
}

export interface MatchStats {
  moves: number; // moves the user played
  captures: number; // captures the user made
  checks: number; // checks the user gave
  castled: boolean; // did the user castle
}

/**
 * Tally honest, engine-free stats for the player's own moves. We never compute
 * "accuracy" or "best move" because there's no evaluation — only what happened.
 */
export function matchStats(frames: ReplayFrame[], userColor: "w" | "b"): MatchStats {
  let moves = 0;
  let captures = 0;
  let checks = 0;
  let castled = false;
  for (const f of frames) {
    if (f.index === 0 || f.color !== userColor) continue;
    moves++;
    if (f.captured) captures++;
    if ((f.san ?? "").includes("+") || (f.san ?? "").includes("#")) checks++;
    if ((f.flags ?? "").includes("k") || (f.flags ?? "").includes("q")) castled = true;
  }
  return { moves, captures, checks, castled };
}
