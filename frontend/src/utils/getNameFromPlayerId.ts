import { Player } from "@/types/Player";

export function getNameFromPlayerId(
  players: Record<string, Player>,
  playerId: string
) {
  const player = players[playerId];
  if (!player) {
    return null;
  }
  return player.name;
}
