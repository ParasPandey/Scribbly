import { Player } from "@/types/Player";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetAll } from "./rootActions";

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
    updatePlayerScores(
      state,
      action: PayloadAction<{ playerId: string; score: number; rank: number }[]>
    ) {
      action.payload.forEach(({ playerId, score, rank }) => {
        if (state.players[playerId]) {
          state.players[playerId].score = score;
          state.players[playerId].rank = rank;
        }
      });
    },

    removePlayer(state, action: PayloadAction<string>) {
      const playerId = action.payload;
      const removedPlayer = state.players[playerId];
      if (!removedPlayer) return;

      // Remove the player
      delete state.players[playerId];
    },
    setMyTurn(state, action: PayloadAction<boolean>) {
      state.isMyTurn = action.payload;
    },

    rankSync(state, action: PayloadAction<Record<string, number>>) {
      const players = Object.keys(action.payload); // array of player IDs
      for (const playerId of players) {
        state.players[playerId].rank = action.payload[playerId]; // assign the rank value
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetAll, (state) => {
      state.isMyTurn = false;
    });
  },
});

export const {
  setPlayers,
  addPlayer,
  updatePlayer,
  removePlayer,
  updatePlayerScores,
  rankSync,
} = playersSlice.actions;
export default playersSlice.reducer;
