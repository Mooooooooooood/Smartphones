"use client";

import { useEffect } from "react";
import ChessBuddy, { type BuddyPiece } from "@/components/characters/ChessBuddy";
import PixelButton from "@/components/pixel/PixelButton";
import { fx } from "@/lib/feedback";

/** Celebration when a new avatar piece is unlocked. */
export default function PieceUnlockModal({
  piece, title, onEquip, onClose,
}: {
  piece: BuddyPiece; title: string; onEquip: () => void; onClose: () => void;
}) {
  useEffect(() => { fx.chest(); }, []);
  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-[rgba(4,6,20,0.82)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[300px]">
        <div className="px-card tab-glow-reward tab-animate-pop px-4 py-5 text-center" style={{ "--hue": "var(--color-brass)", "--hue-deep": "var(--color-brassdeep)" } as React.CSSProperties}>
          <p className="px-label text-[0.56rem] text-brass">★ New Piece Unlocked ★</p>
          <div className="px-inset tab-bob mx-auto mt-3 flex h-20 w-20 items-center justify-center">
            <ChessBuddy piece={piece} size={60} />
          </div>
          <h3 className="px-title mt-3 text-[1rem] text-cream">The {title}</h3>
          <p className="mt-1.5 text-[0.66rem] text-muted">A mightier avatar has joined your ranks!</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <PixelButton onClick={onClose} variant="secondary" size="sm">Later</PixelButton>
            <PixelButton onClick={onEquip} tone="gold" size="sm">Equip ›</PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
