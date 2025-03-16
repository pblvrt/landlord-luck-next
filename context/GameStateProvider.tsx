"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { getStartingSymbols } from "@/lib/symbols";
import { updateGridWithSymbols } from "@/lib/gameLogic";

// Define types
type Symbol = {
  id: string;
  name: string;
  value: number;
  rarity: "common" | "uncommon" | "rare";
  emoji: string;
  effectDescription?: string;
  bonusValue?: number;
  effect?: (grid: (Symbol | null)[], index: number) => number;
};

type RentSchedule = {
  rent: number;
  turns: number;
};

type GameState = {
  coins: number;
  turn: number;
  isSpinning: boolean;
  grid: (Symbol | null)[];
  symbols: Symbol[];
  soundEnabled: boolean;
  floor: number;
  lost: boolean;
  rentSchedule: RentSchedule[];
  shopOpen: boolean;
};

type GameAction =
  | { type: "ADD_COINS"; payload: number }
  | { type: "PAY_RENT" }
  | { type: "UPDATE_GRID"; payload: (Symbol | null)[] }
  | { type: "ADD_SYMBOL"; payload: Symbol }
  | { type: "STOP_SPIN_GRID" }
  | { type: "DECREASE_TURNS" }
  | { type: "TOGGLE_SOUND" }
  | { type: "RESET_GAME" }
  | { type: "LOAD_GAME"; payload: GameState }
  | { type: "START_SPIN_GRID" }
  | { type: "TOGGLE_SHOP" }
  | { type: "CLOSE_SHOP" };

const GameStateContext = createContext<
  | {
      state: GameState;
      dispatch: React.Dispatch<GameAction>;
    }
  | undefined
>(undefined);

// Get starting symbols
const startingSymbols = getStartingSymbols();

const initialState: GameState = {
  coins: 0,
  turn: 0,
  isSpinning: false,
  grid: updateGridWithSymbols(startingSymbols),
  symbols: startingSymbols,
  soundEnabled: true,
  floor: 0,
  lost: false,
  shopOpen: false,
  rentSchedule: [
    { rent: 25, turns: 4 },
    { rent: 50, turns: 4 },
    { rent: 100, turns: 5 },
    { rent: 150, turns: 5 },
    { rent: 225, turns: 6 },
    { rent: 300, turns: 6 },
    { rent: 350, turns: 7 },
    { rent: 425, turns: 7 },
    { rent: 575, turns: 8 },
    { rent: 625, turns: 8 },
    { rent: 675, turns: 9 },
    { rent: 777, turns: 9 },
    { rent: 1000, turns: 9 },
    { rent: 1000, turns: 9 },
  ],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ADD_COINS":
      return { ...state, coins: state.coins + action.payload };
    case "PAY_RENT":
      return {
        ...state,
        coins: state.coins - state.rentSchedule[state.floor].rent,
        floor: state.floor + 1,
      };
    case "UPDATE_GRID":
      return { ...state, grid: action.payload };
    case "START_SPIN_GRID":
      return {
        ...state,
        coins: state.coins > 0 ? state.coins - 1 : 0,
        isSpinning: true,
      };
    case "STOP_SPIN_GRID":
      return { ...state, isSpinning: false };
    case "ADD_SYMBOL":
      return { ...state, symbols: [...state.symbols, action.payload] };
    case "DECREASE_TURNS":
      if (state.turn === state.rentSchedule[state.floor].turns) {
        if (state.coins < state.rentSchedule[state.floor].rent) {
          return { ...state, lost: true };
        } else {
          return {
            ...state,
            coins: state.coins - state.rentSchedule[state.floor].rent,
            floor: state.floor + 1,
            turn: 0,
            shopOpen: true,
          };
        }
      }
      return { ...state, turn: state.turn + 1, shopOpen: true };
    case "TOGGLE_SOUND":
      return { ...state, soundEnabled: !state.soundEnabled };
    case "RESET_GAME":
      return initialState;
    case "LOAD_GAME":
      return { ...action.payload };
    case "TOGGLE_SHOP":
      return { ...state, shopOpen: !state.shopOpen };
    case "CLOSE_SHOP":
      return { ...state, shopOpen: false };
    default:
      return state;
  }
}

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem("landlordLuckSave");
    if (savedGame) {
      dispatch({ type: "LOAD_GAME", payload: JSON.parse(savedGame) });
    }
  }, []);

  // Save game when state changes
  useEffect(() => {
    localStorage.setItem("landlordLuckSave", JSON.stringify(state));
  }, [state]);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
}
