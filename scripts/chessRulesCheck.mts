/**
 * Chess movement regression check (Sprint 4 QA).
 *
 * Exercises the rules engine through chess.js wrappers — no hand-rolled rules.
 * Run with:  npm run test:rules
 */
import { Chess } from "chess.js";
import type { PieceSymbol, Square } from "chess.js";
import { createGame, getStatus, tryMove } from "../src/domain/chess/engine.ts";

let pass = 0;
let fail = 0;

function check(desc: string, got: unknown, want: unknown) {
  if (got === want) {
    pass++;
  } else {
    fail++;
    console.error(`✗ ${desc} — expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  }
}

/** Is `from`→`to` legal in `fen` (or the start position when fen is null)? */
function legal(fen: string | null, from: Square, to: Square, promo: PieceSymbol = "q"): boolean {
  const game = fen ? new Chess(fen) : new Chess();
  return tryMove(game, from, to, promo);
}

function statusOf(fen: string): string {
  return getStatus(new Chess(fen));
}

// ---- Pawns ----
check("pawn one-step", legal(null, "e2", "e3"), true);
check("pawn two-step first move", legal(null, "e2", "e4"), true);
check("pawn three squares illegal", legal(null, "e2", "e5"), false);
check("pawn blocked cannot single", legal("4k3/8/8/8/8/4p3/4P3/4K3 w - - 0 1", "e2", "e3"), false);
check("pawn blocked cannot double", legal("4k3/8/8/8/8/4p3/4P3/4K3 w - - 0 1", "e2", "e4"), false);
check("pawn diagonal capture", legal("4k3/8/8/8/8/3p4/4P3/4K3 w - - 0 1", "e2", "d3"), true);
check("pawn diagonal to empty illegal", legal("4k3/8/8/8/8/8/4P3/4K3 w - - 0 1", "e2", "d3"), false);

// ---- Knights ----
check("knight L-jump from start", legal(null, "g1", "f3"), true);
check("knight over pieces (b1-c3)", legal(null, "b1", "c3"), true);
check("knight straight illegal", legal(null, "g1", "g3"), false);

// ---- Bishops ----
check("bishop diagonal", legal("4k3/8/8/8/8/8/8/2B1K3 w - - 0 1", "c1", "a3"), true);
check("bishop straight illegal", legal("4k3/8/8/8/8/8/8/2B1K3 w - - 0 1", "c1", "c3"), false);
check("bishop blocked path", legal("4k3/8/8/8/8/8/1p6/2B1K3 w - - 0 1", "c1", "a3"), false);
check("bishop captures blocker", legal("4k3/8/8/8/8/8/1p6/2B1K3 w - - 0 1", "c1", "b2"), true);

// ---- Rooks ----
check("rook straight file", legal("4k3/8/8/8/8/8/8/R3K3 w - - 0 1", "a1", "a5"), true);
check("rook diagonal illegal", legal("4k3/8/8/8/8/8/8/R3K3 w - - 0 1", "a1", "b2"), false);
check("rook blocked by own pawn", legal("4k3/8/8/8/8/8/P7/R3K3 w - - 0 1", "a1", "a4"), false);

// ---- Queens ----
check("queen straight", legal("4k3/8/8/8/8/8/8/3QK3 w - - 0 1", "d1", "d5"), true);
check("queen diagonal", legal("4k3/8/8/8/8/8/8/3QK3 w - - 0 1", "d1", "h5"), true);
check("queen knight-shape illegal", legal("4k3/8/8/8/8/8/8/3QK3 w - - 0 1", "d1", "f4"), false);

// ---- Kings ----
check("king one square", legal("4k3/8/8/8/8/8/8/4K3 w - - 0 1", "e1", "e2"), true);
check("king two squares illegal", legal("4k3/8/8/8/8/8/8/4K3 w - - 0 1", "e1", "e3"), false);
check("king cannot move into check", legal("4k3/8/8/8/8/8/r7/4K3 w - - 0 1", "e1", "e2"), false);
check("king sidesteps to safe square", legal("4k3/8/8/8/8/8/r7/4K3 w - - 0 1", "e1", "d1"), true);

// ---- Castling ----
check("kingside castle legal", legal("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", "e1", "g1"), true);
check("queenside castle legal", legal("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", "e1", "c1"), true);
check("castle illegal without rights", legal("r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1", "e1", "g1"), false);
check("castle through check illegal", legal("4k3/8/8/8/8/5r2/8/R3K2R w KQ - 0 1", "e1", "g1"), false);
check("other-side castle still legal", legal("4k3/8/8/8/8/5r2/8/R3K2R w KQ - 0 1", "e1", "c1"), true);

// ---- En passant ----
check("en passant legal with ep square", legal("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1", "e5", "d6"), true);
check("en passant illegal without ep square", legal("4k3/8/8/3pP3/8/8/8/4K3 w - - 0 1", "e5", "d6"), false);

// ---- Promotion ----
{
  const g = new Chess("k7/4P3/8/8/8/8/8/4K3 w - - 0 1");
  const m = g.move({ from: "e7", to: "e8", promotion: "q" });
  check("promotion legal & auto-queens", m.promotion, "q");
  check("promotion SAN marks queen", m.san.includes("=Q"), true);
}

// ---- Game-end status ----
check("check detected", statusOf("4k3/8/8/8/8/8/4R3/4K3 b - - 0 1"), "check");
{
  const g = new Chess("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1");
  tryMove(g, "a1", "a8");
  check("checkmate detected", getStatus(g), "checkmate");
}
check("stalemate detected", statusOf("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1"), "stalemate");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All chess rule checks passed");
