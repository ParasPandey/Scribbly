import { Player } from "@/types/Player";
import Image from "next/image";

interface PlayerCardProps {
  player: Player;
  even: boolean;
  isSelf: boolean;
}
export default function PlayerCard({ player, even, isSelf }: PlayerCardProps) {
  return (
    <div
      className={`grid grid-cols-[1fr_3fr_1.3fr] gap-2 p-1 pl-3 pr-2 rounded-sm shadow-sm w-full 
        ${even ? "bg-white" : "bg-gray-200"} ${player.isPlayerTurn && "border-4 border-green-400"}`}
    >
      <div className="flex flex-col  justify-center">
        <span className="text-lg font-bold">#{player.rank}</span>
        {player.isHost && (
          <Image
            src="/crown.svg" // crown icon asset
            alt="Crown"
            width={24}
            height={24}
          />
        )}
      </div>
      <div className="flex flex-col items-center">
        <p className="text-[#4898fe] font-semibold text-center">
          {player.name} {isSelf && <span>(You)</span>}
        </p>
        <p className="text-sm text-gray-700">{player.score} points</p>
      </div>
      <div className="flex items-center justify-end">
        {player.isPlayerTurn && (
          <Image
            src="/pencil.png" // your pixel avatar
            alt="Pencil"
            width={30}
            height={40}
            className="!h-[40px]"
          />
        )}
        <Image
          src={player.avatar.src} // your pixel avatar
          alt="Avatar"
          width={40}
          height={40}
        />
      </div>
    </div>
  );
}
