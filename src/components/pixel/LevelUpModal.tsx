"use client";

import { useEffect } from "react";
import PixelButton from "@/components/pixel/PixelButton";
import { StarIcon } from "@/components/pixel/PixelIcon";
import { fx } from "@/lib/feedback";

/** Celebration when the player reaches a new level. */
export default function LevelUpModal({ level, onClose }: { level: number; onClose: () => void }) {
  useEffect(() => { fx.win(); }, []);
  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-[rgba(4,6,20,0.82)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-[280px]">
        <div className="px-card tab-glow-reward tab-animate-pop px-4 py-5 text-center" style={{ "--hue": "var(--color-brass)", "--hue-deep": "var(--color-brassdeep)" } as React.CSSProperties}>
          <div className="flex justify-center gap-1">
            <StarIcon size={16} /><StarIcon size={20} /><StarIcon size={16} />
          </div>
          <h3 className="px-title mt-2 text-[1.2rem] text-cream">Level Up!</h3>
          <p className="px-label mt-2 text-[0.7rem] text-brass">You reached Level {level}</p>
          <div className="mt-4">
            <PixelButton onClick={onClose} tone="gold">★ Onward ★</PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
