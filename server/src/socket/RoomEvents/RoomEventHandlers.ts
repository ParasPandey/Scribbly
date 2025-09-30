import {
  GamePhase,
  InGameSettings,
  JoinGame,
  MessageTypes,
  Player,
  PlayerCreation,
  Room,
} from "../../types";
import { playerToSocket, rooms, socketToPlayer } from "../../store";
import { io } from "../..";
import { getRemainingTime } from "../helper/timmer";
import { Socket } from "socket.io";
import { buildGameDetail } from "../helper/buildGameDetail";
import { getNewPlayerRank } from "../helper/getNewPlayerRank";

export const createRoom = (
  player: PlayerCreation,
  roomId: string,
  socketId: string
) => {
  const defaultSettings: InGameSettings = {
    players: 8,
    drawTime: 50,
    rounds: 3,
    wordCount: 3,
    hints: 2,
    customWords: [],
  };

  const actualPlayer: Player = {
    ...player,
    score: 0,
    rank: 1,
    isPlayerTurn: false,
  };

  rooms[roomId] = {
    id: roomId,
    owner: actualPlayer,
    players: { [actualPlayer.id]: { ...actualPlayer, isPlayerTurn: false } },
    chat: [],
    gameSetting: defaultSettings,
    isGameStarted: false,
  };

  socketToPlayer[socketId] = { roomId, playerId: player.id };
  playerToSocket[player.id] = socketId;

  io.to(socketId).emit("room-created", {
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
  player: PlayerCreation,
  socketId: string,
  socket: Socket
) => {
  const isGameAlreadyStarted = !!(room.isGameStarted && room.game);

  // Create actual player
  const actualPlayer: Player = {
    ...player,
    score: 0,
    rank: 1,
    isPlayerTurn: false,
  };

  // Track player <-> socket mapping
  room.players[actualPlayer.id] = actualPlayer;
  socketToPlayer[socketId] = { roomId, playerId: actualPlayer.id };
  playerToSocket[actualPlayer.id] = socketId;

  // Notify player joined
  io.to(socketId).emit("player-joined", {
    success: true,
    roomId,
    host: false,
    time: Date.now(),
  });

  //  Assign correct rank
  room.players[actualPlayer.id].rank = getNewPlayerRank(room);

  //  Broadcast updates
  socket.to(roomId).emit("player-added", {
    player: room.players[actualPlayer.id],
  });
  io.to(socketId).emit("room-players", { players: room.players });

  //  Add chat system message
  const chatMessage = {
    message: `${actualPlayer.name} joined the room`,
    sender: "system",
    messageType: MessageTypes.ROOM_JOIN,
    timestamp: Date.now(),
  };
  room.chat.push(chatMessage);
  io.to(roomId).emit("chat:message", chatMessage);

  // if game already started
  if (isGameAlreadyStarted && room.game) {
    // add player id to turnOrder and send all the data for current round and start the game
    room.game.turnOrder = [...room.game.turnOrder, actualPlayer.id];

    const gameDetail: JoinGame = buildGameDetail(room);
    io.to(socketId).emit("game:join", gameDetail);
  } else {
    io.to(roomId).emit("game-settings", {
      gameSetting: room.gameSetting,
    });
  }
};
