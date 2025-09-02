import { io } from "../../server";
import { playerToSocket, rooms } from "../../store";
import { CanvasPath, SocketType } from "../../types";
import { getCurrentPlayerId } from "../../utils";

export function CanvasEvents(socket: SocketType) {
  // canvas: only current player can draw
  socket.on("canvas:paths", (roomId: string, paths: CanvasPath[]) => {
    const room = rooms[roomId];
    if (!room || !room.game) return;

    const currentPlayerId = getCurrentPlayerId(room);
    const currentSocketId = currentPlayerId
      ? playerToSocket[currentPlayerId]
      : undefined;

    if (socket.id === currentSocketId) {
      room.game.canvas = paths;
      socket.to(roomId).emit("canvas:paths", paths);
    } else {
      console.log(`❌ Blocked drawing attempt from ${socket.id}`);
    }
  });

  socket.on("canvas:clear", (roomId: string) => {
    const room = rooms[roomId];
    if (!room || !room.game) return;

    const currentPlayerId = getCurrentPlayerId(room);
    const currentSocketId = currentPlayerId
      ? playerToSocket[currentPlayerId]
      : undefined;

    if (socket.id === currentSocketId) {
      room.game.canvas = [];
      io.to(roomId).emit("canvas:clear");
    }
  });

  socket.on("canvas:undo", (roomId: string, paths: CanvasPath[]) => {
    const room = rooms[roomId];
    if (!room || !room.game) return;

    const currentPlayerId = getCurrentPlayerId(room);
    const currentSocketId = currentPlayerId
      ? playerToSocket[currentPlayerId]
      : undefined;

    if (socket.id === currentSocketId) {
      room.game.canvas = paths;
      socket.to(roomId).emit("canvas:paths", paths);
    }
  });
}
