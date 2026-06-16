import type { ShopItem } from "@/content/shop";

/**
 * Cosmetic player titles shown on the profile card. "none" is the free default
 * (the card falls back to the rank/piece title). Premium titles are bought in
 * the Shop (owned set) and equipped via lib/playerTitle.
 */
export interface TitleDef {
  id: string;
  label: string;
  price: number;
}

export const TITLES: TitleDef[] = [
  { id: "none", label: "—", price: 0 },
  { id: "strategist", label: "The Strategist", price: 80 },
  { id: "gambiteer", label: "Gambiteer", price: 120 },
  { id: "endgame-wizard", label: "Endgame Wizard", price: 160 },
  { id: "coffee-shark", label: "Coffeehouse Shark", price: 200 },
  { id: "grand-tactician", label: "Grand Tactician", price: 250 },
];

export function titleItemId(id: string): string {
  return `title-${id}`;
}

export function titleLabel(id: string): string {
  return TITLES.find((t) => t.id === id)?.label ?? "—";
}

export const TITLE_ITEMS: ShopItem[] = TITLES.filter((t) => t.price > 0).map((t) => ({
  id: titleItemId(t.id),
  kind: "title",
  refId: t.id,
  label: t.label,
  price: t.price,
}));
