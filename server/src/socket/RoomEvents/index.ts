import { rooms } from "../../store";
import { Player, SocketType } from "../../types";
import { v4 as uuidv4 } from "uuid";
import { createRoom, joinRoom } from "./RoomEventHandlers";

export function RoomEvents(socket: SocketType) {
  // create room
  socket.on("create-private-room", (player: Player) => {
    const roomId = uuidv4();
    socket.join(roomId);
    console.log("Created Room with Id: ", roomId);
    createRoom(player, roomId, socket.id);
  });

  // join room
  socket.on(
    "join-room",
    ({ roomId, player }: { roomId: string; player: Player }) => {
      const room = rooms[roomId];
      if (!room)
        return socket.emit("room-error", { message: "Room not found" });

      socket.join(roomId);
      console.log("Join Room with Id: ", roomId);

      joinRoom(room, roomId, player, socket.id);
      // send existing canvas if a game is running
      if (room.game && room.game.canvas.length) {
        socket.emit("canvas:paths", room.game.canvas);
      }
    }
  );
}
