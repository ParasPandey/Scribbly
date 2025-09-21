import { rooms } from "../../store";
import { PlayerCreation, SocketType } from "../../types";
import { v4 as uuidv4 } from "uuid";
import { createRoom, joinRoom } from "./RoomEventHandlers";

export function RoomEvents(socket: SocketType) {
  // create room
  socket.on("create-private-room", (player: PlayerCreation) => {
    const roomId = uuidv4();
    socket.join(roomId);
    console.log("Created Room with Id: ", roomId);
    createRoom(player, roomId, socket.id);
  });

  // join room
  socket.on(
    "join-room",
    ({ roomId, player }: { roomId: string; player: PlayerCreation }) => {
      const room = rooms[roomId];
      if (!room)
        return socket.emit("room-error", { message: "Room not found" });

      // check if max players are joined
      const playerCount = Object.keys(room.players).length;
      if (playerCount >= room.gameSetting.players) {
        socket.emit("room-error", {
          message: "Room is full. Maximum player limit reached.",
        });
        return;
      }
      socket.join(roomId);
      console.log("Join Room with Id: ", roomId);

      joinRoom(room, roomId, player, socket.id, socket);
    }
  );
}
