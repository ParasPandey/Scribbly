import { useAppSelector } from "@/store/hooks";
import SettingsIcon from "@mui/icons-material/Settings";
import { Watch } from "./Watch";
import { ShowSelectedWord } from "./ShowSelectedWord";

export function Gamebar() {
  const { rounds } = useAppSelector((state) => state.game.gameSettings);
  const { currentRoundNumber } = useAppSelector((state) => state.game);

  return (
    <div className="game-bar grid grid-cols-[max-content_1fr_max-content] bg-white gap-3 p-1 rounded-md items-center justify-between">
      <div className="flex items-center gap-8">
        <Watch />
        <div className="round text-xl font-bold">
          Round {currentRoundNumber} of {rounds}
        </div>
      </div>

      <ShowSelectedWord />
      <div className="flex justify-end items-center gap-3">
        <SettingsIcon sx={{ height: 40, width: 40, cursor: "pointer" }} />
      </div>
    </div>
  );
}
