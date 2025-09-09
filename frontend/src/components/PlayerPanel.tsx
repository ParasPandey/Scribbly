import { useAppSelector } from "@/store/hooks";
import PlayerCard from "./PlayerCard";
import { Player } from "@/types/Player";

export function PlayerPanel() {
  const { players } = useAppSelector((state) => state.players);
  const { currentTurnPlayerId } = useAppSelector((state) => state.round);
  const selfId = useAppSelector((state) => state.user.uuid);
  return (
    <div className="player-panel flex flex-col">
      {Object.values(players).map((player: Player, index: number) => (
        <PlayerCard
          key={player.id}
          isSelf={player.id === selfId}
          player={player}
          even={index % 2 === 0}
          isPlayerTurn={currentTurnPlayerId === player.id}
        />
      ))}
    </div>
  );
}
