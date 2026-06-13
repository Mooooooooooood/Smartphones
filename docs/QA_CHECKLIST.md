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

## Tier 1 content (Sprint 16)
- [ ] Academy → swipe to Tier 1; **Hanging Pieces** and **Forks** run as
      interactive mini-games (intro → demo → make-move → checkpoint → reward).
- [ ] The make-move steps accept only the correct capture/fork.
- [ ] Other Tier 1 lessons still work (legacy read + quiz).

## Tier 1 Boss Trial (Sprint 16)
- [ ] Final Trial on the Tier 1 map links to `/academy/boss/tier-1`.
- [ ] Trial unlocks only after the Tier 1 lessons are complete.
- [ ] 5 questions, pass threshold 4/5.
- [ ] Passing awards XP **once** (re-entering shows "cleared", no extra XP).
- [ ] Pass screen says "Next world coming soon" (no fake Tier 2 link).
- [ ] Strong chest/reward feedback on pass.

## Achievements (Sprint 16)
- [ ] Tapping a badge opens the detail modal.
- [ ] Modal shows art, name, locked/unlocked, description, and a progress bar.
- [ ] Locked copy is specific ("Solve 10 puzzles", "Pass your first Boss Trial").
- [ ] Unlocked badges show a celebratory state.

## Daily streak calendar (Sprint 16)
- [ ] Profile shows a 14-day pixel calendar.
- [ ] Active days are lit; today is ringed.
- [ ] Streak count matches the lit run; "play to keep it" copy when today isn't done.

## Performance (Sprint 16)
- [ ] Board scrolls/drag stays smooth on iPhone (pixel pieces use merged rects).
- [ ] Academy map paging is smooth; no jank tapping nodes.
- [ ] No console errors; bundle still builds.

## Visual regression baseline (Sprint 16)
- [ ] `npm run build` then `npm run baseline` writes `visual-audit/baseline/*.png`.
- [ ] The baseline command starts its own server on a fresh port and **kills it**;
      it never loops on a CSS/chunk error and hard-times-out cleanly.

## Player identity & pieces (Sprint 17)
- [ ] Fresh launch: onboarding "Create Your Hero" slide sets a name + white/black; you start as a Pawn.
- [ ] Skip → defaults to "Player", white, pawn.
- [ ] Profile shows your chosen piece as the avatar; tapping the name (✎) edits it.
- [ ] Profile "Your Pieces": pawn equipped ("Wearing"); locked pieces show 🔒 and, on tap, the unlock condition.
- [ ] Unlock a piece (e.g. solve 3 puzzles → Knight) then select it; the avatar updates on Home + Profile.
- [ ] Name/piece/colour persist across reloads.

## Sound (Sprint 17)
- [ ] Sound is ON by default and **audible** after the first tap (volume defaults to 40, not 0).
- [ ] Settings → Volume slider changes loudness live; 0 = silent.
- [ ] iOS: first tap unlocks audio; later sounds play.

## Readability (Sprint 17)
- [ ] Bottom-nav labels, streak day labels, Academy tier labels are readable at 390/430.
- [ ] No 0.36–0.46rem Press Start 2P text remains in core screens.

## Academy map (Sprint 17)
- [ ] Map has sky→grass gradient, a distant castle, clouds, bushes/rocks/flowers/mushrooms.
- [ ] Map is taller (vertical scroll is fine); nodes 1–8, trial, treasure all reachable.

## Pieces, retry, puzzle popup (Sprint 17)
- [ ] Chessboards across the app show the detailed Staunton pieces (clear king cross, rook battlements, etc.).
- [ ] Lesson wrong answer shows a **Retry** button; board Retry restores the start position.
- [ ] Puzzle solve shows a **centered** popup; it auto-advances after ~5s, or tap "Next puzzle".
