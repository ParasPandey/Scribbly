import { GamePhase, JoinGame, Room } from "../../types";
import { getRemainingTime } from "./timmer";

export const buildGameDetail = (room: Room): JoinGame => {
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
