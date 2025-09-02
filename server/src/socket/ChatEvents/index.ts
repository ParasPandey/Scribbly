import { io } from "../../server";
import { rooms, socketToPlayer } from "../../store";
import { SocketType } from "../../types";

export function ChatEvents(socket: SocketType) {
  // chat
  socket.on(
    "chat-send",
    (chat: { message: string; sender: string; messageType: string }) => {
      const { roomId, playerId } = socketToPlayer[socket.id] || {};
      if (!roomId || !playerId) return;
      const room = rooms[roomId];
      if (!room) return;

      const chatMessage = {
        message: chat.message,
        sender: chat.sender,
        messageType: chat.messageType || "message",
        timestamp: Date.now(),
      };
      room.chat.push(chatMessage);
      io.to(roomId).emit("chat-message", chatMessage);
    }
  );
}
