import { AvatarType } from "@/types/Avatar";
import { getAvatarImages } from "@/utils/getAvatar";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

interface AvatarState {
  uuid: string;
  name: string;
  selectedAvatar: AvatarType;
  isHost: boolean; // Optional field to indicate if the user is the host
}

const initialState: AvatarState = {
  uuid: uuidv4(),
  name: "",
  selectedAvatar: getAvatarImages()[0],
  isHost: false, // Default to false, can be set later
};

const avatarSlice = createSlice({
  name: "avatar",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setAvatar: (state, action: PayloadAction<AvatarType>) => {
      state.selectedAvatar = action.payload;
    },
    resetAvatar: (state) => {
      state.name = "";
      state.selectedAvatar = getAvatarImages()[0]; // Reset to the first avatar
    },
    setHost: (state, action: PayloadAction<boolean>) => {
      state.isHost = action.payload; // Set the host status
    },
  },
});

export const { setName, setAvatar, resetAvatar, setHost } = avatarSlice.actions;
export default avatarSlice.reducer;
