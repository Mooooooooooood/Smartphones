import { BOARD_SKINS } from "@/lib/boardSkin";

/**
 * Shop catalogue — cosmetics bought with coins. Board skins are the headline
 * items (derived from BOARD_SKINS; the free "classic" is excluded). Ownership
 * is tracked in profileStore.owned keyed by the item id; equipping a board item
 * calls setBoardSkinId(refId).
 */
export type ShopKind = "board";

export interface ShopItem {
  id: string;
  kind: ShopKind;
  /** The underlying skin/cosmetic id this item grants. */
  refId: string;
  label: string;
  price: number;
}

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

/** Pure purchase guard (mirrors the store's buyItem). */
export function canBuy(coins: number, owned: Record<string, true>, item: ShopItem): boolean {
  return !owned[item.id] && coins >= item.price;
}
