import {
  GamePhase,
  InGameSettings,
  JoinGame,
  MessageTypes,
  Player,
  Room,
} from "../../types";
import { playerToSocket, rooms, socketToPlayer } from "../../store";
import { io } from "../..";
import { getRemainingTime } from "../helper/timmer";

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
  player: Player,
  socketId: string
) => {
  room.players[player.id] = { ...player, isPlayerTurn: false };
  socketToPlayer[socketId] = { roomId, playerId: player.id };
  playerToSocket[player.id] = socketId;

  io.to(socketId).emit("player-joined", {
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

  // if game already started
  if (room.isGameStarted && room.game) {
    // add player id to turnOrder and send all the data for current round and start the game
    room.game.turnOrder = [...room.game.turnOrder, player.id];

    const gameDetail: JoinGame = buildGameDetail(room);

    io.to(socketId).emit("game:join", gameDetail);
  } else
    io.to(roomId).emit("game-settings", {
      gameSetting: room.gameSetting,
    });
};

const buildGameDetail = (room: Room): JoinGame => {
  const { game } = room;
  if (!game) throw new Error("Game not started");

  const gamePhase = game.phase;
  const currPlayerId: string = room.game?.currentTurn
    ?.currentPlayerId as string;

  const gameDetail: JoinGame = {
    gamePhase,
    roundNumber: game.roundNumber,
    currentTurn: {
      timmer: getRemainingTime(room.id),
    },
  };

  switch (gamePhase) {
    case GamePhase.ROUND_ANNOUNCEMENT:
      gameDetail.currentTurn!.message = {
        text: `Round ${game.roundNumber}`,
      };
      break;

    case GamePhase.WORD_SELECTION:
      gameDetail.currentTurn = {
        ...gameDetail.currentTurn,
        currentTurnPlayerId: currPlayerId,
        message: {
          text: `${room.players[currPlayerId].name} is choosing a word!!`,
          avatar: room.players[currPlayerId].avatar.src,
        },
      };
      break;

    case GamePhase.TURN_STARTING:
      gameDetail.canvas = game.canvas;
      gameDetail.currentTurn = {
        ...gameDetail.currentTurn,
        currentTurnPlayerId: currPlayerId,
        selectedWord: game.currentTurn?.selectedWord,
      };
      break;
  }

  return gameDetail;
};
