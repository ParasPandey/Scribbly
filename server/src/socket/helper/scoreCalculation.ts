import { rooms } from "../../store";
import { Scores } from "../../types";
import { assignDenseRanks, getSpeedBonus } from "../../utils";

export function calculateScore(roomId: string): {
  scores: Scores[];
  isEveryPlayerGuessed: boolean;
} {
  const room = rooms[roomId];
  if (!room || !room.game || !room.game.currentTurn) {
    return { scores: [], isEveryPlayerGuessed: false };
  }

  const currentTurn = room.game.currentTurn;
  const startTime = currentTurn.startAt;
  const totalPlayers = Object.keys(room.players).length;

  if (!startTime) {
    return { scores: [], isEveryPlayerGuessed: false };
  }

  // --- Case: nobody guessed ---
  if (!currentTurn.guessedBy || currentTurn.guessedBy.size === 0) {
    const totalSorted = Object.values(room.players)
      .map((p) => ({ id: p.id, score: p.score }))
      .sort((a, b) => b.score - a.score);

    const totalRanks = assignDenseRanks(totalSorted);

    // Update player ranks in room
    for (const [id, rank] of Object.entries(totalRanks)) {
      room.players[id].rank = rank;
    }

    return {
      scores: Object.values(room.players).map((p) => ({
        playerId: p.id,
        playerName: p.name,
        roundScore: 0,
        roundRank: totalPlayers, // everyone tied at bottom
        totalScore: p.score,
        totalRank: totalRanks[p.id],
      })),
      isEveryPlayerGuessed: false,
    };
  }

  // --- Collect guesses ---
  const guesses = Array.from(currentTurn.guessedBy.entries())
    .map(([playerId, guessedAt]) => ({ playerId, guessedAt }))
    .sort((a, b) => a.guessedAt - b.guessedAt);

  const step = Math.floor(250 / Math.max(totalPlayers - 1, 1));
  const roundScores: Record<string, number> = {};

  // Guessers scoring
  guesses.forEach((guess, index) => {
    let score = Math.max(300 - index * step, 50);

    const timeTaken = Math.floor((guess.guessedAt - startTime) / 1000);
    score += getSpeedBonus(timeTaken, room.gameSetting.drawTime);

    roundScores[guess.playerId] = (roundScores[guess.playerId] ?? 0) + score;
    room.players[guess.playerId].score += score;
  });

  // Drawer scoring
  const drawerId = currentTurn.currentPlayerId;
  if (drawerId && room.players[drawerId]) {
    let drawerScore = Math.min(guesses.length * 75, 200);
    if (guesses.length === totalPlayers - 1) drawerScore += 50;

    roundScores[drawerId] = (roundScores[drawerId] ?? 0) + drawerScore;
    room.players[drawerId].score += drawerScore;
  }

  // --- Compute ranks (dense ranking) ---
  const roundSorted = Object.entries(roundScores)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
  const roundRanks = assignDenseRanks(roundSorted);

  const totalRanks = getFinalRanks(roomId); // ✅ also updates player.rank

  const isEveryPlayerGuessed = guesses.length === totalPlayers - 1;

  return {
    scores: Object.values(room.players).map((p) => ({
      playerId: p.id,
      playerName: p.name,
      roundScore: roundScores[p.id] ?? 0,
      roundRank: roundRanks[p.id] ?? totalPlayers,
      totalScore: p.score,
      totalRank: totalRanks[p.id],
    })),
    isEveryPlayerGuessed,
  };
}

/**
 * Returns dense ranking of players in a room based on total scores
 * and also updates `room.players[id].rank`.
 */
export function getFinalRanks(roomId: string): Record<string, number> {
  const room = rooms[roomId];
  if (!room) return {};

  const totalSorted = Object.values(room.players)
    .map((p) => ({ id: p.id, score: p.score }))
    .sort((a, b) => b.score - a.score);

  const ranks = assignDenseRanks(totalSorted);

  // ✅ Persist rank into room.players
  for (const [id, rank] of Object.entries(ranks)) {
    room.players[id].rank = rank;
  }

  return ranks;
}
