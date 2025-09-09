import { Chat } from "@/types/Chat";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAll } from "./rootActions";

interface ChatSliceState {
  chats: Chat[];
}

const initialState: ChatSliceState = {
  chats: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, (state) => {
      state.chats = [];
    });
  },
});

export const { setChats, addChat } = chatSlice.actions;

export default chatSlice.reducer;
