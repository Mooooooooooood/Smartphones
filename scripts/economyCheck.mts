/**
 * Sprint 18 checks — coin shop pricing/purchase logic, board skins, the daily
 * puzzle, and piece titles. Run: npx tsx scripts/economyCheck.mts
 */
import { SHOP_ITEMS, canBuy, shopItemId } from "../src/content/shop.ts";
import { BOARD_SKINS } from "../src/lib/boardSkin.ts";
import { dailyPuzzleId } from "../src/domain/training/dailyPuzzle.ts";
import { PIECE_UNLOCKS, pieceTitle } from "../src/content/pieceUnlocks.ts";
import { BEGINNER_PUZZLES } from "../src/content/puzzles/beginner.ts";

let pass = 0;
let fail = 0;
function ok(name: string, cond: boolean) {
  if (cond) pass++;
  else { fail++; console.error("✗", name); }
}

// ---- Board skins ----
ok("classic skin is free", BOARD_SKINS.find((s) => s.id === "classic")?.price === 0);
ok("non-classic skins cost coins", BOARD_SKINS.filter((s) => s.id !== "classic").every((s) => s.price > 0));
ok("every skin has light+dark colours", BOARD_SKINS.every((s) => /^#|rgb/.test(s.light) && /^#|rgb/.test(s.dark)));

// ---- Shop ----
ok("shop excludes the free classic", SHOP_ITEMS.every((i) => i.refId !== "classic"));
ok("shop items map to a real skin + positive price", SHOP_ITEMS.every((i) => i.price > 0 && BOARD_SKINS.some((s) => s.id === i.refId)));
ok("shop item ids use the board- prefix", SHOP_ITEMS.every((i) => i.id === shopItemId(i.refId)));

const item = SHOP_ITEMS[0];
ok("canBuy true with enough coins, not owned", canBuy(item.price, {}, item) === true);
ok("canBuy false when short on coins", canBuy(item.price - 1, {}, item) === false);
ok("canBuy false when already owned", canBuy(item.price + 999, { [item.id]: true }, item) === false);

// ---- Daily puzzle ----
ok("daily puzzle is deterministic per date", dailyPuzzleId("2026-06-13") === dailyPuzzleId("2026-06-13"));
ok("daily puzzle id is a real puzzle", BEGINNER_PUZZLES.some((p) => p.id === dailyPuzzleId("2026-06-13")));
ok(
  "daily puzzle varies across the week",
  new Set(["2026-06-10", "2026-06-11", "2026-06-12", "2026-06-13", "2026-06-14", "2026-06-15", "2026-06-16"].map((d) => dailyPuzzleId(d))).size >= 2,
);

// ---- Piece titles ----
ok("all six pieces have a title", PIECE_UNLOCKS.every((p) => p.title.length > 0 && p.tagline.length > 0));
ok("pawn title is Recruit", pieceTitle("pawn") === "Recruit");
ok("king title is Grandmaster", pieceTitle("king") === "Grandmaster");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log("✓ All economy checks passed");
