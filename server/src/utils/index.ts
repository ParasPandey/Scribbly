import { shuffle } from "lodash";

export function getRandomWords(words: string[], count: number): string[] {
  return shuffle(words).slice(0, count);
}
