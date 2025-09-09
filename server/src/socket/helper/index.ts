import { rooms } from "../../store";
import { TurnState } from "../../types";
import levenshtein from "js-levenshtein";

export function isRoom(roomId: string) {
  const room = rooms[roomId];
  return room;
}

export function isCorrectGuess(
  guess: string,
  playerId: string,
  currentTurn: TurnState | undefined,
  isGameRunning: boolean
): boolean {
  if (
    !isGameRunning ||
    !currentTurn?.selectedWord ||
    !currentTurn.selectedWord.trim()
  ) {
    return false;
  }

  const normalizedWord = currentTurn.selectedWord.toLowerCase();
  const normalizedGuess = guess.trim().toLowerCase();

  if (normalizedGuess === normalizedWord) {
    if (!currentTurn.guessedBy) {
      currentTurn.guessedBy = new Map<string, number>();
    }
    // Ensure guessedBy is always an object
    if (!currentTurn.guessedBy.has(playerId)) {
      currentTurn.guessedBy.set(playerId, Date.now());
    }
    return true;
  }

  return false;
}

export function isCloseGuess(
  guess: string,
  playerId: string,
  currentTurn: TurnState | undefined,
  isGameRunning: boolean
): boolean {
  if (
    !isGameRunning ||
    !currentTurn?.selectedWord ||
    !currentTurn.selectedWord.trim()
  ) {
    return false;
  }

  const g = guess.toLowerCase().trim();
  const w = currentTurn.selectedWord.toLowerCase().trim();

  // exact match already handled elsewhere
  if (g === w) return false;

  // 1. Small edit distance (typos)
  if (levenshtein(g, w) <= 2) return true;

  // 2. Plural / singular
  if (g + "s" === w || g === w + "s") return true;

  // 3. Partial substring (at least half length)
  if (w.includes(g) && g.length >= w.length / 2) return true;

  return false;
}
