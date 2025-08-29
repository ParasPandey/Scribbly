import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { CanvasPath, InGameSettings, Player, Room } from "./types";
import { v4 as uuidv4 } from "uuid";
import { shuffle } from "lodash";

const app = express();
app.use(cors());
app.use(express.json());

// Basic REST route
app.get("/", (_req, res) => {
  res.send("Game server is running 🚀");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// --- Store active rooms & players ---
const rooms: Record<string, Room> = {};
const socketToPlayer: Record<string, { roomId: string; playerId: string }> = {};
const playerToSocket: Record<string, string> = {}; // playerId → socketId

// Socket.IO connection
io.on("connection", (socket) => {
  // Create private room
  socket.on("create-private-room", (player: Player) => {
    const roomId = uuidv4(); // ✅ Use uuid instead of socket.id
    socket.join(roomId);
    console.log(`🔌 Room Created: ${roomId}`);
    rooms[roomId] = {
      owner: player,
      players: { [player.id]: player },
      chat: [],
      gameSetting: {
        players: "8",
        drawTime: "80",
        rounds: "3",
        wordCount: "3",
        hints: "2",
        customWords: [],
      },
      isGameStarted: false,
      canvas: [],
      turnOrder: [],
      currentTurnIndex: 0,
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

    io.to(roomId).emit("chat-message", chatMessage);

    rooms[roomId].chat.push(chatMessage);

    io.to(roomId).emit("room-players", {
      players: Object.values(rooms[roomId].players),
    });

    io.to(roomId).emit("game-settings", {
      gameSetting: rooms[roomId].gameSetting,
    });
  });

  // Join room
  socket.on(
    "join-room",
    ({ roomId, player }: { roomId: string; player: Player }) => {
      if (!rooms[roomId]) {
        socket.emit("room-error", { message: "Room not found" });
        return;
      }
      console.log(`👤 Player ${player.name} joining room ${roomId}`);
      socket.join(roomId);
      rooms[roomId].players[player.id] = player;

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
      rooms[roomId].chat.push(chatMessage);

      io.to(roomId).emit("chat-message", chatMessage);

      io.to(roomId).emit("room-players", {
        players: Object.values(rooms[roomId].players),
      });
      const isGameStarted = rooms[roomId].isGameStarted;
      if (isGameStarted) {
        io.to(roomId).emit("game:start");
      } else {
        io.to(roomId).emit("game-settings", {
          gameSetting: rooms[roomId].gameSetting,
        });
      }
      // Send existing canvas to newcomer
      const currentCanvas = rooms[roomId].canvas;
      if (currentCanvas && currentCanvas.length) {
        socket.emit("canvas:paths", currentCanvas);
      }
    }
  );

  // update game settings
  socket.on(
    "update-game-settings",
    (roomId: string, newSettings: Partial<InGameSettings>) => {
      const room = rooms[roomId];
      if (!room) return;

      // only owner can update
      if (
        room.owner.id !==
          room.players[socketToPlayer[socket.id]?.playerId]?.id &&
        room.isGameStarted
      )
        return;

      room.gameSetting = { ...room.gameSetting, ...newSettings };
      // broadcast update to all players
      io.to(roomId).emit("game-settings", {
        gameSetting: room.gameSetting,
      });
    }
  );

  // chat send
  socket.on(
    "chat-send",
    (chat: { message: string; sender: string; messageType: string }) => {
      const playerId = socketToPlayer[socket.id]?.playerId;
      const roomId = socketToPlayer[socket.id]?.roomId;
      const player = playerId ? rooms[roomId]?.players[playerId] : null;
      if (!player || !roomId) return;
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

  // game events
  socket.on("game:start", (roomId: string) => {
    const room = rooms[roomId];
    if (!room) return;

    // Shuffle playerIds for turn order
    const playerIds = Object.keys(room.players); // [playerId1, playerId2, ...]
    room.turnOrder = shuffle(playerIds);
    room.currentTurnIndex = 0;

    // Determine current player
    const currentPlayerId = room.turnOrder[room.currentTurnIndex];
    const currentSocketId = playerToSocket[currentPlayerId];

    // user turns
    if (currentSocketId) {
      io.to(currentSocketId).emit("user:user-turn", true);
    }

    // Grant read-only to others
    playerIds.forEach((pid) => {
      if (pid !== currentPlayerId) {
        const sid = playerToSocket[pid];
        if (sid) {
          io.to(sid).emit("user:user-turn", false);
        }
      }
    });

    // Broadcast turn order (so UI can show whose turn it is)
    room.isGameStarted = true;

    io.to(roomId).emit("game:turn-order", room.turnOrder);
    io.to(roomId).emit("game:start");
  });

  // --- Canvas events ---
  // // ✅ Handle drawing
  socket.on("canvas:paths", (roomId: string, paths: CanvasPath[]) => {
    const room = rooms[roomId];
    if (!room) return;

    const currentPlayerId = room.turnOrder[room.currentTurnIndex];
    const currentSocketId = playerToSocket[currentPlayerId];

    // Only current player can update canvas
    if (socket.id === currentSocketId) {
      room.canvas = paths; // keep latest state
      socket.to(roomId).emit("canvas:paths", paths);
    } else {
      console.log(`❌ Blocked drawing attempt from ${socket.id}`);
    }
  });

  // ✅ Handle clear
  socket.on("canvas:clear", (roomId: string) => {
    const room = rooms[roomId];
    if (!room) return;

    const currentPlayerId = room.turnOrder[room.currentTurnIndex];
    const currentSocketId = playerToSocket[currentPlayerId];
    if (socket.id === currentSocketId) {
      room.canvas = [];
      console.log("canvas:clear from", socket.id);
      io.to(roomId).emit("canvas:clear");
    } else {
      console.log(`❌ Blocked clear attempt from ${socket.id}`);
    }
  });

  // ✅ Handle undo
  socket.on("canvas:undo", (roomId: string, paths: CanvasPath[]) => {
    const room = rooms[roomId];
    if (!room) return;

    const currentPlayerId = room.turnOrder[room.currentTurnIndex];
    const currentSocketId = playerToSocket[currentPlayerId];

    if (socket.id === currentSocketId) {
      room.canvas = paths;
      console.log("canvas:undo from", socket.id);
      socket.to(roomId).emit("canvas:paths", paths);
    } else {
      console.log(`❌ Blocked undo attempt from ${socket.id}`);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const playerId = socketToPlayer[socket.id]?.playerId;
    const roomId = socketToPlayer[socket.id]?.roomId;
    const player = playerId ? rooms[roomId]?.players[playerId] : null;

    // check if player and roomId are valid
    if (!player || !roomId) return;
    const room = rooms[roomId];
    if (!room) return;

    console.log(
      `❌ User disconnected: ${socketToPlayer[socket.id]?.playerId}: ${
        player.name
      }`
    );

    delete room.players[playerId];
    delete socketToPlayer[socket.id];
    delete playerToSocket[playerId];
    io.to(roomId).emit("chat-message", {
      message: `${player.name} left the room`,
      sender: "system",
      messageType: "room-leave",
      timestamp: Date.now(),
    });

    io.to(roomId).emit("room-players", {
      players: Object.values(room.players),
    });

    // ✅ If room is empty, delete it
    if (Object.keys(room.players).length === 0) {
      delete rooms[roomId];
      console.log(`🗑️ Room ${roomId} deleted (no players left)`);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
