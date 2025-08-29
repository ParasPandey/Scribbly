"use client";
import { useSocket } from "@/context/socketContext";
import {
  setDrawTime,
  setHints,
  setNumberOfPlayers,
  setRounds,
  setWordCount,
} from "@/store/gameSlice";
import { useAppDispatch } from "@/store/hooks";
import { RootState } from "@/store/store";
import { GameSettingOption } from "@/types/Game";
import { useSelector } from "react-redux";

export default function SettingOption({
  setting,
}: {
  setting: GameSettingOption;
}) {
  const dispatch = useAppDispatch();
  const { roomId } = useSelector((state: RootState) => state.game);
  const socket = useSocket();
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    switch (setting.label) {
      case "Players":
        dispatch(setNumberOfPlayers(event.target.value));
        socket.emit("update-game-settings", roomId, {
          players: event.target.value,
        });
        break;
      case "Draw Time":
        dispatch(setDrawTime(event.target.value));
        socket.emit("update-game-settings", roomId, {
          drawTime: event.target.value,
        });
        break;
      case "Rounds":
        dispatch(setRounds(event.target.value));
        socket.emit("update-game-settings", roomId, {
          rounds: event.target.value,
        });
        break;
      case "Word Count":
        dispatch(setWordCount(event.target.value));
        socket.emit("update-game-settings", roomId, {
          wordCount: event.target.value,
        });
        break;
      case "Hints":
        dispatch(setHints(event.target.value));

        socket.emit("update-game-settings", roomId, {
          hints: event.target.value,
        });
        break;
      default:
        console.warn(`Unhandled setting: ${setting.label}`);
    }
  }
  return (
    <div
      key={setting.label}
      className="grid grid-cols-[1fr_1.2fr] gap-2 setting-item"
    >
      <div className="flex items-center gap-2">
        <div className="icon text-white">{setting.icon}</div>
        <span className="text-white">{setting.label}</span>
      </div>
      <select
        className="w-full p-2 bg-white text-black rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={setting.default}
        onChange={handleChange}
        disabled={setting.disabled}
      >
        {setting.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
