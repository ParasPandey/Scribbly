import { rooms, roomTimers } from "../../store";
import { announceRound } from "../GameEvents/GameEventHandlers";
import { endGame } from "./endGame";
import { startTurn } from "./startTurn";

export function changeTurn(roomId: string) {
  const room = rooms[roomId];
  if (!room || !room.game) return;

  // stop timer if any
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId].timeoutId);
    delete roomTimers[roomId];
  }

  // reset previous round details
  room.game.canvas = [];
  room.game.currentTurn = undefined;

  let currentTurnIndex =
    (room.game.currentTurnIndex + 1) % room.game.turnOrder.length;

  // progress turn index
  room.game.currentTurnIndex = currentTurnIndex;

  // new round check
  let isNewRound = false;
  if (room.game.currentTurnIndex === 0) {
    room.game.roundNumber++;
    isNewRound = true;

    // check this all rounds are done
    // 🎯 End game check
    if (room.game.roundNumber > room.gameSetting.rounds) {
      endGame(roomId); // 🔥 stop game + announce results
      return;
    }
  }

  // clear current turn
  room.game.currentTurn = {
    wordOptions: [],
    guessedBy: new Map<string, number>(),
  };

  if (isNewRound) {
    // ⏳ show round number before starting turn
    announceRound(roomId, room.game.roundNumber, () => startTurn(roomId));
  } else {
    startTurn(roomId);
  }
}
