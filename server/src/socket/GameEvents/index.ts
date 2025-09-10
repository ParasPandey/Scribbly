import { shuffle } from "lodash";
import { playerToSocket, rooms, roomTimers, socketToPlayer } from "../../store";
import { InGameSettings, SocketType } from "../../types";
import { getCurrentPlayerId, getRandomWords } from "../../utils";
import { words } from "../../data/words";
import { io } from "../..";
import { changeTurn } from "../helper/changeTurn";
import { startTurn } from "../helper/startTurn";
import { announceRound, handleWordSelected } from "./GameEventHandlers";

export function GameEvents(socket: SocketType) {
  // Update Game settings
  socket.on(
    "update-game-settings",
    (roomId: string, newSettings: Partial<InGameSettings>) => {
      const room = rooms[roomId];
      if (!room) return;

      // only owner before game starts
      const isOwner = room.owner.id === socketToPlayer[socket.id]?.playerId;
      if (!isOwner || room.isGameStarted) return;

      room.gameSetting = { ...room.gameSetting, ...newSettings };
      io.to(roomId).emit("game-settings", {
        gameSetting: room.gameSetting,
      });
    }
  );
  // Game Start Event
  socket.on("game:start", (roomId: string) => {
    const room = rooms[roomId];
    if (!room) return;

    const playerIds = Object.keys(room.players);
    const order = shuffle(playerIds);

    const minWordCount = order.length * room.gameSetting.rounds;
    const wordsCollection = getRandomWords(words, minWordCount + 10);

    room.isGameStarted = true;

    const score = new Map<string, number>();
    order.forEach((playerId) => {
      score.set(playerId, 0); // initialize everyone's score to 0
    });

    room.game = {
      canvas: [],
      turnOrder: order,
      currentTurnIndex: 0,
      roundNumber: 1,
      wordsCollection,
      currentTurn: {
        wordOptions: [],
      },
      score: score,
    };

    io.to(roomId).emit("game:start");
    // ⏳ Announce Round 1 → then start first turn
    announceRound(roomId, 1, () => startTurn(roomId));
  });

  // word selected → start timer here
  socket.on(
    "turn:word-selected",
    ({ roomId, word }: { roomId: string; word: string }) => {
      console.log(`⚡ manual-picked word: ${word}`);
      handleWordSelected(roomId, socket.id, word);
    }
  );

  // manual turn change (or client timeout event)
  socket.on("turn:change", (roomId: string) => changeTurn(roomId));
  socket.on("turn:timeout", ({ roomId }: { roomId: string }) =>
    changeTurn(roomId)
  );
}
