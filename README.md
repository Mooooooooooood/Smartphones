# Pawnquest — Retro Chess Quest

**Learn chess as a pixel quest.** A cozy retro pixel-art chess adventure for
mobile — an Academy, daily puzzles with Smart Review, and replayable battles
against guide bots. Fully offline, no accounts, no ads. See
[`docs/PRESS.md`](docs/PRESS.md) for the press kit, the in-app `/about` page for
the landing screen, and `marketing/store/` + `public/screenshots/` for store art.

A mobile-first chess learning PWA. Original branding and UI. Built in controlled sprints.

- **Sprint 1** — Foundation & playable board.
- **Sprint 2** — Beginner Academy (Tier 0), XP / level / streak progression, dashboard & profile. ← current

## Requirements
- Node.js 20.9+ and npm
- Network access during `npm run dev` / `npm run build` (fonts are fetched once via `next/font/google`)

## Install & run
```bash
npm install
npm run dev          # → http://localhost:3000
# production:
npm run build
npm start
```

## What works now
- **Play** (Sprint 1): legal moves, drag + tap, highlights, move history, captured pieces, undo, flip, new game, status, IndexedDB-persisted active game.
- **Academy** (`/academy`): Tier 0 roadmap with 8 lessons, sequential unlocking, per-lesson XP, completion checkmarks, star ratings, progress bar.
- **Lesson** (`/academy/[lessonId]`): explanation + key points + a read-only illustrative board (FEN) + a one-question quiz with correct/incorrect feedback. Completion awards XP once and updates the streak; locked lessons are blocked even via direct URL.
- **Dashboard** (`/`): real level + XP-to-next bar, streak, Academy %, Continue-next-lesson, Play, Puzzles placeholder.
- **Profile** (`/profile`): level, XP, streak, lessons completed, Academy %, placeholder skill-rating categories.

## Architecture
```
src/
  domain/
    chess/         pure chess rules over chess.js
    progression/   leveling.ts — XP→level curve + streak math (pure, no React)
  content/academy/ tier0.ts — all lesson data (content lives here, not in UI)
  data/            db.ts (Dexie v2: kv, profile, lessonProgress) + repositories
  state/           gameStore.ts (chess) + profileStore.ts (XP/level/streak/lessons)
  components/      Board, MoveList, CapturedPieces, Controls, BottomNav,
                   ProgressBar, StatTile, LessonBoard, ComingSoon
  features/        play/ home/ academy/ profile/  (screen components)
  app/             routes + layout + globals.css
public/manifest.webmanifest
```

## Progression rules
- **XP curve:** cumulative XP to reach level N = `50·N·(N−1)` → 0 / 100 / 300 / 600 / 1000 …
- **XP awarded once per lesson** (guarded in the store and persisted).
- **Streak:** +1 on a new consecutive day of activity, resets if a day is skipped; counts once per day. Triggered by lesson completion.
- **Stars (placeholder):** 3 if the quiz is correct first try, otherwise 2.
- **Unlocking:** lesson 1 is available; each later lesson unlocks when the previous is completed.

## Not in Sprint 2 (later)
Bot / Stockfish · puzzle trainer · category ratings · game review · PWA service worker + icons · cloud sync.

## Manual test checklist
1. `npm run dev`. Home shows Level 1, 0% Academy, streak 0.
2. Open **Academy** — 8 lessons; only lesson 1 available, 2–8 locked.
3. Open lesson 1, read it, answer the quiz wrong then right (feedback shows), tap **Complete** — “+XP earned”. Lesson 2 unlocks.
4. Back on **Home**, XP bar and Academy % increased; streak shows 1.
5. **Refresh** the page — progress persists (IndexedDB).
6. Re-open a completed lesson — it shows “completed”, no extra XP is granted.
7. Try opening a locked lesson by URL (e.g. `/academy/stalemate`) — it shows “Locked”.
8. **Profile** reflects level, XP, streak, lessons completed.
9. **Play** still works exactly as in Sprint 1.
