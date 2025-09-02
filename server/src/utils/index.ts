import { shuffle } from "lodash";
import { Room } from "../types";

export function getRandomWords(words: string[], count: number): string[] {
  return shuffle(words).slice(0, count);
}

// ------------- helpers -------------
export const getCurrentPlayerId = (room: Room) =>
  room.game ? room.game.turnOrder[room.game.currentTurnIndex] : undefined;
