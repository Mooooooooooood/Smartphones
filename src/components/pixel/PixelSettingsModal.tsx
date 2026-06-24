"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PixelButton from "@/components/pixel/PixelButton";
import { GearGlyph } from "@/components/pixel/PixelIcon";
import { exportAll, importAll, resetAll } from "@/data/backup";
import { APP_VERSION } from "@/lib/version";
import { PLAYER_COLORS, getPlayerColor, setPlayerColor, isColorOwned, type PlayerColorId } from "@/lib/playerColor";
import { useProfileStore } from "@/state/profileStore";
import { useSoundOn, setSoundOn, playSfx, useVolume, setVolume, prime } from "@/lib/sound";
import { useMusicOn, setMusicOn, useMusicVolume, setMusicVolume } from "@/lib/music";
import { useHapticsOn, setHapticsOn, hapticsSupported, vibrate } from "@/lib/haptics";

type Status = { kind: "ok" | "err"; msg: string } | null;

function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="px-inset flex w-full items-center justify-between px-2.5 py-2 active:translate-y-0.5">
      <span className="px-label text-[0.56rem] text-cream">{label}</span>
      <span className="flex items-center gap-1.5">
        {hint ? <span className="text-[0.5rem] text-muted2">{hint}</span> : null}
        <span className={`flex h-5 w-9 items-center rounded-[5px] border-2 border-[var(--px-edge)] px-0.5 ${on ? "bg-good justify-end" : "bg-[var(--color-ink)] justify-start"}`}>
          <span className="h-3.5 w-3.5 rounded-[3px] bg-cream" />
        </span>
      </span>
    </button>
  );
}
const stamp = () => new Date().toISOString().slice(0, 10);

/** Game-native settings panel opened from the top-right gear. */
export default function PixelSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [color, setColorState] = useState<PlayerColorId>(getPlayerColor);
  const owned = useProfileStore((s) => s.owned);
  const soundOn = useSoundOn();
  const hapticsOn = useHapticsOn();
  const volume = useVolume();
  const musicOn = useMusicOn();
  const musicVolume = useMusicVolume();
  const [resetArmed, setResetArmed] = useState(false);

  if (!open) return null;

  async function handleExport() {
    setStatus(null); setBusy(true);
    try {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `the-rang-backup-${stamp()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setStatus({ kind: "ok", msg: "Backup saved to your device." });
    } catch { setStatus({ kind: "err", msg: "Couldn't create a backup." }); }
    finally { setBusy(false); }
  }

  async function handleImportFile(file: File) {
    setStatus(null);
    let parsed: unknown;
    try { parsed = JSON.parse(await file.text()); }
    catch { setStatus({ kind: "err", msg: "That file isn't valid JSON." }); return; }
    if (!window.confirm("Importing replaces all progress on this device. Continue?")) return;
    setBusy(true);
    try {
      await importAll(parsed);
      setStatus({ kind: "ok", msg: "Progress imported! Refreshing…" });
      setTimeout(() => location.reload(), 600);
    } catch (e) {
      setBusy(false);
      setStatus({ kind: "err", msg: e instanceof Error ? e.message : "Import failed." });
    }
  }

  async function handleReset() {
    if (!resetArmed) {
      setResetArmed(true);
      return;
    }
    setResetArmed(false);
    setBusy(true); setStatus(null);
    try {
      await resetAll();
      setStatus({ kind: "ok", msg: "Progress cleared. Refreshing…" });
      setTimeout(() => location.reload(), 600);
    } catch { setBusy(false); setStatus({ kind: "err", msg: "Reset failed." }); }
  }

  function pickColor(id: PlayerColorId) {
    setPlayerColor(id);
    setColorState(id);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[rgba(4,6,20,0.7)] p-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-md space-y-2.5 pb-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-panel flex items-center justify-between px-3 py-2.5">
          <span className="flex items-center gap-2 text-brass"><GearGlyph size={18} /><span className="px-title text-[0.95rem]">Settings</span></span>
          <button type="button" onClick={onClose} className="px-inset flex h-8 w-8 items-center justify-center text-muted2 active:translate-y-0.5" aria-label="Close">✕</button>
        </div>

        {/* Appearance */}
        <div className="px-panel flex flex-col items-center gap-2 px-3 py-3">
          <p className="px-label text-[0.5rem] text-brass">Appearance</p>
          <p className="text-[0.6rem] text-muted">Day arcade or night arcade.</p>
          <ThemeToggle />
        </div>

        {/* Sound & Haptics */}
        <div className="px-panel space-y-2 px-3 py-3">
          <div className="flex items-center justify-between">
            <p className="px-label text-[0.56rem] text-brass">Sound &amp; Haptics</p>
            <button type="button" onClick={() => { prime(); setSoundOn(true); playSfx("chest"); }} className="px-label rounded-[5px] border-2 border-[var(--px-edge)] bg-brass px-2 py-1 text-[0.5rem] text-[color:var(--color-on-accent)] active:translate-y-0.5">🔊 Test</button>
          </div>
          <Toggle on={soundOn} label="Sound FX" onChange={(v) => { setSoundOn(v); if (v) playSfx("correct"); }} />
          {/* Volume slider */}
          <div className="px-inset flex items-center gap-2 px-2.5 py-2">
            <span className="px-label text-[0.56rem] text-cream">Volume</span>
            <input
              type="range" min={0} max={100} value={Math.round(volume * 100)}
              onChange={(e) => { const v = Number(e.target.value) / 100; setVolume(v); }}
              onMouseUp={() => playSfx("tap")} onTouchEnd={() => playSfx("tap")}
              disabled={!soundOn}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-[3px] bg-[var(--color-ink)] disabled:opacity-40"
              style={{ accentColor: "var(--color-brass)" }}
              aria-label="Volume"
            />
            <span className="px-label w-7 text-right text-[0.5rem] text-muted2">{Math.round(volume * 100)}</span>
          </div>
          <Toggle
            on={hapticsOn}
            label="Haptics"
            hint={hapticsSupported() ? undefined : "n/a"}
            onChange={(v) => { setHapticsOn(v); if (v) vibrate("correct"); }}
          />
          {/* Ambient music */}
          <Toggle on={musicOn} label="Music" onChange={(v) => setMusicOn(v)} />
          <div className="px-inset flex items-center gap-2 px-2.5 py-2">
            <span className="px-label text-[0.56rem] text-cream">Music Vol</span>
            <input
              type="range" min={0} max={100} value={Math.round(musicVolume * 100)}
              onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
              disabled={!musicOn}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-[3px] bg-[var(--color-ink)] disabled:opacity-40"
              style={{ accentColor: "var(--color-brass)" }}
              aria-label="Music volume"
            />
            <span className="px-label w-7 text-right text-[0.5rem] text-muted2">{Math.round(musicVolume * 100)}</span>
          </div>
        </div>

        {/* Player colour */}
        <div className="px-panel px-3 py-3">
          <p className="px-label text-[0.5rem] text-brass">Your Colour</p>
          <p className="mt-0.5 text-[0.6rem] text-muted2">Tint your hero avatar.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PLAYER_COLORS.filter((c) => isColorOwned(c.id, owned)).map((c) => (
              <button key={c.id} type="button" onClick={() => pickColor(c.id)} aria-label={c.label}
                className={`h-8 w-8 rounded-[6px] border-[3px] ${color === c.id ? "border-cream" : "border-[var(--px-edge)]"}`}
                style={{ background: c.swatch, boxShadow: "0 0 0 2px var(--px-edge)" }} />
            ))}
          </div>
        </div>

        {/* Install */}
        <div className="px-panel space-y-1.5 px-3 py-3">
          <p className="px-label text-[0.5rem] text-brass">Add Pawnquest to your iPhone</p>
          <ol className="space-y-0.5 text-[0.6rem] leading-relaxed text-muted">
            <li>1. Open Pawnquest in <span className="text-cream">Safari</span>.</li>
            <li>2. Tap <span className="text-cream">Share</span> (square with an arrow).</li>
            <li>3. Choose <span className="text-cream">Add to Home Screen</span>.</li>
            <li>4. Tap <span className="text-cream">Add</span> — it opens like an app.</li>
          </ol>
        </div>

        {/* Backup */}
        <div className="px-panel space-y-2 px-3 py-3">
          <p className="px-label text-[0.5rem] text-brass">Backup &amp; Restore</p>
          <div className="grid grid-cols-2 gap-2">
            <PixelButton onClick={handleExport} disabled={busy} variant="secondary" size="sm">Export</PixelButton>
            <PixelButton onClick={() => fileRef.current?.click()} disabled={busy} variant="secondary" size="sm">Import</PixelButton>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void handleImportFile(f); }} />
          <PixelButton onClick={handleReset} disabled={busy} tone="red" size="sm">{resetArmed ? "⚠ Tap again to erase everything" : "Reset all progress"}</PixelButton>
          {resetArmed ? <button type="button" onClick={() => setResetArmed(false)} className="px-label w-full text-center text-[0.5rem] text-muted2">cancel</button> : null}
          {status ? <p role="status" className={`text-center text-[0.6rem] ${status.kind === "ok" ? "text-good" : "text-bad"}`}>{status.msg}</p> : null}
        </div>

        {/* About */}
        <div className="px-panel space-y-1 px-3 py-3">
          <p className="px-label text-[0.5rem] text-brass">About</p>
          <p className="text-[0.6rem] leading-relaxed text-muted">Pawnquest is a retro pixel-art chess adventure — learn the moves, solve puzzles, and battle the guide cast. Progress is saved privately on your device.</p>
          <div className="flex items-center justify-between pt-0.5 text-[0.56rem] text-muted2">
            <span>Version {APP_VERSION}</span>
            <Link href="/" onClick={onClose} className="text-brass">Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
