import { GAME_RESET_TIME } from "../../constants";
import { io } from "../../server";
import { rooms, roomTimers } from "../../store";
import { FinalPlayerScore } from "../../types";
import { assignDenseRanks } from "../../utils";
import { resetRoomData } from "./resetRoomData";

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

  roomTimers[roomId] = setTimeout(() => {
    resetRoomData(roomId);
    io.to(roomId).emit("room-players", {
      players: room.players,
    });
    io.to(roomId).emit("game:reset");
  }, GAME_RESET_TIME * 1000);
}
