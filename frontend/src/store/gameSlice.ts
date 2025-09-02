import { GameState } from "@/enums";
import { InGameSettings } from "@/types/Game";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface GameStore {
  roomId: string;
  gameState: GameState;
  gameSettings: InGameSettings;
  isMyTurn: boolean;
  currentRoundNumber: number;
}

const initialState: GameStore = {
  roomId: "",
  gameState: GameState.USER_REGISTERING, // Initial game state
  gameSettings: {
    players: 2,
    drawTime: 10,
    rounds: 3,
    wordCount: 3,
    hints: 2,
    customWords: [],
  },
  isMyTurn: false,
  currentRoundNumber: 1,
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
} = gameSlice.actions;
export default gameSlice.reducer;
