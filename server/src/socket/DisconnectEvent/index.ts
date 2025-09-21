import { io } from "../..";
import { playerToSocket, rooms, roomTimers, socketToPlayer } from "../../store";
import { MessageTypes, SocketType } from "../../types";
import { assignDenseRanks } from "../../utils";
import { changeTurn } from "../helper/changeTurn";
import { endGame } from "../helper/endGame";

export function DisconnectEvent(socket: SocketType) {
  // disconnect
  socket.on("disconnect", () => {
    const info = socketToPlayer[socket.id];
    if (!info) return;

    const { roomId, playerId } = info;
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players[playerId];
    delete room.players[playerId];
    delete socketToPlayer[socket.id];
    delete playerToSocket[playerId];

    // if game is started and then player leave in between
    if (room.isGameStarted && room.game?.turnOrder) {
      const index = room.game.turnOrder.indexOf(playerId);
      if (index === -1) return;

      room.game.turnOrder.splice(index, 1);

      // If the removed player is before or at currentTurnIndex, decrease currentTurnIndex
      if (
        index < room.game.currentTurnIndex ||
        room.game.currentTurnIndex >= room.game.turnOrder.length
      ) {
        room.game.currentTurnIndex = Math.max(
          0,
          room.game.currentTurnIndex - 1
        );
      }

      // re-calculate the dense rank of other player again
      const totalSorted = Object.values(room.players)
        .map((p) => ({ id: p.id, score: p.score }))
        .sort((a, b) => b.score - a.score);

      const totalRanks = assignDenseRanks(totalSorted);

      io.to(roomId).emit("game:sync-rank", { ranks: totalRanks });

      //check if current/active(who is drawing) Player is left then timeout the round and change turn
      if (room.game.currentTurn?.currentPlayerId === playerId) {
        io.to(roomId).emit("turn:timeout");
        changeTurn(roomId);
      }
    }

    io.to(roomId).emit("chat:message", {
      message: `${player.name} left the room`,
      sender: "system",
      messageType: MessageTypes.ALERT,
      timestamp: Date.now(),
    });

    io.to(roomId).emit("player-left", {
      playerId: player.id,
    });

    const remainingPlayers = Object.keys(room.players).length;
    if (remainingPlayers === 1) {
      endGame(roomId);
      console.log(`🏁 Game in room ${roomId} ended — only one player left.`);
    } else if (remainingPlayers === 0) {
      // no players left → cleanup
      if (roomTimers[roomId]) {
        clearTimeout(roomTimers[roomId].timeoutId);
        delete roomTimers[roomId];
      }
      delete rooms[roomId];
      console.log(`🗑️ Room ${roomId} deleted (no players left)`);
    }
  });
}
