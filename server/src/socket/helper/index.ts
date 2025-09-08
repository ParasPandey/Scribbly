import { rooms } from "../../store";
import { TurnState } from "../../types";

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
