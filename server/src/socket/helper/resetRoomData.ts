import { rooms, roomTimers } from "../../store";

export function resetRoomData(roomId: string) {
  const room = rooms[roomId];
  if (!room) return;

  // --- Reset players (keep only required props) ---
  Object.values(room.players).forEach((player) => {
    player.score = 0; // reset
    player.isPlayerTurn = false; // reset
  });

  // --- Reset room state ---
  room.chat = []; // reset chat
  room.isGameStarted = false; // reset flag
  room.game = undefined; // reset game state entirely

  // --- Cleanup timers for this room ---
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
    delete roomTimers[roomId];
  }
}
