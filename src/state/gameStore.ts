import { create } from "zustand";
import type { Chess } from "chess.js";
import type { Color, Square } from "chess.js";
import { createGame, legalTargets, snapshot, tryMove } from "@/domain/chess/engine";
import { chooseOpponentMove } from "@/domain/chess/bot";
import { searchBestMove } from "@/domain/chess/search";
import type { GameSnapshot } from "@/domain/chess/types";
import { loadActiveGame, saveActiveGame } from "@/data/gameRepository";
import { opponentById } from "@/content/opponents";
import { resolveSide, type SideChoice } from "@/domain/chess/side";
import { useProfileStore } from "@/state/profileStore";

export type PlayMode = "idle" | "practice" | "bot";
export type MatchOutcome = "win" | "loss" | "draw";
export interface MatchResultState {
  outcome: MatchOutcome;
  reason: string;
  moves: number;
  xpAwarded: number;
  ratingBefore: number;
  ratingAfter: number;
  /** True until the reward has been computed/persisted. */
  pending: boolean;
}

interface GameState {
  game: Chess;
  snap: GameSnapshot;
  selected: Square | null;
  targets: Square[];
  notice: string | null;
  userMoveCount: number;
  hydrated: boolean;

  /** Engine-suggested move for the side to move (cleared on any board change). */
  hint: { from: Square; to: Square } | null;
  hintThinking: boolean;

  // Sprint 7 — match mode
  mode: PlayMode;
  opponentId: string | null;
  userColor: Color;
  botThinking: boolean;
  result: MatchResultState | null;
  matchStartTime: number | null;
  matchEndTime: number | null;
  matchSaved: boolean;

  selectSquare: (sq: Square) => void;
  grab: (sq: Square) => void;
  move: (from: Square, to: Square) => boolean;
  clearSelection: () => void;
  clearNotice: () => void;
  requestHint: () => void;
  reset: () => void;
  undo: () => void;
  hydrate: () => Promise<void>;

  startMatch: (opponentId: string, side?: SideChoice) => void;
  startPractice: () => void;
  exitMatch: () => void;
  resignMatch: () => void;
}

const initialGame = createGame();

/** Pending bot move timer — module-scoped so it survives re-renders. */
let botTimer: ReturnType<typeof setTimeout> | null = null;
function clearBotTimer() {
  if (botTimer) {
    clearTimeout(botTimer);
    botTimer = null;
  }
}

/** Pending hint computation — cancelled whenever the board changes under it. */
let hintTimer: ReturnType<typeof setTimeout> | null = null;
function clearHintTimer() {
  if (hintTimer) {
    clearTimeout(hintTimer);
    hintTimer = null;
  }
}

export const useGameStore = create<GameState>((set, get) => {
  function botColor(): Color {
    return get().userColor === "w" ? "b" : "w";
  }

  function isUserTurn(): boolean {
    const s = get();
    if (s.mode !== "bot") return true;
    if (s.result) return false; // match is over — no more input
    return s.game.turn() === s.userColor;
  }

  async function finalizeMatch(forced?: { outcome: MatchOutcome; reason: string }) {
    const s = get();
    if (s.matchSaved || s.mode !== "bot") return;

    let outcome: MatchOutcome;
    let reason: string;
    if (forced) {
      outcome = forced.outcome;
      reason = forced.reason;
    } else {
      const g = s.game;
      if (g.isCheckmate()) {
        const winner: Color = g.turn() === "w" ? "b" : "w";
        outcome = winner === s.userColor ? "win" : "loss";
        reason = "checkmate";
      } else if (g.isStalemate()) {
        outcome = "draw";
        reason = "stalemate";
      } else if (g.isDraw()) {
        outcome = "draw";
        reason = "draw";
      } else {
        return; // not actually over
      }
    }

    const moves = s.snap.history.length;
    const before = useProfileStore.getState().playRating;
    // Show the recap immediately; fill in the reward once persisted.
    clearHintTimer();
    set({
      matchSaved: true,
      matchEndTime: Date.now(),
      botThinking: false,
      selected: null,
      targets: [],
      hint: null,
      hintThinking: false,
      result: { outcome, reason, moves, xpAwarded: 0, ratingBefore: before, ratingAfter: before, pending: true },
    });

    const opp = opponentById(s.opponentId);
    const reward = await useProfileStore.getState().recordMatch({
      opponentId: s.opponentId ?? "bot",
      opponentName: opp?.name ?? "Bot",
      opponentRating: opp?.rating ?? 400,
      xpReward: opp?.xpReward ?? 10,
      outcome,
      reason,
      userColor: s.userColor,
      moves,
      pgn: s.snap.pgn,
      sans: s.snap.history.map((h) => h.san),
      startedAt: s.matchStartTime ?? Date.now(),
      finishedAt: Date.now(),
    });
    set({
      result: {
        outcome,
        reason,
        moves,
        xpAwarded: reward.xpAwarded,
        ratingBefore: reward.ratingBefore,
        ratingAfter: reward.ratingAfter,
        pending: false,
      },
    });
  }

  function playBotMove() {
    clearBotTimer();
    const s = get();
    if (s.mode !== "bot") return;
    const g = s.game;
    if (g.isGameOver()) {
      void finalizeMatch();
      return;
    }
    if (g.turn() !== botColor()) {
      set({ botThinking: false });
      return;
    }
    const opp = opponentById(s.opponentId);
    const mv = chooseOpponentMove(g.fen(), { depth: opp?.depth ?? 1, skill: opp?.skill ?? 0.1 });
    if (!mv) {
      set({ botThinking: false });
      return;
    }
    tryMove(g, mv.from, mv.to, mv.promotion);
    const snap = snapshot(g);
    set({ snap, botThinking: false, selected: null, targets: [], hint: null });
    void saveActiveGame(snap.pgn);
    if (g.isGameOver()) void finalizeMatch();
  }

  function scheduleBot() {
    const s = get();
    if (s.mode !== "bot") return;
    if (s.game.isGameOver()) {
      void finalizeMatch();
      return;
    }
    if (s.game.turn() !== botColor()) return;
    clearBotTimer();
    set({ botThinking: true });
    const delay = 420 + Math.floor(Math.random() * 380);
    botTimer = setTimeout(playBotMove, delay);
  }

  /** Apply a successful user move's side effects (snapshot, persist, bot reply). */
  function afterUserMove() {
    clearHintTimer();
    const g = get().game;
    const snap = snapshot(g);
    set({ snap, selected: null, targets: [], notice: null, hint: null, hintThinking: false, userMoveCount: get().userMoveCount + 1 });
    void saveActiveGame(snap.pgn);
    if (get().mode === "bot") {
      if (g.isGameOver()) void finalizeMatch();
      else scheduleBot();
    }
  }

  function freshMatchState() {
    const game = createGame();
    return { game, snap: snapshot(game), selected: null, targets: [], notice: null };
  }

  return {
    game: initialGame,
    snap: snapshot(initialGame),
    selected: null,
    targets: [],
    notice: null,
    userMoveCount: 0,
    hydrated: false,

    hint: null,
    hintThinking: false,

    mode: "idle",
    opponentId: null,
    userColor: "w",
    botThinking: false,
    result: null,
    matchStartTime: null,
    matchEndTime: null,
    matchSaved: false,

    selectSquare: (sq) => {
      const { game, selected, targets } = get();
      if (!isUserTurn()) {
        set({ selected: null, targets: [] });
        return;
      }

      if (selected === sq) {
        set({ selected: null, targets: [] });
        return;
      }

      if (selected && targets.includes(sq)) {
        if (tryMove(game, selected, sq)) {
          afterUserMove();
        } else {
          set({ selected: null, targets: [] });
        }
        return;
      }

      const piece = game.get(sq);
      if (piece && piece.color === game.turn()) {
        set({ selected: sq, targets: legalTargets(game, sq) });
      } else {
        set({ selected: null, targets: [] });
      }
    },

    grab: (sq) => {
      const { game } = get();
      if (!isUserTurn()) return;
      const piece = game.get(sq);
      if (piece && piece.color === game.turn()) {
        set({ selected: sq, targets: legalTargets(game, sq) });
      }
    },

    move: (from, to) => {
      const { game } = get();
      if (!isUserTurn()) return false;
      if (tryMove(game, from, to)) {
        afterUserMove();
        return true;
      }
      set({ selected: null, targets: [], notice: "That move isn't legal." });
      return false;
    },

    clearSelection: () => set({ selected: null, targets: [] }),
    clearNotice: () => set({ notice: null }),

    requestHint: () => {
      const s = get();
      if (s.hint) {
        set({ hint: null }); // tap again to dismiss
        return;
      }
      if (s.hintThinking || s.game.isGameOver() || !isUserTurn()) return;
      clearHintTimer();
      set({ hintThinking: true });
      // Defer the search a tick so the button press paints before we think.
      hintTimer = setTimeout(() => {
        hintTimer = null;
        const cur = get();
        if (cur.game.isGameOver() || !isUserTurn()) {
          set({ hintThinking: false });
          return;
        }
        const best = searchBestMove(cur.game.fen(), { maxDepth: 3, nodeBudget: 120000, timeMs: 700 });
        set({
          hintThinking: false,
          hint: best ? { from: best.uci.slice(0, 2) as Square, to: best.uci.slice(2, 4) as Square } : null,
        });
      }, 30);
    },

    reset: () => {
      clearBotTimer();
      clearHintTimer();
      const game = createGame();
      const snap = snapshot(game);
      set({ game, snap, selected: null, targets: [], botThinking: false, hint: null, hintThinking: false });
      void saveActiveGame(snap.pgn);
    },

    undo: () => {
      const { game, mode } = get();
      if (mode === "bot") return; // matches aren't take-backs
      const undone = game.undo();
      if (!undone) return;
      clearHintTimer();
      const snap = snapshot(game);
      set({ snap, selected: null, targets: [], hint: null, hintThinking: false });
      void saveActiveGame(snap.pgn);
    },

    hydrate: async () => {
      if (get().hydrated) return;
      const pgn = await loadActiveGame();
      if (pgn) {
        const game = createGame(pgn);
        set({ game, snap: snapshot(game), hydrated: true });
      } else {
        set({ hydrated: true });
      }
    },

    startMatch: (opponentId, side = "w") => {
      clearBotTimer();
      clearHintTimer();
      const userColor = resolveSide(side);
      set({
        ...freshMatchState(),
        mode: "bot",
        opponentId,
        userColor,
        botThinking: false,
        result: null,
        hint: null,
        hintThinking: false,
        matchStartTime: Date.now(),
        matchEndTime: null,
        matchSaved: false,
      });
      void saveActiveGame(get().snap.pgn);
      // If the user is Black, the bot (White) opens with the first move.
      if (userColor === "b") scheduleBot();
    },

    startPractice: () => {
      clearBotTimer();
      clearHintTimer();
      set({ mode: "practice", opponentId: null, botThinking: false, result: null, hint: null, hintThinking: false });
    },

    exitMatch: () => {
      clearBotTimer();
      clearHintTimer();
      set({ mode: "idle", botThinking: false, hint: null, hintThinking: false });
    },

    resignMatch: () => {
      clearBotTimer();
      void finalizeMatch({ outcome: "loss", reason: "resignation" });
    },
  };
});
