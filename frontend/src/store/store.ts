import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import gameReducer from "./gameSlice";
import canvaReducer from "./canvaSlice";
import chatReducer from "./chatSlice";
import roundReducer from "./roundSlice";
import playersReducer from "./playerSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    game: gameReducer,
    canvas: canvaReducer,
    chat: chatReducer,
    round: roundReducer,
    players: playersReducer,
  },
});

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
