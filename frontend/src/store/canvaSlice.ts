import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CanvasPath } from "react-sketch-canvas";
import { resetAll } from "./rootActions";

interface CanvasSliceState {
  canvasPaths: CanvasPath[];
}

const initialState: CanvasSliceState = {
  canvasPaths: [],
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    setCanvasPaths: (state, action: PayloadAction<CanvasPath[]>) => {
      state.canvasPaths = action.payload;
    },
    addCanvasPath: (state, action: PayloadAction<CanvasPath>) => {
      state.canvasPaths.push(action.payload);
    },
    clearCanvas: (state) => {
      state.canvasPaths = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, (state) => {
      state.canvasPaths = [];
    });
  },
});

export const { setCanvasPaths, addCanvasPath, clearCanvas } =
  canvasSlice.actions;

export default canvasSlice.reducer;
