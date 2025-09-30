import { GameState } from "@/enums";
import { InGameSettings } from "@/types/Game";
import { FinalPlayerScore } from "@/types/Player";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAll } from "./rootActions";

interface GameStore {
  roomId: string;
  gameState: GameState;
  gameSettings: InGameSettings;
  isMyTurn: boolean;
  currentRoundNumber: number;
  isGameStarted: boolean;
  finalScores?: FinalPlayerScore[];
  isLoading: boolean;
}

const initialState: GameStore = {
  roomId: "",
  gameState: GameState.USER_REGISTERING, // Initial game state
  gameSettings: {
    players: 2,
    drawTime: 50,
    rounds: 3,
    wordCount: 3,
    hints: 2,
    customWords: [],
  },
  isMyTurn: false,
  currentRoundNumber: 1,
  isGameStarted: false,
  isLoading: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    updateRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    updateGameState: (state, action: PayloadAction<GameState>) => {
      state.gameState = action.payload;
    },
    updateGameSettings: (state, action: PayloadAction<InGameSettings>) => {
      state.gameSettings = action.payload;
    },
    setNumberOfPlayers: (state, action: PayloadAction<number>) => {
      state.gameSettings.players = action.payload;
    },
    setDrawTime: (state, action: PayloadAction<number>) => {
      state.gameSettings.drawTime = action.payload;
    },
    setRounds: (state, action: PayloadAction<number>) => {
      state.gameSettings.rounds = action.payload;
    },
    setWordCount: (state, action: PayloadAction<number>) => {
      state.gameSettings.wordCount = action.payload;
    },
    setHints: (state, action: PayloadAction<number>) => {
      state.gameSettings.hints = action.payload;
    },

    addCustomWord: (state, action: PayloadAction<string>) => {
      state.gameSettings.customWords.push(action.payload);
    },
    removeCustomWord: (state, action: PayloadAction<number>) => {
      state.gameSettings.customWords.splice(action.payload, 1);
    },
    resetGameSettings: (state) => {
      state.gameSettings = initialState.gameSettings;
    },
    setIsMyTurn: (state, action: PayloadAction<boolean>) => {
      state.isMyTurn = action.payload;
    },
    updateCurrRoundNumber: (state, action: PayloadAction<number>) => {
      state.currentRoundNumber = action.payload;
    },
    updateGameStarted: (state, action: PayloadAction<boolean>) => {
      state.isGameStarted = action.payload;
    },
    updateFinalScores: (state, action: PayloadAction<FinalPlayerScore[]>) => {
      state.finalScores = action.payload;
    },
    updateIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, (state) => {
      // preserve roomId and gameSettings
      const { roomId, gameSettings } = state;
      return {
        ...initialState,
        roomId,
        gameSettings,
        gameState: GameState.ROOM_CREATION,
      };
    });
  },
});

export const {
  updateRoomId,
  updateGameState,
  updateGameSettings,
  setNumberOfPlayers,
  setDrawTime,
  setRounds,
  setWordCount,
  setHints,
  addCustomWord,
  removeCustomWord,
  resetGameSettings,
  setIsMyTurn,
  updateCurrRoundNumber,
  updateGameStarted,
  updateFinalScores,
  updateIsLoading,
} = gameSlice.actions;
export default gameSlice.reducer;
