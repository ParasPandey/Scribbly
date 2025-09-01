import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { CanvasPath, InGameSettings, Player, Room } from "./types";
import { v4 as uuidv4 } from "uuid";
import { shuffle } from "lodash";
import { words } from "./data/words";
import { getRandomWords } from "./utils";
import { startTurn } from "./helper/startTurn";
import { changeTurn } from "./helper/changeTurn";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("Game server is running 🚀"));

const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// In-memory state
export const rooms: Record<string, Room> = {};
export const socketToPlayer: Record<
  string,
  { roomId: string; playerId: string }
> = {};
export const playerToSocket: Record<string, string> = {};
export const roomTimers: Record<string, NodeJS.Timeout> = {};

// ------------- helpers -------------
export const getCurrentPlayerId = (room: Room) =>
  room.game ? room.game.turnOrder[room.game.currentTurnIndex] : undefined;

// ------------- sockets -------------
io.on("connection", (socket) => {
  // create room
  socket.on("create-private-room", (player: Player) => {
    const roomId = uuidv4();
    socket.join(roomId);

    const defaultSettings: InGameSettings = {
      players: 8,
      drawTime: 10,
      rounds: 3,
      wordCount: 3,
      hints: 2,
      customWords: [],
    };

    rooms[roomId] = {
      id: roomId,
      owner: player,
      players: { [player.id]: { ...player, isPlayerTurn: false } },
      chat: [],
      gameSetting: defaultSettings,
      isGameStarted: false,
      // game: undefined
    };

    socketToPlayer[socket.id] = { roomId, playerId: player.id };
    playerToSocket[player.id] = socket.id;

    io.to(roomId).emit("room-created", {
      success: true,
      roomId,
      host: true,
      timestamp: Date.now(),
    });

    const chatMessage = {
      message: `${player.name} is now the room owner!`,
      sender: "system",
      messageType: "room-creation",
      timestamp: Date.now(),
    };
    rooms[roomId].chat.push(chatMessage);
    io.to(roomId).emit("chat-message", chatMessage);

    io.to(roomId).emit("room-players", {
      players: Object.values(rooms[roomId].players),
    });
    io.to(roomId).emit("game-settings", {
      gameSetting: rooms[roomId].gameSetting,
    });
  });

  // join room
  socket.on(
    "join-room",
    ({ roomId, player }: { roomId: string; player: Player }) => {
      const room = rooms[roomId];
      if (!room)
        return socket.emit("room-error", { message: "Room not found" });

      socket.join(roomId);
      room.players[player.id] = { ...player, isPlayerTurn: false };
      socketToPlayer[socket.id] = { roomId, playerId: player.id };
      playerToSocket[player.id] = socket.id;

      io.to(roomId).emit("player-joined", {
        success: true,
        roomId,
        host: false,
        time: Date.now(),
      });

      const chatMessage = {
        message: `${player.name} joined the room`,
        sender: "system",
        messageType: "room-join",
        timestamp: Date.now(),
      };
      room.chat.push(chatMessage);
      io.to(roomId).emit("chat-message", chatMessage);

      io.to(roomId).emit("room-players", {
        players: Object.values(room.players),
      });

      if (room.isGameStarted) io.to(roomId).emit("game:start");
      else
        io.to(roomId).emit("game-settings", { gameSetting: room.gameSetting });

      // send existing canvas if a game is running
      if (room.game && room.game.canvas.length) {
        socket.emit("canvas:paths", room.game.canvas);
      }
    }
  );

  // update settings
  socket.on(
    "update-game-settings",
    (roomId: string, newSettings: Partial<InGameSettings>) => {
      const room = rooms[roomId];
      if (!room) return;

      // only owner before game starts
      const isOwner = room.owner.id === socketToPlayer[socket.id]?.playerId;
      if (!isOwner || room.isGameStarted) return;

      room.gameSetting = { ...room.gameSetting, ...newSettings };
      io.to(roomId).emit("game-settings", { gameSetting: room.gameSetting });
    }
  );

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

  // start game
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
    //   players: Object.values(room.players),
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

  // canvas: only current player can draw
  socket.on("canvas:paths", (roomId: string, paths: CanvasPath[]) => {
    const room = rooms[roomId];
    if (!room || !room.game) return;

    const currentPlayerId = getCurrentPlayerId(room);
    const currentSocketId = currentPlayerId
      ? playerToSocket[currentPlayerId]
      : undefined;

    if (socket.id === currentSocketId) {
      room.game.canvas = paths;
      socket.to(roomId).emit("canvas:paths", paths);
    } else {
      console.log(`❌ Blocked drawing attempt from ${socket.id}`);
    }
  });

  socket.on("canvas:clear", (roomId: string) => {
    const room = rooms[roomId];
    if (!room || !room.game) return;

    const currentPlayerId = getCurrentPlayerId(room);
    const currentSocketId = currentPlayerId
      ? playerToSocket[currentPlayerId]
      : undefined;

    if (socket.id === currentSocketId) {
      room.game.canvas = [];
      io.to(roomId).emit("canvas:clear");
    }
  });

  socket.on("canvas:undo", (roomId: string, paths: CanvasPath[]) => {
    const room = rooms[roomId];
    if (!room || !room.game) return;

    const currentPlayerId = getCurrentPlayerId(room);
    const currentSocketId = currentPlayerId
      ? playerToSocket[currentPlayerId]
      : undefined;

    if (socket.id === currentSocketId) {
      room.game.canvas = paths;
      socket.to(roomId).emit("canvas:paths", paths);
    }
  });

  // disconnect
  socket.on("disconnect", () => {
    const info = socketToPlayer[socket.id];
    if (!info) return;

    const { roomId, playerId } = info;
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players[playerId];
    delete room.players[playerId];
    delete socketToPlayer[socket.id];
    delete playerToSocket[playerId];

    io.to(roomId).emit("chat-message", {
      message: `${player?.name ?? "A player"} left the room`,
      sender: "system",
      messageType: "room-leave",
      timestamp: Date.now(),
    });

    io.to(roomId).emit("room-players", {
      players: Object.values(room.players),
    });

    // if empty, clean up
    if (Object.keys(room.players).length === 0) {
      if (roomTimers[roomId]) clearTimeout(roomTimers[roomId]);
      delete rooms[roomId];
      console.log(`🗑️ Room ${roomId} deleted (no players left)`);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
