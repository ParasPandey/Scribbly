import { WORD_GUESSING_TIME } from "../../constants";
import { io } from "../../server";
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

    // emit word-selection event
    io.to(currentSocketId).emit("turn:word-selection", {
      isMyTurn: true,
      words: words,
      duration: WORD_GUESSING_TIME,
      currentRound: room.game?.roundNumber,
      message: null,
    });

    // notify all others
    Object.keys(room.players).forEach((pid) => {
      if (pid !== currentPlayerId) {
        const sid = playerToSocket[pid];
        if (sid) {
          io.to(sid).emit("turn:word-selection", {
            isMyTurn: false,
            words: [],
            duration: WORD_GUESSING_TIME,
            currentRound: room.game?.roundNumber,
            message: {
              text: `${room.players[currentPlayerId].name} is choosing a word!!`,
              avatar: room.players[currentPlayerId].avatar.src,
            },
          });
        }
      }
    });

    // only for now will update this
    // io.to(roomId).emit("room-players", {
    //   players: room.players,
    // });

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
