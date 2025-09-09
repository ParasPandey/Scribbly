import { RoundMessage, RoundScores, RoundState } from "@/types/Round";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAll } from "./rootActions";

const initialState: RoundState = {
  wordsList: [],
  selectedWord: "",
  isRoundStarted: false,
  timmer: 0,
  message: undefined,
  isRoundChange: false,
  shouldDisplayScores: false,
  currentTurnPlayerId: null,
};

const roundSlice = createSlice({
  name: "round",
  initialState,
  reducers: {
    setWordsList: (state, action: PayloadAction<string[]>) => {
      state.wordsList = action.payload;
    },
    setSelectedWord: (state, action: PayloadAction<string>) => {
      state.selectedWord = action.payload;
    },
    setIsRoundStarted: (state, action: PayloadAction<boolean>) => {
      state.isRoundStarted = action.payload;
    },
    setTimmer: (state, action: PayloadAction<number>) => {
      state.timmer = action.payload;
    },
    setRoundMessage: (
      state,
      action: PayloadAction<RoundMessage | undefined>
    ) => {
      state.message = action.payload;
    },
    startRound: (
      state,
      action: PayloadAction<{
        selectedWord: string;
        timmer: number;
      }>
    ) => {
      state.selectedWord = action.payload.selectedWord;
      state.isRoundStarted = true;
      state.timmer = action.payload.timmer;
    },

    setRoundChange: (state, action: PayloadAction<{ message: string }>) => {
      state.isRoundChange = true;
      state.message = { text: action.payload.message };
    },

    updateRoundScores(state, action: PayloadAction<RoundScores[]>) {
      state.roundScores = action.payload;
    },
    setShouldDisplayScores: (state, action: PayloadAction<boolean>) => {
      state.shouldDisplayScores = action.payload;
    },

    setCurrentPlayerId: (state, action: PayloadAction<string>) => {
      state.currentTurnPlayerId = action.payload;
    },

    resetRound: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, () => initialState);
  },
});

export const {
  setWordsList,
  setSelectedWord,
  setIsRoundStarted,
  setTimmer,
  setRoundMessage,
  resetRound,
  startRound,
  updateRoundScores,
  setShouldDisplayScores,
  setCurrentPlayerId,
} = roundSlice.actions;

export default roundSlice.reducer;
