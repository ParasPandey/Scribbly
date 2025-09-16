import { ROUND_START_TIME } from "../../constants";
import { io } from "../..";
import { playerToSocket, rooms, roomTimers } from "../../store";
import { GamePhase, MessageTypes } from "../../types";
import { getCurrentPlayerId } from "../../utils";
import { handleTurnTimeout } from "../helper/handleTurnTimeout";
import { startRoomTimer } from "../helper/timmer";

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

  const currPlayer = room.players[currentPlayerId!];

  if (socketId !== currentSocketId && !currentPlayerId && currPlayer) {
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

  room.game.phase = GamePhase.TURN_STARTING;
  io.to(roomId).emit("game:round-started", {
    currentSelectedWord: word,
    duration: durationSec,
    startAt: Date.now(),
    gamePhase: room.game.phase,
  });

  const playerName = currPlayer.name;
  io.to(roomId).emit("chat:message", {
    message: `${playerName} start drawing!`,
    sender: "system",
    messageType: MessageTypes.START_DRAWING,
    timestamp: Date.now(),
  });

  // turn timer
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId].timeoutId);
    delete roomTimers[roomId];
  }

  const timerDuration = durationSec * 1000;

  startRoomTimer(roomId, timerDuration, () => {
    handleTurnTimeout(roomId);
  });
}

export function announceRound(
  roomId: string,
  round: number,
  callback: () => void
) {
  const room = rooms[roomId];
  if (!room || !room.game) return;

  room.game.phase = GamePhase.ROUND_ANNOUNCEMENT;

  io.to(roomId).emit("game:round-change", {
    message: `Round ${round}`,
    duration: ROUND_START_TIME,
    round: round,
    gamePhase: room.game.phase,
  });

  // after delay, continue with turn
  startRoomTimer(roomId, ROUND_START_TIME * 1000, () => {
    callback();
  });
}
