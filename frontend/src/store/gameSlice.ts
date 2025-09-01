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
  currentRoundNumber: number;
  currRound: {
    wordsList: string[];
    selectedWord: string;
    isRoundStarted: boolean;
    timmer: number;
    message?: { text: string; avatar: string };
  };
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
  playersJoined: [],
  chats: [],
  canvasPaths: [],
  isMyTurn: false,
  currentRoundNumber: 1,
  currRound: {
    wordsList: [],
    selectedWord: "",
    isRoundStarted: false,
    timmer: 0,
  },
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
      // check for player list and update internal property also
      state.isMyTurn = action.payload;
    },
    updateWordsList: (state, action: PayloadAction<string[]>) => {
      state.currRound.wordsList = action.payload;
    },
    updateSelectedWord: (state, action: PayloadAction<string>) => {
      state.currRound.selectedWord = action.payload;
      state.currRound.isRoundStarted = true;
    },

    startRound: (
      state,
      action: PayloadAction<{
        selectedWord: string;
        timmer: number;
      }>
    ) => {
      state.currRound.selectedWord = action.payload.selectedWord;
      state.currRound.isRoundStarted = true;
      state.currRound.timmer = action.payload.timmer;
    },
    resetRound: (state) => {
      state.currRound.wordsList = [];
      state.currRound.selectedWord = "";
      state.currRound.isRoundStarted = false;
      state.currRound.message = undefined;
    },

    updateTimmer: (state, action: PayloadAction<number>) => {
      state.currRound.timmer = action.payload;
    },
    updateCurrRoundNumber: (state, action: PayloadAction<number>) => {
      state.currentRoundNumber = action.payload;
    },
    updateMessage: (
      state,
      action: PayloadAction<{
        text: string;
        avatar: string;
      }>
    ) => {
      state.currRound.message = {
        text: action.payload.text,
        avatar: action.payload.avatar,
      };
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
  updateWordsList,
  updateSelectedWord,
  startRound,
  resetRound,
  updateTimmer,
  updateCurrRoundNumber,
  updateMessage,
} = gameSlice.actions;
export default gameSlice.reducer;
