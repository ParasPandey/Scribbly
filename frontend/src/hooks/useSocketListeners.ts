// hooks/useSocketListeners.ts
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  updatePlayers,
  updateGameState,
  updateGameSettings,
  updateRoomId,
  addChat,
  setCanvaPaths,
  addCanvaPath,
  clearCanvaPaths,
  setIsMyTurn,
  updateWordsList,
  updateSelectedWord,
  resetRound,
  startRound,
  updateTimmer,
  updateCurrRoundNumber,
  updateMessage,
} from "@/store/gameSlice";
import { useRouter } from "next/navigation";
import { Player } from "@/types/Player";
import { GameState } from "@/enums";
import { useSocket } from "@/context/socketContext";
import { Chat, InGameSettings } from "@/types/Game";
import { setHost } from "@/store/userSlice";
import { toast } from "react-toastify";
import { CanvasPath } from "react-sketch-canvas";

export const useSocketListeners = () => {
  const dispatch = useAppDispatch();
  const socket = useSocket();
  const router = useRouter();

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
      player: Player;
    }) => {
      if (success) {
        dispatch(updateGameState(GameState.ROOM_CREATION));
        dispatch(updateRoomId(roomId));
        router.push(`/${roomId}`);
      }
    };

    const handleRoomPlayerUpdate = ({ players }: { players: Player[] }) => {
      dispatch(updatePlayers(players));
    };

    const handleRoomChatUpdate = (notification: Chat) => {
      dispatch(addChat(notification));
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
    };

    const handleSetCanvaPaths = (paths: CanvasPath[]) => {
      dispatch(setCanvaPaths(paths));
    };

    const handleAddCanvaPaths = (paths: CanvasPath) => {
      dispatch(addCanvaPath(paths));
    };

    const handleClearCanvaPaths = () => {
      dispatch(clearCanvaPaths());
    };
    const handleGameUserTurn = ({
      isMyTurn,
      words,
      duration,
      currentRound,
      message,
    }: {
      isMyTurn: boolean;
      words: string[];
      duration: number;
      currentRound: number;
      message: { text: string; avatar: string } | null;
    }) => {
      console.log("currentRound", currentRound);
      dispatch(setIsMyTurn(isMyTurn));
      dispatch(updateWordsList(words));
      dispatch(updateTimmer(duration));
      dispatch(updateCurrRoundNumber(currentRound));
      console.log(message);
      if (!isMyTurn && message) {
        dispatch(updateMessage(message));
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
      dispatch(clearCanvaPaths());
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("player-joined", handleRoomJoined);
    socket.on("room-players", handleRoomPlayerUpdate);
    socket.on("chat-message", handleRoomChatUpdate);
    socket.on("game-settings", handleGameSettingsUpdate);
    socket.on("room-error", handleRoomError);
    socket.on("game:start", handleRoomStart);
    socket.on("canvas:paths", handleSetCanvaPaths);
    socket.on("canvas:addPath", handleAddCanvaPaths);
    socket.on("canvas:clear", handleClearCanvaPaths);
    socket.on("turn:change", handleGameUserTurn);
    socket.on("game:round-started", handleRoundStarted);
    socket.on("turn:timeout", handleTurnTimeout);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("player-joined", handleRoomJoined);
      socket.off("room-players", handleRoomPlayerUpdate);
      socket.off("chat-message", handleRoomChatUpdate);
      socket.off("game-settings", handleGameSettingsUpdate);
      socket.off("room-error", handleRoomError);
      socket.off("game:start", handleRoomStart);
      socket.off("canvas:paths", handleSetCanvaPaths);
      socket.off("canvas:addPath", handleAddCanvaPaths);
      socket.off("canvas:clear", handleClearCanvaPaths);
      socket.off("turn:change", handleGameUserTurn);
      socket.off("game:round-started", handleRoundStarted);
      socket.off("turn:timeout", handleTurnTimeout);
    };
  }, [dispatch, router]);
};
