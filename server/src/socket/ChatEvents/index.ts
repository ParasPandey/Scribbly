import { io } from "../..";
import { playerToSocket, rooms, roomTimers, socketToPlayer } from "../../store";
import { MessageTypes, SocketType } from "../../types";
import { isCloseGuess, isCorrectGuess } from "../helper";
import { handleTurnTimeout } from "../helper/handleTurnTimeout";

export function ChatEvents(socket: SocketType) {
  socket.on(
    "chat:send",
    ({
      message,
      roomId,
      senderId,
    }: {
      message: string;
      roomId: string;
      senderId: string;
    }) => {
      const room = rooms[roomId];
      if (!room) return;

      const playerId = socketToPlayer[socket.id]?.playerId;
      if (!playerId || playerId !== senderId) return;

      const currentTurn = room.game?.currentTurn;
      const isGameRunning: boolean =
        room.isGameStarted && !!currentTurn?.selectedWord;

      // 🎯 Case 1: current drawer (send only to self)
      if (isGameRunning && playerId === currentTurn!.currentPlayerId) {
        io.to(socket.id).emit("chat:message", {
          message,
          sender: senderId,
          messageType: MessageTypes.SELF,
          timestamp: Date.now(),
        });
        return;
      }

      // 🎯 Case 2: correct guess
      const correct = isCorrectGuess(
        message,
        playerId,
        currentTurn,
        isGameRunning
      );
      if (isGameRunning && correct) {
        const systemMsg = {
          message: `${room.players[playerId].name} guessed the word!`,
          sender: "system",
          messageType: MessageTypes.CORRECTLY_GUESSED,
          timestamp: Date.now(),
        };

        Object.keys(room.players).forEach((pid) => {
          const sid = playerToSocket[pid];
          if (sid) io.to(sid).emit("chat:message", systemMsg);
        });

        io.to(roomId).emit("player:guessed", {
          playerId,
          name: room.players[playerId].name,
        });

        // ✅ check if all guessers are done
        const totalGuessers = room.game!.turnOrder.length - 1;
        if (currentTurn!.guessedBy!.size === totalGuessers) {
          console.log(
            "✅ Everyone guessed correctly. Skipping to next turn..."
          );

          if (roomTimers[roomId]) {
            clearTimeout(roomTimers[roomId].timeoutId);
            delete roomTimers[roomId];
          }

          setTimeout(() => {
            handleTurnTimeout(roomId);
          }, 2000);
        }
        return;
      }

      // 🎯 Case 3: normal chat message
      const chatMessage = {
        message,
        sender: senderId,
        messageType: MessageTypes.DEFAULT,
        timestamp: Date.now(),
      };

      room.chat.push(chatMessage);
      io.to(roomId).emit("chat:message", chatMessage);

      // 🎯 Case 4: if guess is not correct but partially correct or close guess(only to self)
      const isClose = isCloseGuess(
        message,
        playerId,
        currentTurn,
        isGameRunning
      );
      if (isGameRunning && isClose) {
        // only send to self
        io.to(socket.id).emit("chat:message", {
          message: `You are very close!`,
          sender: "system",
          messageType: MessageTypes.PARTIALLY_GUESSED,
          timestamp: Date.now(),
        });
        return;
      }
    }
  );
}
