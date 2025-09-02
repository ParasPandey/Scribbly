"use client";
import PersonIcon from "@mui/icons-material/Person";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import GamesIcon from "@mui/icons-material/Games";
import AbcIcon from "@mui/icons-material/Abc";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { GameSettingOption } from "@/types/Game";
import SettingOption from "./SettingOptions";
import Button from "@mui/material/Button";
import LinkIcon from "@mui/icons-material/Link";
import { useDebounce } from "@/hooks/useDebounce";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSocket } from "@/context/socketContext";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { Chat } from "@/types/Chat";
import { addChat } from "@/store/chatSlice";

export function GameSettings() {
  const { roomId } = useSelector((state: RootState) => state.game);
  const { isHost } = useSelector((state: RootState) => state.user);
  const socket = useSocket();
  const dispatch = useAppDispatch();
  const [customWords, setCustomWords] = useState<string>("");
  const debounce = useDebounce();
  const debouncedCustomWords = debounce((value: unknown) => {
    setCustomWords(value as string);
  }, 500);
  const { gameSettings } = useSelector((state: RootState) => state.game);

  const settings: GameSettingOption[] = [
    {
      icon: <PersonIcon sx={{ width: 30, height: 30 }} />,
      label: "Players",
      options: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      default: gameSettings.players,
      disabled: !isHost,
    },
    {
      icon: <AccessAlarmIcon sx={{ width: 30, height: 30 }} />,
      label: "Draw Time",
      options: [10, 50, 60, 70, 80, 90, 100, 120, 150, 180, 200],
      default: gameSettings.drawTime,
      disabled: !isHost,
    },
    {
      icon: <GamesIcon sx={{ width: 30, height: 30 }} />,
      label: "Rounds",
      options: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      default: gameSettings.rounds,
      disabled: !isHost,
    },
    {
      icon: <AbcIcon sx={{ width: 30, height: 30 }} />,
      label: "Word Count",
      options: [1, 2, 3, 4, 5],
      default: gameSettings.wordCount,
      disabled: !isHost,
    },
    {
      icon: <QuestionMarkIcon sx={{ width: 30, height: 30 }} />,
      label: "Hints",
      options: [0, 1, 2, 3, 4, 5],
      default: gameSettings.hints,
      disabled: !isHost,
    },
  ];

  const startGame = () => {
    // Dispatch custom words if any
    if (customWords) {
      const uniqueWords = new Set<string>();

      customWords.split(",").forEach((word) => {
        const trimmed = word.trim();
        if (trimmed.length > 0 && trimmed.length <= 32) {
          uniqueWords.add(trimmed);
        }
      });
      socket.emit("update-game-settings", roomId, {
        customWords: Array.from(uniqueWords),
      });
    }
    // Logic to start the game can be added here
    socket.emit("game:start", roomId);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/${roomId}`;
    navigator.clipboard.writeText(url);
    // socket.emit("chat-send", {
    //   message: `Copied room link to clipboard!`,
    //   sender: "system",
    //   messageType: "info",
    // });
    // instead of sending to everyone, just push to redux for self only,
    const chat: Chat = {
      message: `Copied room link to clipboard!`,
      sender: "system",
      messageType: "info",
    };
    dispatch(addChat(chat));
  };

  return (
    <div className="game-settings bg-[#35394a] p-2 rounded-sm shadow-sm flex flex-col gap-2">
      {settings.map((setting: GameSettingOption) => (
        <SettingOption key={setting.label} setting={setting} />
      ))}
      <div className="custom-words flex flex-col gap-1 mt-2">
        <p className="text-white font-semibold">Custom words</p>
        <textarea
          className="w-full p-2 bg-white text-black rounded-sm 
             focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
             disabled:bg-gray-200 disabled:opacity-70"
          placeholder="1-32 characters per word! 20000 characters maximum. Separated by a , (comma)"
          rows={11}
          maxLength={20000}
          onChange={(e) => debouncedCustomWords(e.target.value)}
          disabled={!isHost}
        />
      </div>
      <div className="grid grid-cols-[2fr_1fr] gap-1">
        <Button
          variant="contained"
          className="!bg-[#52e236] h-12 hover:!bg-[#44c12b] !p-1"
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textTransform: "none",
          }}
          onClick={startGame}
          disabled={!isHost}
        >
          Start!
        </Button>
        <Button
          variant="contained"
          className="!bg-[#2c8de7] h-12 hover:!bg-[#1f6bbd] !p-1"
          onClick={copyToClipboard}
          startIcon={
            <LinkIcon
              sx={{
                fontSize: "30px !important",
                transform: "rotate(-45deg)",
              }}
            />
          }
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Invite
        </Button>
      </div>
    </div>
  );
}
