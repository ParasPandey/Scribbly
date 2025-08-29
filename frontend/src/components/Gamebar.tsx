import { useAppSelector } from "@/store/hooks";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import SettingsIcon from "@mui/icons-material/Settings";
export function Gamebar() {
  const { rounds, drawTime } = useAppSelector(
    (state) => state.game.gameSettings
  );
  return (
    <div className="game-bar grid grid-cols-[1fr_minmax(120px,1fr)_1fr] bg-white gap-3 p-1 rounded-md items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="clock flex items-center gap-1">
          <AccessAlarmIcon sx={{ height: 50, width: 50 }} />
          <span className="text-xl font-bold">{drawTime} sec</span>
        </div>
        <div className="round text-xl font-bold">Round 1 of {rounds}</div>
      </div>

      <div className="flex justify-center">WAITING...</div>
      <div className="flex justify-end items-center gap-3">
        <SettingsIcon sx={{ height: 40, width: 40, cursor: "pointer" }} />
      </div>
    </div>
  );
}
