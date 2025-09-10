import { WORD_GUESSING_TIME } from "../../constants";
import { io } from "../..";
import { playerToSocket, rooms, roomTimers } from "../../store";
import { getRandomWords } from "../../utils";
import { handleWordSelected } from "../GameEvents/GameEventHandlers";

export function startTurn(roomId: string) {
  const room = rooms[roomId];
  if (!room || !room.game) return;

  // clear previous timer if exists
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
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

    // emit change turn event
    io.to(currentSocketId).emit("turn:change-turn", {
      playerId: room.game?.currentTurn?.currentPlayerId,
      isMyTurn: true,
      currentRound: room.game?.roundNumber,
      words: words,
      duration: WORD_GUESSING_TIME,
      message: null,
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
            duration: WORD_GUESSING_TIME,
            message: {
              text: `${room.players[currentPlayerId].name} is choosing a word!!`,
              avatar: room.players[currentPlayerId].avatar.src,
            },
          });
        }
      }
    });

    // 🔹 safety fallback: auto-pick random after 10s if no selection
    roomTimers[roomId] = setTimeout(() => {
      if (!room.game?.currentTurn?.selectedWord) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        console.log(`⚡ Auto-picked word: ${randomWord}`);

        // 🔹 Call server-side handler directly
        handleWordSelected(roomId, currentSocketId, randomWord);
      }
    }, WORD_GUESSING_TIME * 1000);
  }
}
