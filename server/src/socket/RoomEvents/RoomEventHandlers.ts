import { InGameSettings, MessageTypes, Player, Room } from "../../types";
import { playerToSocket, rooms, socketToPlayer } from "../../store";
import { io } from "../..";

export const createRoom = (
  player: Player,
  roomId: string,
  socketId: string
) => {
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

  socketToPlayer[socketId] = { roomId, playerId: player.id };
  playerToSocket[player.id] = socketId;

  io.to(roomId).emit("room-created", {
    success: true,
    roomId,
    host: true,
    timestamp: Date.now(),
  });

  const chatMessage = {
    message: `${player.name} is now the room owner!`,
    sender: "system",
    messageType: MessageTypes.ROOM_CREATION,
    timestamp: Date.now(),
  };
  rooms[roomId].chat.push(chatMessage);

  io.to(roomId).emit("room-players", {
    players: rooms[roomId].players,
  });

  io.to(roomId).emit("game-settings", {
    gameSetting: rooms[roomId].gameSetting,
  });

  io.to(roomId).emit("chat:message", chatMessage);
};

export const joinRoom = (
  room: Room,
  roomId: string,
  player: Player,
  socketId: string
) => {
  room.players[player.id] = { ...player, isPlayerTurn: false };
  socketToPlayer[socketId] = { roomId, playerId: player.id };
  playerToSocket[player.id] = socketId;

  io.to(roomId).emit("player-joined", {
    success: true,
    roomId,
    host: false,
    time: Date.now(),
  });

  io.to(roomId).emit("room-players", {
    players: room.players,
  });
  const chatMessage = {
    message: `${player.name} joined the room`,
    sender: "system",
    messageType: MessageTypes.ROOM_JOIN,
    timestamp: Date.now(),
  };
  room.chat.push(chatMessage);

  io.to(roomId).emit("chat:message", chatMessage);

  if (room.isGameStarted) io.to(roomId).emit("game:start");
  else
    io.to(roomId).emit("game-settings", {
      gameSetting: room.gameSetting,
    });
};
