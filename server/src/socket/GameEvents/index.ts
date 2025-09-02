import { shuffle } from "lodash";
import { playerToSocket, rooms, roomTimers, socketToPlayer } from "../../store";
import { InGameSettings, SocketType } from "../../types";
import { getCurrentPlayerId, getRandomWords } from "../../utils";
import { words } from "../../data/words";
import { io } from "../../server";
import { changeTurn } from "../helper/changeTurn";
import { startTurn } from "../helper/startTurn";

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
    room.game = {
      canvas: [],
      turnOrder: order,
      currentTurnIndex: 0,
      roundNumber: 1,
      wordsCollection,
      currentTurn: {
        wordOptions: [],
      },
    };

    io.to(roomId).emit("game:start");
    startTurn(roomId);

    // io.to(roomId).emit("room-players", {
    //   players: room.players
    // });
  });

  // word selected → start timer here
  socket.on(
    "turn:word-selected",
    ({ roomId, word }: { roomId: string; word: string }) => {
      const room = rooms[roomId];
      if (!room || !room.game || !room.game.currentTurn) return;

      const currentPlayerId = getCurrentPlayerId(room);
      const currentSocketId = currentPlayerId
        ? playerToSocket[currentPlayerId]
        : undefined;

      if (socket.id !== currentSocketId) {
        console.log(`❌ Blocked word selection by ${socket.id}`);
        return;
      }
      // remove from pool so it doesn't repeat
      room.game.wordsCollection = room.game.wordsCollection.filter(
        (w) => w !== word
      );

      // set turn timing
      const durationSec = room.gameSetting.drawTime;
      room.game.currentTurn.selectedWord = word;

      io.to(roomId).emit("game:round-started", {
        currentSelectedWord: word,
        duration: durationSec,
      });

      // server-side safety timer
      if (roomTimers[roomId]) clearTimeout(roomTimers[roomId]);
      roomTimers[roomId] = setTimeout(() => {
        io.to(roomId).emit("turn:timeout");
        changeTurn(roomId);
      }, durationSec * 1000);
    }
  );

  // manual turn change (or client timeout event)
  socket.on("turn:change", (roomId: string) => changeTurn(roomId));
  socket.on("turn:timeout", ({ roomId }: { roomId: string }) =>
    changeTurn(roomId)
  );
}
