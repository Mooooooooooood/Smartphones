import { create } from "zustand";
import type { Chess } from "chess.js";
import type { Color, Square } from "chess.js";
import { createGame, legalTargets, snapshot, tryMove } from "@/domain/chess/engine";
import { chooseBotMove } from "@/domain/chess/bot";
import type { GameSnapshot } from "@/domain/chess/types";
import { loadActiveGame, saveActiveGame } from "@/data/gameRepository";
import { opponentById } from "@/content/opponents";
import { useProfileStore } from "@/state/profileStore";

export type PlayMode = "idle" | "practice" | "bot";
export type MatchOutcome = "win" | "loss" | "draw";
export interface MatchResultState {
  outcome: MatchOutcome;
  reason: string;
  xpAwarded: number;
}

interface GameState {
  game: Chess;
  snap: GameSnapshot;
  selected: Square | null;
  targets: Square[];
  notice: string | null;
  userMoveCount: number;
  hydrated: boolean;

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
  reset: () => void;
  undo: () => void;
  hydrate: () => Promise<void>;

  startMatch: (opponentId: string) => void;
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

export const useGameStore = create<GameState>((set, get) => {
  function botColor(): Color {
    return get().userColor === "w" ? "b" : "w";
  }

  function isUserTurn(): boolean {
    const s = get();
    return s.mode !== "bot" || s.game.turn() === s.userColor;
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

    set({ matchSaved: true, matchEndTime: Date.now(), botThinking: false });
    const opp = opponentById(s.opponentId);
    const xpAwarded = await useProfileStore.getState().recordMatch({
      opponentId: s.opponentId ?? "bot",
      opponentName: opp?.name ?? "Bot",
      opponentRating: opp?.rating ?? 400,
      xpReward: opp?.xpReward ?? 10,
      outcome,
      reason,
      userColor: s.userColor,
      moves: s.snap.history.length,
      pgn: s.snap.pgn,
      startedAt: s.matchStartTime ?? Date.now(),
      finishedAt: Date.now(),
    });
    set({ result: { outcome, reason, xpAwarded } });
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
    const mv = chooseBotMove(g.fen(), opp?.personality ?? "random");
    if (!mv) {
      set({ botThinking: false });
      return;
    }
    tryMove(g, mv.from, mv.to, mv.promotion);
    const snap = snapshot(g);
    set({ snap, botThinking: false, selected: null, targets: [] });
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
    const g = get().game;
    const snap = snapshot(g);
    set({ snap, selected: null, targets: [], notice: null, userMoveCount: get().userMoveCount + 1 });
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

    reset: () => {
      clearBotTimer();
      const game = createGame();
      const snap = snapshot(game);
      set({ game, snap, selected: null, targets: [], botThinking: false });
      void saveActiveGame(snap.pgn);
    },

    undo: () => {
      const { game, mode } = get();
      if (mode === "bot") return; // matches aren't take-backs
      const undone = game.undo();
      if (!undone) return;
      const snap = snapshot(game);
      set({ snap, selected: null, targets: [] });
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

    startMatch: (opponentId) => {
      clearBotTimer();
      set({
        ...freshMatchState(),
        mode: "bot",
        opponentId,
        userColor: "w",
        botThinking: false,
        result: null,
        matchStartTime: Date.now(),
        matchEndTime: null,
        matchSaved: false,
      });
      void saveActiveGame(get().snap.pgn);
    },

    startPractice: () => {
      clearBotTimer();
      set({ mode: "practice", opponentId: null, botThinking: false, result: null });
    },

    exitMatch: () => {
      clearBotTimer();
      set({ mode: "idle", botThinking: false });
    },

    resignMatch: () => {
      clearBotTimer();
      void finalizeMatch({ outcome: "loss", reason: "resignation" });
    },
  };
});
