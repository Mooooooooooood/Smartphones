"use client";

import { useEffect } from "react";
import { useMusicOn, playMusic, pauseMusic } from "@/lib/music";

/**
 * Invisible controller that starts/stops the ambient music as the setting
 * toggles. When music is on but autoplay is blocked (no gesture yet), it retries
 * playback on the first user gesture. Volume changes apply live via setMusicVolume.
 */
export default function MusicPlayer() {
  const on = useMusicOn();

  useEffect(() => {
    if (!on) {
      pauseMusic();
      return;
    }
    playMusic();
    const start = () => playMusic();
    window.addEventListener("pointerdown", start, { once: true, passive: true });
    window.addEventListener("touchstart", start, { once: true, passive: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("keydown", start);
    };
  }, [on]);

  return null;
}
