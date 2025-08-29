import { GameState } from "@/enums";
import { Chat, InGameSettings } from "@/types/Game";
import { Player } from "@/types/Player";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasPath } from "react-sketch-canvas";

interface GameStore {
  roomId: string; // Placeholder for room ID, can be expanded later
  gameState: GameState; // Placeholder for game state, can be expanded later
  playersJoined: Player[]; // Placeholder for players joined, can be expanded later
  gameSettings: InGameSettings;
  chats: Chat[];
  canvasPaths: CanvasPath[];
  isMyTurn: boolean;
}

const initialState: GameStore = {
  roomId: "",
  gameState: GameState.USER_REGISTERING, // Initial game state
  gameSettings: {
    players: "2",
    drawTime: "80",
    rounds: "3",
    wordCount: "3",
    hints: "2",
    customWords: [],
  },
  playersJoined: [],
  chats: [],
  canvasPaths: [],
  isMyTurn: false,
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
    setNumberOfPlayers: (state, action: PayloadAction<string>) => {
      state.gameSettings.players = action.payload;
    },
    setDrawTime: (state, action: PayloadAction<string>) => {
      state.gameSettings.drawTime = action.payload;
    },
    setRounds: (state, action: PayloadAction<string>) => {
      state.gameSettings.rounds = action.payload;
    },
    setWordCount: (state, action: PayloadAction<string>) => {
      state.gameSettings.wordCount = action.payload;
    },
    setHints: (state, action: PayloadAction<string>) => {
      state.gameSettings.hints = action.payload;
    },
    // Additional reducers for custom words
    addCustomWord: (state, action: PayloadAction<string>) => {
      state.gameSettings.customWords.push(action.payload);
    },
    removeCustomWord: (state, action: PayloadAction<number>) => {
      state.gameSettings.customWords.splice(action.payload, 1);
    },
    resetGameSettings: (state) => {
      state.gameSettings = initialState.gameSettings;
    },
    addPlayers: (state, action: PayloadAction<Player>) => {
      state.playersJoined.push(action.payload);
    },
    updatePlayers: (state, action: PayloadAction<Player[]>) => {
      state.playersJoined = action.payload;
    },
    updateChat: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.push(action.payload);
    },
    setCanvaPaths: (state, action: PayloadAction<CanvasPath[]>) => {
      state.canvasPaths = action.payload;
    },
    addCanvaPath: (state, action: PayloadAction<CanvasPath>) => {
      state.canvasPaths.push(action.payload);
    },
    clearCanvaPaths: (state) => {
      state.canvasPaths = [];
    },
    setIsMyTurn: (state, action: PayloadAction<boolean>) => {
      state.isMyTurn = action.payload;
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
  addPlayers,
  updateChat,
  addChat,
  updatePlayers,
  setCanvaPaths,
  addCanvaPath,
  clearCanvaPaths,
  setIsMyTurn,
} = gameSlice.actions;
export default gameSlice.reducer;
