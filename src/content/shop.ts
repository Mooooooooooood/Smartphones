import { BOARD_SKINS } from "@/lib/boardSkin";
import { PLAYER_COLORS, colorItemId } from "@/lib/playerColor";

/**
 * Shop catalogue — cosmetics + consumables bought with coins. Categories share
 * one ownership model (profileStore.owned, keyed by item id), except consumables
 * which are count-based (profileStore.consumables). Board skins keep their
 * original `board-` id shape so the economy tests stay stable.
 */
export type ShopKind = "board" | "color" | "consumable" | "title";

export interface ShopItem {
  id: string;
  kind: ShopKind;
  /** The underlying skin/cosmetic id this item grants. */
  refId: string;
  label: string;
  price: number;
  /** Consumables only: how many the purchase grants, and a one-line blurb. */
  grant?: number;
  desc?: string;
}

// --- Board skins (unchanged shape; the economy test asserts this) ---
export const SHOP_ITEMS: ShopItem[] = BOARD_SKINS.filter((s) => s.price > 0).map((s) => ({
  id: `board-${s.id}`,
  kind: "board",
  refId: s.id,
  label: s.label,
  price: s.price,
}));

export function shopItemId(refId: string): string {
  return `board-${refId}`;
}

// --- Premium avatar colours ---
export const COLOR_ITEMS: ShopItem[] = PLAYER_COLORS.filter((c) => c.price > 0).map((c) => ({
  id: colorItemId(c.id),
  kind: "color",
  refId: c.id,
  label: c.label,
  price: c.price,
}));

// --- Consumables (count-based; repeatable; not in the owned set) ---
export const CONSUMABLE_ITEMS: ShopItem[] = [
  { id: "consumable-hint", kind: "consumable", refId: "hint", label: "Hint Tokens", price: 25, grant: 3, desc: "Reveal a puzzle hint. ×3" },
  { id: "consumable-skip", kind: "consumable", refId: "skip", label: "Puzzle Skips", price: 20, grant: 3, desc: "Skip a puzzle without trying. ×3" },
  { id: "consumable-freeze", kind: "consumable", refId: "freeze", label: "Streak Freeze", price: 70, grant: 1, desc: "Protects your streak if you miss a day." },
];

/** Pure purchase guard for owned-set items (mirrors the store's buyItem). */
export function canBuy(coins: number, owned: Record<string, true>, item: ShopItem): boolean {
  return !owned[item.id] && coins >= item.price;
}
