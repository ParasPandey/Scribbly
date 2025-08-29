import { useAppSelector } from "@/store/hooks";
import PlayerCard from "./PlayerCard";

export function PlayerPanel() {
  const playersJoined = useAppSelector((state) => state.game.playersJoined);
  const selfId = useAppSelector((state) => state.user.uuid);
  return (
    <div className="player-panel flex flex-col">
      {playersJoined.map((player, index) => (
        <PlayerCard
          key={player.id}
          isSelf={player.id === selfId}
          rank={player.rank}
          name={player.name}
          score={player.score}
          avatar={player.avatar}
          isAdmin={player.isHost}
          even={index % 2 === 0}
        />
      ))}
    </div>
  );
}
