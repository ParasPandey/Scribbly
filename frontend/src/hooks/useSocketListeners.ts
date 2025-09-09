// hooks/useSocketListeners.ts
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateGameState,
  updateGameSettings,
  updateRoomId,
  setIsMyTurn,
  updateCurrRoundNumber,
  updateGameStarted,
  updateFinalScores,
} from "@/store/gameSlice";
import { useRouter } from "next/navigation";
import { FinalPlayerScore, Player } from "@/types/Player";
import { GameState } from "@/enums";
import { useSocket } from "@/context/socketContext";
import { InGameSettings, Scores } from "@/types/Game";
import { setHost } from "@/store/userSlice";
import { toast } from "react-toastify";
import { CanvasPath } from "react-sketch-canvas";
import { addCanvasPath, clearCanvas, setCanvasPaths } from "@/store/canvaSlice";
import { Chat } from "@/types/Chat";
import { addChat } from "@/store/chatSlice";
import {
  resetRound,
  setRoundMessage,
  setShouldDisplayScores,
  setTimmer,
  setWordsList,
  startRound,
  updateRoundScores,
} from "@/store/roundSlice";
import { RoundMessage, RoundScores } from "@/types/Round";
import { setPlayers, updatePlayerScores } from "@/store/playerSlice";
import { getNameFromPlayerId } from "@/utils/getNameFromPlayerId";

export const useSocketListeners = () => {
  const dispatch = useAppDispatch();
  const socket = useSocket();
  const router = useRouter();
  const { players } = useAppSelector((state) => state.players);

  useEffect(() => {
    const handleRoomCreated = ({
      success,
      roomId,
      host,
    }: {
      success: boolean;
      roomId: string;
      host: boolean;
    }) => {
      if (success) {
        dispatch(updateRoomId(roomId));
        dispatch(updateGameState(GameState.ROOM_CREATION));
        dispatch(setHost(host));
        router.push(`/${roomId}`);
      }
    };

    const handleRoomJoined = ({
      success,
      roomId,
    }: {
      success: boolean;
      roomId: string;
    }) => {
      if (success) {
        dispatch(updateGameState(GameState.ROOM_CREATION));
        dispatch(updateRoomId(roomId));
        router.push(`/${roomId}`);
      }
    };

    const handleRoomPlayerUpdate = ({
      players,
    }: {
      players: Record<string, Player>;
    }) => {
      dispatch(setPlayers(players));
    };

    const handleRoomChatUpdate = (notification: Chat) => {
      if (notification.sender === "system") {
        dispatch(addChat(notification));
      } else {
        const name = getNameFromPlayerId(players, notification.sender);
        if (name) {
          dispatch(addChat({ ...notification, sender: name }));
        }
      }
    };
    const handleGameSettingsUpdate = ({
      gameSetting,
    }: {
      gameSetting: InGameSettings;
    }) => {
      dispatch(updateGameSettings(gameSetting));
    };

    const handleRoomError = (error: { message: string }) => {
      console.error("Room error:", error.message);
      // Optionally, you can show an error message to the user
      toast.error(`${error.message}`);
    };

    const handleRoomStart = () => {
      dispatch(updateGameState(GameState.GAME_START));
      dispatch(updateGameStarted(true));
    };

    const handleSetCanvaPaths = (paths: CanvasPath[]) => {
      dispatch(setCanvasPaths(paths));
    };

    const handleAddCanvaPaths = (paths: CanvasPath) => {
      dispatch(addCanvasPath(paths));
    };

    const handleClearCanvaPaths = () => {
      dispatch(clearCanvas());
    };
    const handleStartingTurn = ({
      isMyTurn,
      words,
      duration,
      message,
    }: {
      isMyTurn: boolean;
      words: string[];
      duration: number;
      message: RoundMessage | undefined;
    }) => {
      //set new states
      dispatch(setIsMyTurn(isMyTurn));
      dispatch(setWordsList(words));
      dispatch(setTimmer(duration));
      if (!isMyTurn && message) {
        dispatch(setRoundMessage(message));
      }
    };

    const handleRoundStarted = ({
      currentSelectedWord,
      duration,
    }: {
      currentSelectedWord: string;
      duration: number;
    }) => {
      dispatch(
        startRound({ selectedWord: currentSelectedWord, timmer: duration })
      );
    };

    const handleTurnTimeout = () => {
      dispatch(resetRound());
      dispatch(setIsMyTurn(false));
      dispatch(clearCanvas());
    };

    const handleRoundChange = ({
      message,
      duration,
      round,
    }: {
      message: string;
      duration: number;
      round: number;
    }) => {
      dispatch(setTimmer(duration));
      dispatch(setRoundMessage({ text: message, avatar: "" }));
      dispatch(updateCurrRoundNumber(round));
    };

    const handleGameScore = ({
      scores,
      message,
    }: {
      scores: Scores[];
      message: string;
    }) => {
      const roundScores: RoundScores[] = scores
        .map((score) => {
          return {
            name: score.playerName,
            score: score.roundScore,
            rank: score.roundRank,
          };
        })
        .sort((a, b) => a.rank - b.rank);

      const totalScores = scores.map((score) => {
        return {
          playerId: score.playerId,
          score: score.totalScore,
          rank: score.totalRank,
        };
      });

      // 1. Update game score slice (if you still need it separately)
      dispatch(updateRoundScores(roundScores));
      dispatch(setRoundMessage({ text: message }));
      dispatch(setTimmer(0));
      dispatch(setShouldDisplayScores(true));

      // 2. Update player slice (merge score + rank into players)
      dispatch(updatePlayerScores(totalScores));
    };

    const handleGameEnd = (finalScores: FinalPlayerScore[]) => {
      console.log(finalScores);
      dispatch(updateGameState(GameState.COMPLETED));
      dispatch(updateFinalScores(finalScores));

      // reset other things which we don't need
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("player-joined", handleRoomJoined);
    socket.on("room-players", handleRoomPlayerUpdate);
    socket.on("chat:message", handleRoomChatUpdate);
    socket.on("game-settings", handleGameSettingsUpdate);
    socket.on("room-error", handleRoomError);
    socket.on("game:start", handleRoomStart);
    socket.on("canvas:paths", handleSetCanvaPaths);
    socket.on("canvas:addPath", handleAddCanvaPaths);
    socket.on("canvas:clear", handleClearCanvaPaths);
    socket.on("turn:word-selection", handleStartingTurn);
    socket.on("game:round-started", handleRoundStarted);
    socket.on("game:round-change", handleRoundChange);
    socket.on("turn:timeout", handleTurnTimeout);
    socket.on("game:score", handleGameScore);
    socket.on("game:ended", handleGameEnd);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("player-joined", handleRoomJoined);
      socket.off("room-players", handleRoomPlayerUpdate);
      socket.off("chat:message", handleRoomChatUpdate);
      socket.off("game-settings", handleGameSettingsUpdate);
      socket.off("room-error", handleRoomError);
      socket.off("game:start", handleRoomStart);
      socket.off("canvas:paths", handleSetCanvaPaths);
      socket.off("canvas:addPath", handleAddCanvaPaths);
      socket.off("canvas:clear", handleClearCanvaPaths);
      socket.off("turn:word-selection", handleStartingTurn);
      socket.off("game:round-started", handleRoundStarted);
      socket.off("game:round-change", handleRoundChange);
      socket.off("turn:timeout", handleTurnTimeout);
      socket.off("game:score", handleGameScore);
      socket.off("game:ended", handleGameEnd);
    };
  }, [dispatch, router, players]);
};
