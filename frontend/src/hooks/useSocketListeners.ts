// hooks/useSocketListeners.ts
import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  updateGameState,
  updateGameSettings,
  updateRoomId,
  setIsMyTurn,
  updateCurrRoundNumber,
} from "@/store/gameSlice";
import { useRouter } from "next/navigation";
import { Player } from "@/types/Player";
import { GameState } from "@/enums";
import { useSocket } from "@/context/socketContext";
import { InGameSettings } from "@/types/Game";
import { setHost } from "@/store/userSlice";
import { toast } from "react-toastify";
import { CanvasPath } from "react-sketch-canvas";
import { addCanvasPath, clearCanvas, setCanvasPaths } from "@/store/canvaSlice";
import { Chat } from "@/types/Chat";
import { addChat } from "@/store/chatSlice";
import {
  resetRound,
  setRoundMessage,
  setTimmer,
  setWordsList,
  startRound,
} from "@/store/roundSlice";
import { RoundMessage } from "@/types/Round";
import { setPlayers } from "@/store/playerSlice";

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
    }) => {
      if (success) {
        console.log("room joined");
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
      dispatch(setCanvasPaths(paths));
    };

    const handleAddCanvaPaths = (paths: CanvasPath) => {
      dispatch(addCanvasPath(paths));
    };

    const handleClearCanvaPaths = () => {
      dispatch(clearCanvas());
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
      message: RoundMessage | undefined;
    }) => {
      dispatch(setIsMyTurn(isMyTurn));
      dispatch(setWordsList(words));
      dispatch(setTimmer(duration));
      dispatch(updateCurrRoundNumber(currentRound));
      console.log(message);
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
