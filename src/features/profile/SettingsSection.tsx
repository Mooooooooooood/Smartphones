"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import GameCard from "@/components/ui/GameCard";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { exportAll, importAll, resetAll } from "@/data/backup";
import { APP_VERSION } from "@/lib/version";

type Status = { kind: "ok" | "err"; msg: string } | null;

function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function SettingsSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleExport() {
    setStatus(null);
    setBusy(true);
    try {
      const data = await exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tabiya-backup-${todayStamp()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus({ kind: "ok", msg: "Backup saved to your device." });
    } catch {
      setStatus({ kind: "err", msg: "Couldn't create a backup. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function handleImportFile(file: File) {
    setStatus(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      setStatus({ kind: "err", msg: "That file isn't valid JSON." });
      return;
    }
    const ok = window.confirm(
      "Importing will replace all progress currently on this device. Continue?",
    );
    if (!ok) return;
    setBusy(true);
    try {
      await importAll(parsed);
      setStatus({ kind: "ok", msg: "Progress imported! Refreshing…" });
      setTimeout(() => location.reload(), 600);
    } catch (e) {
      setBusy(false);
      const msg = e instanceof Error ? e.message : "Import failed.";
      setStatus({ kind: "err", msg });
    }
  }

  async function handleReset() {
    const ok = window.confirm(
      "Reset will erase all local progress on this device. This can't be undone. Continue?",
    );
    if (!ok) return;
    setBusy(true);
    setStatus(null);
    try {
      await resetAll();
      setStatus({ kind: "ok", msg: "Progress cleared. Refreshing…" });
      setTimeout(() => location.reload(), 600);
    } catch {
      setBusy(false);
      setStatus({ kind: "err", msg: "Reset failed. Please try again." });
    }
  }

  return (
    <section className="space-y-2.5">
      <SectionHeader title="Settings" />

      {/* Appearance */}
      <GameCard className="flex flex-col items-center gap-3 p-4">
        <p className="text-xs text-muted">Choose your world: bright day or cozy night.</p>
        <ThemeToggle />
      </GameCard>

      {/* Install to Home Screen */}
      <GameCard className="space-y-2 p-4">
        <h3 className="text-sm font-semibold text-cream">Add Tabiya to your iPhone</h3>
        <ol className="space-y-1 text-[12px] leading-relaxed text-muted">
          <li>1. Open Tabiya in <span className="text-cream">Safari</span>.</li>
          <li>2. Tap the <span className="text-cream">Share</span> button (the square with an arrow).</li>
          <li>3. Choose <span className="text-cream">Add to Home Screen</span>.</li>
          <li>4. Tap <span className="text-cream">Add</span> — Tabiya now opens like an app.</li>
        </ol>
        <p className="text-[11px] text-muted2">
          Works offline after your first visit. Your progress always stays on your device.
        </p>
      </GameCard>

      {/* Backup & restore */}
      <GameCard className="space-y-3 p-4">
        <div>
          <h3 className="text-sm font-semibold text-cream">Backup &amp; restore</h3>
          <p className="mt-0.5 text-[11px] text-muted2">
            Save a copy of your progress, or move it to another device.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={handleExport}
            className="flex min-h-[48px] items-center justify-center rounded-2xl border border-line bg-panel text-sm font-semibold text-cream shadow-[0_3px_0_0_var(--color-line)] active:translate-y-0.5 disabled:opacity-50"
          >
            Export
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[48px] items-center justify-center rounded-2xl border border-line bg-panel text-sm font-semibold text-cream shadow-[0_3px_0_0_var(--color-line)] active:translate-y-0.5 disabled:opacity-50"
          >
            Import
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleImportFile(file);
          }}
        />

        <button
          type="button"
          disabled={busy}
          onClick={handleReset}
          className="flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-bad/40 bg-bad/10 text-sm font-semibold text-bad active:translate-y-0.5 disabled:opacity-50"
        >
          Reset all progress
        </button>

        {status ? (
          <p
            role="status"
            className={`text-center text-[12px] font-medium ${
              status.kind === "ok" ? "text-good" : "text-bad"
            }`}
          >
            {status.msg}
          </p>
        ) : null}
      </GameCard>

      {/* About */}
      <GameCard className="space-y-1.5 p-4">
        <h3 className="text-sm font-semibold text-cream">About Tabiya</h3>
        <p className="text-[12px] leading-relaxed text-muted">
          Tabiya is a friendly, bright chess learning game — learn the moves, solve puzzles, and
          play matches at your own pace. Everything you do is saved privately on your device.
        </p>
        <div className="flex items-center justify-between pt-1 text-[11px] text-muted2">
          <span>Version {APP_VERSION}</span>
          <Link href="/" className="text-brass">
            Home
          </Link>
        </div>
      </GameCard>
    </section>
  );
}
