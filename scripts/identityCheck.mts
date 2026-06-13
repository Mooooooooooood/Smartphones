/**
 * Sprint 17 checks — player identity defaults, piece-unlock logic, and the
 * redrawn piece grids. Run: npx tsx scripts/identityCheck.mts
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pieceViews, isPieceUnlocked } from "../src/content/pieceUnlocks.ts";
import { getPlayerPiece, getPlayerSide, displayName } from "../src/lib/playerIdentity.ts";
import { lessonsForTier } from "../src/content/academy/index.ts";
import type { AcademyState } from "../src/domain/academy/progression.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) pass++;
  else { fail++; console.error("✗", name); }
}

// ---- Identity defaults ----
ok("default avatar piece is pawn", getPlayerPiece() === "pawn");
ok("default side is white", getPlayerSide() === "white");
ok("displayName falls back to Player", displayName() === "Player");

// ---- Piece unlocks ----
const empty: AcademyState = { completedLessonIds: {}, bossCleared: {} };
const t0 = lessonsForTier(0);
const lessons3: AcademyState = { completedLessonIds: Object.fromEntries(t0.slice(0, 3).map((l) => [l.id, true])), bossCleared: {} };
const t0all: AcademyState = { completedLessonIds: Object.fromEntries(t0.map((l) => [l.id, true])), bossCleared: {} };
const bossDone: AcademyState = { completedLessonIds: {}, bossCleared: { "tier-0": true } };

ok("fresh: only pawn unlocked", pieceViews({ solved: 0, wins: 0, academy: empty }).filter((p) => p.unlocked).map((p) => p.piece).join() === "pawn");
ok("pawn always unlocked", isPieceUnlocked("pawn", { solved: 0, wins: 0, academy: empty }));
ok("knight needs 3 puzzles (2 = locked)", !isPieceUnlocked("knight", { solved: 2, wins: 0, academy: empty }));
ok("knight unlocks at 3 puzzles", isPieceUnlocked("knight", { solved: 3, wins: 0, academy: empty }));
ok("bishop unlocks at 3 lessons", isPieceUnlocked("bishop", { solved: 0, wins: 0, academy: lessons3 }));
ok("rook unlocks after a win", isPieceUnlocked("rook", { solved: 0, wins: 1, academy: empty }));
ok("rook locked with no wins", !isPieceUnlocked("rook", { solved: 0, wins: 0, academy: empty }));
ok("queen unlocks after a boss trial", isPieceUnlocked("queen", { solved: 0, wins: 0, academy: bossDone }));
ok("king unlocks when Tier 0 complete", isPieceUnlocked("king", { solved: 0, wins: 0, academy: t0all }));
ok("king locked before Tier 0 complete", !isPieceUnlocked("king", { solved: 0, wins: 0, academy: lessons3 }));
ok("every piece view has a progress bar 0..1", pieceViews({ solved: 1, wins: 0, academy: empty }).every((p) => p.pct >= 0 && p.pct <= 1));

// ---- Redrawn piece grids are all 16 wide ----
const src = readFileSync(join(root, "src/components/pixel/PixelChessPieces.tsx"), "utf8");
const rows = [...src.matchAll(/"([.OXHS]{2,})"/g)].map((m) => m[1]);
ok("piece grids found", rows.length >= 60);
ok("every piece grid row is 16 wide", rows.every((r) => r.length === 16));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All identity checks passed");
