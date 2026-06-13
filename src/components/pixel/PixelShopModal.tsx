"use client";

import { useProfileStore } from "@/state/profileStore";
import { SHOP_ITEMS } from "@/content/shop";
import { BOARD_SKINS, useBoardSkinId, setBoardSkinId } from "@/lib/boardSkin";
import { CoinIcon } from "@/components/pixel/PixelIcon";
import { fx } from "@/lib/feedback";

/** Mini board-skin swatch preview. */
function Swatch({ light, dark }: { light: string; dark: string }) {
  return (
    <span className="grid h-7 w-7 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-[4px] border-2 border-[var(--px-edge)]">
      <span style={{ background: light }} /><span style={{ background: dark }} />
      <span style={{ background: dark }} /><span style={{ background: light }} />
    </span>
  );
}

/** The coin shop — buy + equip cosmetic board skins. */
export default function PixelShopModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const coins = useProfileStore((s) => s.coins);
  const owned = useProfileStore((s) => s.owned);
  const buyItem = useProfileStore((s) => s.buyItem);
  const equippedSkin = useBoardSkinId();

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

        <div className="px-panel px-3 py-3">
          <p className="px-label text-[0.56rem] text-brass">Board Skins</p>
          <p className="mt-0.5 text-[0.6rem] text-muted2">Earn coins by playing. Tap to buy, then equip.</p>
          <ul className="mt-2 space-y-1.5">
            {/* Free default first */}
            <SkinRow refId="classic" label="Classic Board" price={0} owned equipped={equippedSkin === "classic"} onEquip={() => { fx.tap(); setBoardSkinId("classic"); }} />
            {SHOP_ITEMS.map((item) => {
              const isOwned = Boolean(owned[item.id]);
              const isEquipped = equippedSkin === item.refId;
              const afford = coins >= item.price;
              return (
                <SkinRow
                  key={item.id}
                  refId={item.refId}
                  label={item.label}
                  price={item.price}
                  owned={isOwned}
                  equipped={isEquipped}
                  afford={afford}
                  onBuy={async () => {
                    const ok = await buyItem(item.id, item.price);
                    if (ok) { fx.chest(); setBoardSkinId(item.refId); }
                  }}
                  onEquip={() => { fx.tap(); setBoardSkinId(item.refId); }}
                />
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SkinRow({
  refId, label, price, owned, equipped, afford = true, onBuy, onEquip,
}: {
  refId: string; label: string; price: number; owned: boolean; equipped: boolean; afford?: boolean;
  onBuy?: () => void; onEquip?: () => void;
}) {
  const skin = BOARD_SKINS.find((s) => s.id === refId);
  return (
    <li className="px-inset flex items-center gap-2.5 px-2.5 py-2">
      {skin ? <Swatch light={skin.light} dark={skin.dark} /> : null}
      <span className="min-w-0 flex-1 px-label truncate text-[0.6rem] text-cream">{label}</span>
      {owned ? (
        equipped ? (
          <span className="px-label rounded-[5px] border-2 border-[var(--px-edge)] bg-good px-2 py-1 text-[0.52rem] text-[color:#06220f]">Equipped</span>
        ) : (
          <button type="button" onClick={onEquip} className="px-label rounded-[5px] border-2 border-[var(--px-edge)] bg-[var(--color-sky)] px-2 py-1 text-[0.52rem] text-[color:#06122e] active:translate-y-0.5">Equip</button>
        )
      ) : (
        <button type="button" onClick={onBuy} disabled={!afford} className={`px-label flex items-center gap-1 rounded-[5px] border-2 border-[var(--px-edge)] px-2 py-1 text-[0.52rem] active:translate-y-0.5 ${afford ? "bg-brass text-[color:var(--color-on-accent)]" : "bg-[var(--color-ink)] text-muted2 opacity-60"}`}>
          <CoinIcon size={11} />{price}
        </button>
      )}
    </li>
  );
}
