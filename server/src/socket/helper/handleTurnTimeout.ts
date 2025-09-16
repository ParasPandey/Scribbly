import { roomTimers } from "./../../store";
import { io } from "../..";
import { rooms } from "../../store";
import { changeTurn } from "./changeTurn";
import { calculateScore } from "./scoreCalculation";
import { startRoomTimer } from "./timmer";
import { GamePhase } from "../../types";

export function handleTurnTimeout(roomId: string) {
  const room = rooms[roomId];
  if (!room || !room.game || !room.game.currentTurn) return;
  // do points display, then changeTurn
  const { scores, isEveryPlayerGuessed } = calculateScore(roomId);
  const prevSelectedWord = room.game.currentTurn?.selectedWord;

  room.game.phase = GamePhase.TURN_END;

  let scoreMsg = isEveryPlayerGuessed
    ? "Everyone gussed the word!"
    : "Time is up!";

  io.to(roomId).emit("game:score", {
    scores: scores,
    message: scoreMsg,
    word: prevSelectedWord,
  });

  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId].timeoutId);
    delete roomTimers[roomId];
  }

  startRoomTimer(roomId, 5000, () => {
    io.to(roomId).emit("turn:timeout", { roomId, gamePhase: room.game?.phase });
    changeTurn(roomId);
  });
}
