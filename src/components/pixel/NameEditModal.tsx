"use client";

import { useState } from "react";
import PixelButton from "@/components/pixel/PixelButton";
import { getPlayerName, setPlayerName } from "@/lib/playerIdentity";

/** Tiny modal to set the player's display name. */
export default function NameEditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [value, setValue] = useState(getPlayerName);
  if (!open) return null;

  function save() {
    setPlayerName(value.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-[rgba(4,6,20,0.72)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-[300px]" onClick={(e) => e.stopPropagation()}>
        <div className="px-panel px-4 py-4 text-center">
          <p className="px-label text-[0.62rem] text-brass">Your Name</p>
          <input
            autoFocus
            value={value}
            maxLength={14}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            placeholder="Player"
            aria-label="Player name"
            className="px-inset mt-3 w-full bg-transparent px-3 py-2.5 text-center text-[0.85rem] text-cream outline-none"
            style={{ fontFamily: "var(--font-body)" }}
          />
          <p className="mt-1.5 text-[0.56rem] text-muted2">Up to 14 characters.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <PixelButton onClick={onClose} variant="secondary" size="sm">Cancel</PixelButton>
            <PixelButton onClick={save} tone="green" size="sm">Save</PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
