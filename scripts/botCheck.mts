/**
 * Bot legality checks (Sprint 7). Run with:  npm run test:bot
 *
 * Verifies the friendly bot only ever plays legal chess.js moves, returns no
 * move when the game is over, and that each personality survives full games.
 */
import { Chess } from "chess.js";
import { chooseBotMove, type BotPersonality } from "../src/domain/chess/bot.ts";
import { resolveSide } from "../src/domain/chess/side.ts";
import { buildReplay, coachComment } from "../src/domain/chess/replay.ts";

let pass = 0;
let fail = 0;
function ok(desc: string, cond: boolean) {
  if (cond) pass++;
  else {
    fail++;
    console.error("✗ " + desc);
  }
}

const personalities: BotPersonality[] = ["random", "cautious", "tactical"];

// Play many full bot-vs-bot games; every chosen move must be legal.
for (const p of personalities) {
  let illegalSeen = false;
  let gamesFinished = 0;
  for (let g = 0; g < 40; g++) {
    const game = new Chess();
    for (let ply = 0; ply < 220 && !game.isGameOver(); ply++) {
      const mv = chooseBotMove(game.fen(), p);
      if (!mv) {
        illegalSeen = illegalSeen || !game.isGameOver();
        break;
      }
      const legal = game.moves({ verbose: true }).some(
        (m) => m.from === mv.from && m.to === mv.to && (m.promotion ?? undefined) === (mv.promotion ?? undefined),
      );
      if (!legal) {
        illegalSeen = true;
        break;
      }
      // applying must not throw (extra guarantee of legality)
      try {
        game.move({ from: mv.from, to: mv.to, promotion: mv.promotion ?? "q" });
      } catch {
        illegalSeen = true;
        break;
      }
    }
    if (game.isGameOver()) gamesFinished++;
  }
  ok(`${p}: only legal moves across 40 games`, !illegalSeen);
  ok(`${p}: at least some games reached an end`, gamesFinished > 0);
}

// Returns null when the game is over (checkmate position).
{
  const mate = "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1";
  const g = new Chess(mate);
  g.move({ from: "a1", to: "a8" }); // Ra8#
  ok("game over → no move (random)", chooseBotMove(g.fen(), "random") === null);
  ok("game over → no move (tactical)", chooseBotMove(g.fen(), "tactical") === null);
}

// From a normal opening position every personality returns a legal move.
{
  const g = new Chess();
  g.move("e4");
  g.move("e5");
  const moves = g.moves({ verbose: true });
  for (const p of personalities) {
    const mv = chooseBotMove(g.fen(), p);
    ok(`${p}: returns a legal move from a normal position`, mv !== null && moves.some((m) => m.from === mv.from && m.to === mv.to));
  }
}

// Tactical bot takes a free hanging queen when playing its best move.
// (Constant rng > 0.15 disables the occasional random/playful branch.)
{
  const fen = "4k3/8/8/3q4/4P3/8/8/4K3 w - - 0 1"; // exd5 wins the queen
  const mv = chooseBotMove(fen, "tactical", () => 0.5);
  ok("tactical grabs the hanging queen (exd5)", Boolean(mv && mv.from === "e4" && mv.to === "d5"));
}

// Side selection (color choice).
ok("resolveSide white", resolveSide("w") === "w");
ok("resolveSide black", resolveSide("b") === "b");
ok("resolveSide random → white (rng<0.5)", resolveSide("random", () => 0.2) === "w");
ok("resolveSide random → black (rng>=0.5)", resolveSide("random", () => 0.8) === "b");

// When the user is Black, the bot opens as White: a legal first move exists.
{
  const start = new Chess().fen();
  const opening = chooseBotMove(start, "random");
  const legalOpenings = new Chess().moves({ verbose: true });
  ok(
    "bot makes a legal first move as White",
    Boolean(opening && legalOpenings.some((m) => m.from === opening.from && m.to === opening.to)),
  );
}

// ---- Match replay reconstruction ----
{
  // Build a short game and replay it from its SAN list.
  const g = new Chess();
  const sans = ["e4", "e5", "Nf3", "Nc6", "Bb5"];
  for (const s of sans) g.move(s);
  const finalFen = g.fen();

  const frames = buildReplay({ sans });
  ok("replay frames = moves + 1", frames !== null && frames.length === sans.length + 1);
  ok("replay frame 0 is the start position", frames !== null && frames[0].fen === new Chess().fen());
  ok("replay last frame matches final position", frames !== null && frames[frames.length - 1].fen === finalFen);

  // Every frame is a legal/loadable position.
  let allLoad = true;
  for (const f of frames ?? []) {
    try {
      new Chess(f.fen);
    } catch {
      allLoad = false;
    }
  }
  ok("every replay frame is a valid position", allLoad);

  // PGN fallback yields the same number of frames.
  const fromPgn = buildReplay({ pgn: g.pgn() });
  ok("replay from PGN works", fromPgn !== null && fromPgn.length === sans.length + 1);

  // Coach comment for a capture/check exists and is non-empty (no engine claims).
  const checkmate = buildReplay({ sans: ["f3", "e5", "g4", "Qh4#"] });
  ok("mate frame gets a finishing comment", Boolean(checkmate && coachComment(checkmate[checkmate.length - 1]).text.length > 0));
}

// Old/empty matches are handled safely (no crash, returns null).
ok("empty input → null", buildReplay({}) === null);
ok("empty sans → null", buildReplay({ sans: [] }) === null);
ok("bad pgn → null", buildReplay({ pgn: "not a real pgn @@@" }) === null);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All bot checks passed");
