import { shuffle } from "lodash";
import { Room } from "../types";

export function getRandomWords(words: string[], count: number): string[] {
  return shuffle(words).slice(0, count);
}

// ------------- helpers -------------
export const getCurrentPlayerId = (room: Room) =>
  room.game ? room.game.turnOrder[room.game.currentTurnIndex] : undefined;

// Assign dense ranks (1,1,2,3 style) based on scores
export function assignDenseRanks<T extends { id: string; score: number }>(
  players: T[]
): Record<string, number> {
  const ranks: Record<string, number> = {};
  let currentRank = 1;

  players.forEach((p, i) => {
    if (i > 0 && p.score < players[i - 1].score) {
      currentRank++; // only increment when score decreases
    }
    ranks[p.id] = currentRank;
  });

  return ranks;
}

// Speed bonus calculation
export function getSpeedBonus(
  secondsTaken: number,
  roundDuration: number
): number {
  const percent = (secondsTaken / roundDuration) * 100;

  if (percent <= 20) return 150;
  if (percent <= 40) return 100;
  if (percent <= 60) return 50;
  if (percent <= 80) return 30;
  return 15;
}
