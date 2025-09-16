import { WORD_SELECTION_TIME } from "../../constants";
import { io } from "../..";
import { playerToSocket, rooms, roomTimers } from "../../store";
import { getRandomWords } from "../../utils";
import { handleWordSelected } from "../GameEvents/GameEventHandlers";
import { startRoomTimer } from "./timmer";
import { GamePhase } from "../../types";

export function startTurn(roomId: string) {
  const room = rooms[roomId];
  if (!room || !room.game) return;

  // clear previous timer if exists
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId].timeoutId);
    delete roomTimers[roomId];
  }

  // reset everyone first
  Object.values(room.players).forEach((p) => (p.isPlayerTurn = false));

  // determine current player
  const currentPlayerId = room.game.turnOrder[room.game?.currentTurnIndex];
  const currentSocketId = playerToSocket[currentPlayerId];

  if (currentSocketId) {
    room.players[currentPlayerId].isPlayerTurn = true;
    let words = getRandomWords(
      room.game.wordsCollection,
      room.gameSetting.wordCount
    );

    if (room.game.currentTurn) {
      room.game.currentTurn.wordOptions = words;
      room.game.currentTurn.currentPlayerId =
        room.game.turnOrder[room.game.currentTurnIndex];
    }

    room.game.phase = GamePhase.WORD_SELECTION;
    // emit change turn event
    io.to(currentSocketId).emit("turn:change-turn", {
      playerId: room.game?.currentTurn?.currentPlayerId,
      isMyTurn: true,
      currentRound: room.game?.roundNumber,
      words: words,
      duration: WORD_SELECTION_TIME,
      message: null,
      gamePhase: room.game.phase,
    });

    // notify all others
    Object.keys(room.players).forEach((pid) => {
      if (pid !== currentPlayerId) {
        const sid = playerToSocket[pid];
        if (sid) {
          // emit change turn event to others players
          io.to(sid).emit("turn:change-turn", {
            playerId: room.game?.currentTurn?.currentPlayerId,
            isMyTurn: false,
            currentRound: room.game?.roundNumber,
            words: [],
            duration: WORD_SELECTION_TIME,
            gamePhase: room.game?.phase,
            message: {
              text: `${room.players[currentPlayerId].name} is choosing a word!!`,
              avatar: room.players[currentPlayerId].avatar.src,
            },
          });
        }
      }
    });

    // 🔹 safety fallback: auto-pick random after 10s if no selection
    startRoomTimer(roomId, WORD_SELECTION_TIME * 1000, () => {
      if (!room.game?.currentTurn?.selectedWord) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        // 🔹 Call server-side handler directly
        handleWordSelected(roomId, currentSocketId, randomWord);
      }
    });
  }
}
