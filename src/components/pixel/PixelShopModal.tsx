"use client";

import { useState } from "react";
import { useProfileStore } from "@/state/profileStore";
import { SHOP_ITEMS, COLOR_ITEMS, CONSUMABLE_ITEMS, type ShopKind } from "@/content/shop";
import { TITLE_ITEMS } from "@/content/titles";
import { BOARD_SKINS, useBoardSkinId, setBoardSkinId } from "@/lib/boardSkin";
import { PLAYER_COLORS, usePlayerColor, setPlayerColor, type PlayerColorId } from "@/lib/playerColor";
import { usePlayerTitle, setPlayerTitle } from "@/lib/playerTitle";
import { CoinIcon } from "@/components/pixel/PixelIcon";
import { fx } from "@/lib/feedback";

const TABS: { kind: ShopKind; label: string }[] = [
  { kind: "board", label: "Boards" },
  { kind: "color", label: "Colors" },
  { kind: "consumable", label: "Items" },
  { kind: "title", label: "Titles" },
];

/** Mini board-skin swatch preview. */
function Swatch({ light, dark }: { light: string; dark: string }) {
  return (
    <span className="grid h-7 w-7 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-[4px] border-2 border-[var(--px-edge)]">
      <span style={{ background: light }} /><span style={{ background: dark }} />
      <span style={{ background: dark }} /><span style={{ background: light }} />
    </span>
  );
}

/** The coin shop — buy + equip cosmetics across categories. */
export default function PixelShopModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const coins = useProfileStore((s) => s.coins);
  const owned = useProfileStore((s) => s.owned);
  const buyItem = useProfileStore((s) => s.buyItem);
  const buyConsumable = useProfileStore((s) => s.buyConsumable);
  const consumables = useProfileStore((s) => s.consumables);
  const equippedSkin = useBoardSkinId();
  const equippedColor = usePlayerColor();
  const equippedTitle = usePlayerTitle();
  const [tab, setTab] = useState<ShopKind>("board");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-[rgba(4,6,20,0.72)] p-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-md space-y-2.5 pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="px-panel flex items-center justify-between px-3 py-2.5">
          <span className="px-title text-[0.95rem] text-brass">Shop</span>
          <span className="flex items-center gap-2">
            <span className="px-inset flex items-center gap-1 px-2 py-1"><CoinIcon size={13} /><span className="font-display text-[0.62rem] text-cream">{coins}</span></span>
            <button type="button" onClick={onClose} className="px-inset flex h-8 w-8 items-center justify-center text-muted2 active:translate-y-0.5" aria-label="Close">✕</button>
          </span>
        </div>

        {/* category tabs */}
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <button key={t.kind} type="button" onClick={() => { fx.tap(); setTab(t.kind); }}
              className={`px-label flex-1 rounded-[5px] border-2 px-2 py-1.5 text-[0.5rem] ${tab === t.kind ? "border-brass bg-[var(--color-ink)] text-brass" : "border-[var(--px-edge)] bg-panel text-muted2"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "board" ? (
          <div className="px-panel px-3 py-3">
            <p className="px-label text-[0.56rem] text-brass">Board Skins</p>
            <p className="mt-0.5 text-[0.6rem] text-muted2">Earn coins by playing. Tap to buy, then equip.</p>
            <ul className="mt-2 space-y-1.5">
              <SkinRow refId="classic" label="Classic Board" price={0} owned equipped={equippedSkin === "classic"} onEquip={() => { fx.tap(); setBoardSkinId("classic"); }} />
              {SHOP_ITEMS.map((item) => (
                <SkinRow
                  key={item.id}
                  refId={item.refId}
                  label={item.label}
                  price={item.price}
                  owned={Boolean(owned[item.id])}
                  equipped={equippedSkin === item.refId}
                  afford={coins >= item.price}
                  onBuy={async () => { const ok = await buyItem(item.id, item.price); if (ok) { fx.chest(); setBoardSkinId(item.refId); } }}
                  onEquip={() => { fx.tap(); setBoardSkinId(item.refId); }}
                />
              ))}
            </ul>
          </div>
        ) : null}

        {tab === "color" ? (
          <div className="px-panel px-3 py-3">
            <p className="px-label text-[0.56rem] text-brass">Avatar Tints</p>
            <p className="mt-0.5 text-[0.6rem] text-muted2">Premium colours for your hero. Free colours live in Settings.</p>
            <ul className="mt-2 space-y-1.5">
              {COLOR_ITEMS.map((item) => {
                const def = PLAYER_COLORS.find((c) => c.id === item.refId);
                return (
                  <ColorRow
                    key={item.id}
                    label={item.label}
                    price={item.price}
                    swatch={def?.swatch ?? "#fff"}
                    rarity={def?.rarity}
                    owned={Boolean(owned[item.id])}
                    equipped={equippedColor === item.refId}
                    afford={coins >= item.price}
                    onBuy={async () => { const ok = await buyItem(item.id, item.price); if (ok) { fx.chest(); setPlayerColor(item.refId as PlayerColorId); } }}
                    onEquip={() => { fx.tap(); setPlayerColor(item.refId as PlayerColorId); }}
                  />
                );
              })}
            </ul>
          </div>
        ) : null}

        {tab === "consumable" ? (
          <div className="px-panel px-3 py-3">
            <p className="px-label text-[0.56rem] text-brass">Items</p>
            <p className="mt-0.5 text-[0.6rem] text-muted2">Helpful boosts. Buy as many as you like.</p>
            <ul className="mt-2 space-y-1.5">
              {CONSUMABLE_ITEMS.map((item) => (
                <li key={item.id} className="px-inset flex items-center gap-2.5 px-2.5 py-2">
                  <span className="px-inset flex h-7 w-7 shrink-0 items-center justify-center text-[0.8rem]" aria-hidden>{item.refId === "hint" ? "💡" : item.refId === "skip" ? "⏭" : "❄"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="px-label block truncate text-[0.6rem] text-cream">{item.label}</span>
                    <span className="block truncate text-[0.48rem] text-muted2">{item.desc}</span>
                  </span>
                  <span className="px-label shrink-0 text-[0.5rem] text-muted2">×{consumables[item.id] ?? 0}</span>
                  <button type="button" disabled={coins < item.price}
                    onClick={async () => { const ok = await buyConsumable(item.id, item.price, item.grant ?? 1); if (ok) fx.chest(); }}
                    className={`px-label flex shrink-0 items-center gap-1 rounded-[5px] border-2 border-[var(--px-edge)] px-2 py-1 text-[0.52rem] active:translate-y-0.5 ${coins >= item.price ? "bg-brass text-[color:var(--color-on-accent)]" : "bg-[var(--color-ink)] text-muted2 opacity-60"}`}>
                    <CoinIcon size={11} />{item.price}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === "title" ? (
          <div className="px-panel px-3 py-3">
            <p className="px-label text-[0.56rem] text-brass">Titles</p>
            <p className="mt-0.5 text-[0.6rem] text-muted2">Flair shown on your profile card.</p>
            <ul className="mt-2 space-y-1.5">
              {TITLE_ITEMS.map((item) => (
                <li key={item.id} className="px-inset flex items-center gap-2.5 px-2.5 py-2">
                  <span className="text-[0.8rem]" aria-hidden>🎖</span>
                  <span className="min-w-0 flex-1 px-label truncate text-[0.6rem] text-cream">“{item.label}”</span>
                  <BuyState
                    price={item.price}
                    owned={Boolean(owned[item.id])}
                    equipped={equippedTitle === item.refId}
                    afford={coins >= item.price}
                    onBuy={async () => { const ok = await buyItem(item.id, item.price); if (ok) { fx.chest(); setPlayerTitle(item.refId); } }}
                    onEquip={() => { fx.tap(); setPlayerTitle(item.refId); }}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Small colour-coded rarity tag (Epic / Legendary). */
function RarityBadge({ rarity }: { rarity?: "epic" | "legendary" }) {
  if (!rarity) return null;
  const legendary = rarity === "legendary";
  return (
    <span
      className="px-label shrink-0 rounded-[4px] border-2 border-[var(--px-edge)] px-1.5 py-0.5 text-[0.4rem]"
      style={{
        background: legendary ? "var(--color-brass)" : "var(--color-lav)",
        color: legendary ? "var(--color-on-accent)" : "var(--color-on-purple)",
      }}
    >
      {legendary ? "LEGENDARY" : "EPIC"}
    </span>
  );
}

/** Owned/equip/buy action cluster shared by the cosmetic rows. */
function BuyState({ price, owned, equipped, afford = true, onBuy, onEquip }: {
  price: number; owned: boolean; equipped: boolean; afford?: boolean; onBuy?: () => void; onEquip?: () => void;
}) {
  if (owned) {
    return equipped ? (
      <span className="px-label rounded-[5px] border-2 border-[var(--px-edge)] bg-good px-2 py-1 text-[0.52rem] text-[color:var(--color-on-good)]">Equipped</span>
    ) : (
      <button type="button" onClick={onEquip} className="px-label rounded-[5px] border-2 border-[var(--px-edge)] bg-[var(--color-sky)] px-2 py-1 text-[0.52rem] text-[color:var(--color-on-blue)] active:translate-y-0.5">Equip</button>
    );
  }
  return (
    <button type="button" onClick={onBuy} disabled={!afford} className={`px-label flex items-center gap-1 rounded-[5px] border-2 border-[var(--px-edge)] px-2 py-1 text-[0.52rem] active:translate-y-0.5 ${afford ? "bg-brass text-[color:var(--color-on-accent)]" : "bg-[var(--color-ink)] text-muted2 opacity-60"}`}>
      <CoinIcon size={11} />{price}
    </button>
  );
}

function SkinRow({ refId, label, price, owned, equipped, afford = true, onBuy, onEquip }: {
  refId: string; label: string; price: number; owned: boolean; equipped: boolean; afford?: boolean; onBuy?: () => void; onEquip?: () => void;
}) {
  const skin = BOARD_SKINS.find((s) => s.id === refId);
  return (
    <li className="px-inset flex items-center gap-2 px-2.5 py-2">
      {skin ? <Swatch light={skin.light} dark={skin.dark} /> : null}
      <span className="min-w-0 flex-1 px-label truncate text-[0.6rem] text-cream">{label}</span>
      <RarityBadge rarity={skin?.rarity} />
      <BuyState price={price} owned={owned} equipped={equipped} afford={afford} onBuy={onBuy} onEquip={onEquip} />
    </li>
  );
}

function ColorRow({ label, price, swatch, rarity, owned, equipped, afford = true, onBuy, onEquip }: {
  label: string; price: number; swatch: string; rarity?: "epic" | "legendary"; owned: boolean; equipped: boolean; afford?: boolean; onBuy?: () => void; onEquip?: () => void;
}) {
  return (
    <li className="px-inset flex items-center gap-2 px-2.5 py-2">
      <span className="h-7 w-7 shrink-0 rounded-[5px] border-2 border-[var(--px-edge)]" style={{ background: swatch, boxShadow: "0 0 0 2px var(--px-edge)" }} />
      <span className="min-w-0 flex-1 px-label truncate text-[0.6rem] text-cream">{label}</span>
      <RarityBadge rarity={rarity} />
      <BuyState price={price} owned={owned} equipped={equipped} afford={afford} onBuy={onBuy} onEquip={onEquip} />
    </li>
  );
}
