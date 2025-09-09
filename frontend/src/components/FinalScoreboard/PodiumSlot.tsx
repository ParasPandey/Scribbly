import { FinalPlayerScore } from "@/types/Player";
import Image from "next/image";
import { EachScoreDetail } from "./EachScoreDetail";

interface PodiumSlotProps {
  player: FinalPlayerScore;
  size: "sm" | "lg";
  highlight?: boolean;
  side?: "left" | "right";
}

export function PodiumSlot({ player, size, highlight, side }: PodiumSlotProps) {
  const isSmall = size === "sm";

  return (
    <div
      className={`flex flex-col items-center ${
        isSmall ? "h-[220px] w-[160px]" : "h-[260px] w-[200px]"
      }`}
    >
      <Image
        src={player.avatar.src}
        height={isSmall ? 100 : 110}
        width={isSmall ? 100 : 110}
        alt="avatar"
        className={isSmall ? "w-[100px] h-[100px]" : "w-[110px] h-[110px]"}
      />

      <div
        className={`flex flex-col items-center h-full w-full border-4 border-b-0 
          ${highlight ? "border-[#e7ba08] text-black" : "border-gray-400"} 
          ${side === "left" ? "rounded-t-lg rounded-r-none border-r-0" : ""} 
          ${side === "right" ? "rounded-t-lg rounded-l-none border-l-0" : ""} 
          ${!side && "rounded-t-lg"}
        `}
      >
        <EachScoreDetail
          name={player.name}
          score={player.score}
          rank={player.rank}
          isWinner={highlight}
        />
      </div>
    </div>
  );
}

export default function FinalScoreboard({
  finalScores,
}: {
  finalScores: FinalPlayerScore[];
}) {
  const winner = finalScores[0]; // assuming sorted by score

  return (
    <div className="flex bg-[#35394a] text-white">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-8">
          {winner.name} is the winner!
        </h1>

        <div className="flex items-end h-[250px] overflow-hidden">
          {finalScores[1] && (
            <PodiumSlot player={finalScores[1]} size="sm" side="left" />
          )}
          <PodiumSlot player={winner} size="lg" highlight />
          {finalScores[2] && (
            <PodiumSlot player={finalScores[2]} size="sm" side="right" />
          )}
        </div>
      </div>
    </div>
  );
}
