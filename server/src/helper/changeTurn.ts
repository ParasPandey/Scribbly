import { rooms, roomTimers } from "../server";
import { startTurn } from "./startTurn";

export function changeTurn(roomId: string) {
  const room = rooms[roomId];
  if (!room || !room.game) return;

  // stop timer if any
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
    delete roomTimers[roomId];
  }

  // progress turn index
  room.game.currentTurnIndex =
    (room.game.currentTurnIndex + 1) % room.game.turnOrder.length;

  // optionally track rounds
  if (room.game.currentTurnIndex === 0) room.game.roundNumber++;

  // clear current turn
  room.game.currentTurn = { wordOptions: [] };

  // start next turn (again: selection first, timer later)
  startTurn(roomId);
}
