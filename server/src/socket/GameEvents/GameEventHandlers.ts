import { ROUND_START_TIME } from "../../constants";
import { io } from "../../server";
import { playerToSocket, rooms, roomTimers } from "../../store";
import { MessageTypes } from "../../types";
import { getCurrentPlayerId } from "../../utils";
import { changeTurn } from "../helper/changeTurn";
import { handleTurnTimeout } from "../helper/handleTurnTimeout";

export function handleWordSelected(
  roomId: string,
  socketId: string,
  word: string
) {
  const room = rooms[roomId];
  if (!room || !room.game || !room.game.currentTurn) return;

  const currentPlayerId = getCurrentPlayerId(room);
  const currentSocketId = currentPlayerId
    ? playerToSocket[currentPlayerId]
    : undefined;

  if (
    socketId !== currentSocketId &&
    !currentPlayerId &&
    room.players[currentPlayerId!]
  ) {
    console.log(`❌ Blocked invalid word selection by ${socketId}`);
    return;
  }

  // remove from pool so it doesn't repeat
  room.game.wordsCollection = room.game.wordsCollection.filter(
    (w) => w !== word
  );

  // set turn timing
  const durationSec = room.gameSetting.drawTime;
  room.game.currentTurn.selectedWord = word;
  room.game.currentTurn.startAt = Date.now();

  io.to(roomId).emit("game:round-started", {
    currentSelectedWord: word,
    duration: durationSec,
    startAt: Date.now(),
  });

  const playerName = room.players[currentPlayerId!].name;
  io.to(roomId).emit("chat:message", {
    message: `${playerName} start drawing!`,
    sender: "system",
    messageType: MessageTypes.START_DRAWING,
    timestamp: Date.now(),
  });

  // turn timer
  if (roomTimers[roomId]) clearTimeout(roomTimers[roomId]);
  roomTimers[roomId] = setTimeout(() => {
    handleTurnTimeout(roomId);
  }, durationSec * 1000);
}

export function announceRound(
  roomId: string,
  round: number,
  callback: () => void
) {
  io.to(roomId).emit("game:round-change", {
    message: `Round ${round}`,
    duration: ROUND_START_TIME,
    round: round,
  });

  // after delay, continue with turn
  setTimeout(callback, ROUND_START_TIME * 1000);
}
