import { Player } from "@/types/Player";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PlayersSliceState {
  players: Record<string, Player>;
  isMyTurn: boolean;
}

const initialState: PlayersSliceState = {
  players: {},
  isMyTurn: false,
};

const playersSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    setPlayers(state, action: PayloadAction<Record<string, Player>>) {
      state.players = action.payload;
    },
    addPlayer(state, action: PayloadAction<Player>) {
      state.players[action.payload.id] = action.payload;
    },
    updatePlayer(
      state,
      action: PayloadAction<{ id: string; changes: Partial<Player> }>
    ) {
      const { id, changes } = action.payload;
      if (state.players[id]) {
        state.players[id] = { ...state.players[id], ...changes };
      }
    },
    removePlayer(state, action: PayloadAction<string>) {
      delete state.players[action.payload];
    },
    setMyTurn(state, action: PayloadAction<boolean>) {
      state.isMyTurn = action.payload;
    },
  },
});

export const { setPlayers, addPlayer, updatePlayer, removePlayer, setMyTurn } =
  playersSlice.actions;
export default playersSlice.reducer;
