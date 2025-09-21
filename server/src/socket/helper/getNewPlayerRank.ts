import { Room } from "../../types";

//  Helper: get new player rank
export function getNewPlayerRank(room: Room): number {
  const gameStarted = room.isGameStarted && room.game;
  const rankingNeeded =
    gameStarted &&
    Object.values(room.players).some((p) => p.score > 0 || p.rank !== 1);

  if (!rankingNeeded) return 1;

  const playersArr = Object.values(room.players);
  if (!playersArr.length) return 1;

  const lastRankPlayer = playersArr.reduce((max, p) =>
    p.rank > max.rank ? p : max
  );

  return lastRankPlayer.score === 0
    ? lastRankPlayer.rank
    : lastRankPlayer.rank + 1;
}
