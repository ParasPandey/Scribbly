import { io } from "../..";
import { playerToSocket, rooms, roomTimers, socketToPlayer } from "../../store";
import { SocketType } from "../../types";

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
      messageType: "room-leave",
      timestamp: Date.now(),
    });

    io.to(roomId).emit("room-players", {
      players: room.players,
    });

    // if empty, clean up
    if (Object.keys(room.players).length === 0) {
      if (roomTimers[roomId]) clearTimeout(roomTimers[roomId]);
      delete rooms[roomId];
      console.log(`🗑️ Room ${roomId} deleted (no players left)`);
    }
  });
}
