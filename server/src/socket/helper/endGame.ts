import { io } from "../../server";
import { rooms, roomTimers } from "../../store";
import { FinalPlayerScore } from "../../types";
import { assignDenseRanks } from "../../utils";

export function endGame(roomId: string) {
  const room = rooms[roomId];
  if (!room || !room.game) return;

  // --- 1. Prepare final scores payload ---
  const players = Object.values(room.players);

  // Sort by score
  const sorted = players
    .map((p) => ({ id: p.id, score: p.score }))
    .sort((a, b) => b.score - a.score);

  // Assign ranks (dense)
  const ranks = assignDenseRanks(sorted);

  // Final payload
  const finalScores: FinalPlayerScore[] = players
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      score: p.score,
      rank: ranks[p.id] ?? players.length, // fallback if missing
      isHost: p.isHost,
      isPlayerTurn: p.isPlayerTurn,
    }))
    .sort((a, b) => a.rank - b.rank);

  // 📢 Broadcast game end + leaderboard
  io.to(roomId).emit("game:ended", finalScores);

  // --- 2. Reset game state ---
  Object.values(room.players).forEach((player) => {
    player.score = 0;
    player.isPlayerTurn = false;
  });

  room.game = {
    currentTurnIndex: 0,
    roundNumber: 0,
    currentTurn: undefined,
    turnOrder: [],
    canvas: [],
    wordsCollection: [],
    score: new Map<string, number>(),
  };

  // 🧹 Cleanup
  if (roomTimers[roomId]) {
    clearTimeout(roomTimers[roomId]);
    delete roomTimers[roomId];
  }
  delete room.game;
}
