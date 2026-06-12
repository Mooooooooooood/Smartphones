# The Rang — Manual QA Checklist

Run through this on a real iPhone (Safari) and in desktop Chrome devtools at
**390px** and **430px** widths. Tick each item before a release.

## First launch / onboarding
- [ ] Fresh profile (clear site data) → onboarding overlay appears once.
- [ ] Onboarding is 4 short slides, **Skip ✕** works from any slide.
- [ ] **Start Adventure** dismisses it and it does **not** reappear on reload.
- [ ] A new player understands the loop (Academy → Puzzles → Play → rewards) in <30s.

## Core loop
- [ ] Academy world map renders; tier pager (‹ ›) swaps Tier 0 / Tier 1.
- [ ] Complete one lesson → interactive board works → reward panel shows XP.
- [ ] Solve one puzzle → success panel + XP; wrong move shows a clear retry cue.
- [ ] Play one match vs a guide → board legal, recap shows XP / rating / moves.
- [ ] Review a finished match from Profile → board steps through moves.
- [ ] Beat the rival **Vex** card appears in Play.

## Rewards & daily
- [ ] XP bar visibly moves after earning XP.
- [ ] Daily Quest shows per-quest done state + a status line.
- [ ] Chest is **ready** only when all quests done; **claimed** chest is not tappable.
- [ ] Claiming the chest plays the reward moment; message says "claimed".
- [ ] Re-opening a completed lesson shows "already completed" (no double XP).
- [ ] Mid-path Academy treasure + boss trial give clear rewards.

## Settings (top-right gear)
- [ ] Gear opens the settings panel on every screen.
- [ ] Sound FX toggle (off by default) — turning on plays a test blip.
- [ ] Haptics toggle (shows "n/a" where unsupported, e.g. iOS).
- [ ] Theme light/dark/auto switches live.
- [ ] Player colour swatches re-tint the hero/avatar.
- [ ] Export downloads a backup JSON; Import restores it; bad file shows a clear error.
- [ ] Reset is a **two-tap** confirm (no browser popup); cancel works.
- [ ] About + version shown.

## Empty / error states
- [ ] No match history → friendly "play a match" message (no blank).
- [ ] Old replay without data → "Replay unavailable" panel.
- [ ] Offline (airplane mode) → /offline panel, app still launches from home screen.
- [ ] Locked Tier 1 → clear gated overlay.

## iPhone layout
- [ ] No horizontal overflow on any screen at 390 / 430.
- [ ] Safe-area top (notch) and bottom (home indicator) respected.
- [ ] Bottom nav not clipped; active tab bounces subtly.
- [ ] Chessboards fit the width; pieces readable.
- [ ] Dark mode readable; no critical text too tiny.

## PWA
- [ ] `npm run build` succeeds; service worker registers.
- [ ] Add to Home Screen works; launches standalone; offline shell loads.

## Motion / accessibility
- [ ] `prefers-reduced-motion` disables looping animations.
- [ ] Buttons have a press animation and are easy to tap (≥44px targets).
