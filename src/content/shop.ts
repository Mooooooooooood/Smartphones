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
}

// --- Board skins (unchanged shape; the economy test asserts this) ---
export const SHOP_ITEMS: ShopItem[] = BOARD_SKINS.filter((s) => s.price > 0).map((s) => ({
  id: `board-${s.id}`,
  kind: "board",
  refId: s.id,
  label: `${s.label} Board`,
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
  label: `${c.label} Tint`,
  price: c.price,
}));

/** Pure purchase guard for owned-set items (mirrors the store's buyItem). */
export function canBuy(coins: number, owned: Record<string, true>, item: ShopItem): boolean {
  return !owned[item.id] && coins >= item.price;
}
