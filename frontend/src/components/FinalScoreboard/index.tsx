import { FinalPlayerScore } from "@/types/Player";
import { PodiumSlot } from "./PodiumSlot";

export default function FinalScoreboard({
  finalScores,
}: {
  finalScores: FinalPlayerScore[];
}) {
  const winner = finalScores[0];

  return (
    <div className="flex bg-[#35394a] text-white">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-8">
          <span className="text-[#edc49a]">{winner.name}s</span> is the winner!
        </h1>

        <div className="flex items-end h-[280px] overflow-hidden">
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
