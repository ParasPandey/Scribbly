import { io } from "../../server";
import { playerToSocket, rooms, roomTimers } from "../../store";
import { getRandomWords } from "../../utils";

export function startTurn(roomId: string) {
  const room = rooms[roomId];
  if (!room || !room.game) return;

  // clear previous timer if exists
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
  }

  // reset everyone first
  Object.values(room.players).forEach((p) => (p.isPlayerTurn = false));

  // determine current player
  const currentPlayerId = room.game.turnOrder[room.game?.currentTurnIndex];
  const currentSocketId = playerToSocket[currentPlayerId];

  if (currentSocketId) {
    room.players[currentPlayerId].isPlayerTurn = true;
    let words = getRandomWords(
      room.game.wordsCollection,
      room.gameSetting.wordCount
    );

    if (room.game.currentTurn) room.game.currentTurn.wordOptions = words;

    io.to(currentSocketId).emit("turn:change", {
      isMyTurn: true,
      words: words,
      duration: room.gameSetting.drawTime, // let client show timer
      currentRound: room.game?.roundNumber,
      message: null,
    });

    // notify all others
    Object.keys(room.players).forEach((pid) => {
      if (pid !== currentPlayerId) {
        const sid = playerToSocket[pid];
        if (sid) {
          io.to(sid).emit("turn:change", {
            isMyTurn: false,
            words: [],
            duration: room.gameSetting.drawTime,
            currentRound: room.game?.roundNumber,
            message: {
              text: `${room.players[currentPlayerId].name} is choosing a word!!`,
              avatar: room.players[currentPlayerId].avatar.src,
            },
          });
        }
      }
    });

    // only for now will update this
    io.to(roomId).emit("room-players", {
      players: room.players,
    });
  }
}
