import { create } from "zustand";
import type { Chess } from "chess.js";
import type { Square } from "chess.js";
import { createGame, legalTargets, snapshot, tryMove } from "@/domain/chess/engine";
import type { GameSnapshot } from "@/domain/chess/types";
import { loadActiveGame, saveActiveGame } from "@/data/gameRepository";

interface GameState {
  /** Mutable source of truth; never read directly in render — read `snap` instead. */
  game: Chess;
  snap: GameSnapshot;
  selected: Square | null;
  targets: Square[];
  /** Transient message for an illegal drag-drop, shown then auto-cleared. */
  notice: string | null;
  /** Count of genuine user moves this session (not affected by hydrate/restore). */
  userMoveCount: number;
  hydrated: boolean;

  /** Tap behaviour: select / deselect / move depending on context. */
  selectSquare: (sq: Square) => void;
  /** Force-select a piece (used when a drag begins). */
  grab: (sq: Square) => void;
  /** Direct from→to move (used on drag-drop). Returns true if the move was legal. */
  move: (from: Square, to: Square) => boolean;
  clearSelection: () => void;
  clearNotice: () => void;
  reset: () => void;
  undo: () => void;
  hydrate: () => Promise<void>;
}

const initialGame = createGame();

export const useGameStore = create<GameState>((set, get) => ({
  game: initialGame,
  snap: snapshot(initialGame),
  selected: null,
  targets: [],
  notice: null,
  userMoveCount: 0,
  hydrated: false,

  selectSquare: (sq) => {
    const { game, selected, targets } = get();

    if (selected === sq) {
      set({ selected: null, targets: [] });
      return;
    }

    if (selected && targets.includes(sq)) {
      if (tryMove(game, selected, sq)) {
        const snap = snapshot(game);
        set({ snap, selected: null, targets: [], userMoveCount: get().userMoveCount + 1 });
        void saveActiveGame(snap.pgn);
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
    const piece = game.get(sq);
    if (piece && piece.color === game.turn()) {
      set({ selected: sq, targets: legalTargets(game, sq) });
    }
  },

  move: (from, to) => {
    const { game } = get();
    if (tryMove(game, from, to)) {
      const snap = snapshot(game);
      set({ snap, selected: null, targets: [], notice: null, userMoveCount: get().userMoveCount + 1 });
      void saveActiveGame(snap.pgn);
      return true;
    }
    set({ selected: null, targets: [], notice: "That move isn't legal." });
    return false;
  },

  clearSelection: () => set({ selected: null, targets: [] }),
  clearNotice: () => set({ notice: null }),

  reset: () => {
    const game = createGame();
    const snap = snapshot(game);
    set({ game, snap, selected: null, targets: [] });
    void saveActiveGame(snap.pgn);
  },

  undo: () => {
    const { game } = get();
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
}));
