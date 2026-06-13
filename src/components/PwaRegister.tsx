"use client";

import { useEffect } from "react";
import { primeOnFirstGesture } from "@/lib/sound";

/** Registers the offline service worker once, after the page loads. */
export default function PwaRegister() {
  useEffect(() => {
    primeOnFirstGesture();
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
