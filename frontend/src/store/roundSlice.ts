import { RoundMessage, RoundState } from "@/types/Round";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: RoundState = {
  wordsList: [],
  selectedWord: "",
  isRoundStarted: false,
  timmer: 0,
  message: undefined,
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
    resetRound: () => initialState,
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
} = roundSlice.actions;

export default roundSlice.reducer;
