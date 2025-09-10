import { io } from "../..";
import { playerToSocket, rooms, roomTimers, socketToPlayer } from "../../store";
import { MessageTypes, SocketType } from "../../types";
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

    io.to(roomId).emit("chat:message", {
      message: `${player?.name ?? "A player"} left the room`,
      sender: "system",
      messageType: MessageTypes.ALERT,
      timestamp: Date.now(),
    });

    io.to(roomId).emit("room-players", {
      players: room.players,
    });

    const remainingPlayers = Object.keys(room.players).length;
    if (remainingPlayers === 1) {
      endGame(roomId);
      console.log(`🏁 Game in room ${roomId} ended — only one player left.`);
    } else if (remainingPlayers === 0) {
      // no players left → cleanup
      if (roomTimers[roomId]) clearTimeout(roomTimers[roomId]);
      delete rooms[roomId];
      console.log(`🗑️ Room ${roomId} deleted (no players left)`);
    }
  });
}
