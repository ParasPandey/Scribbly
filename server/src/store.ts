import { Room, RoomTimer } from "./types";

// In-memory state
export const rooms: Record<string, Room> = {};
export const socketToPlayer: Record<
  string,
  { roomId: string; playerId: string }
> = {};
export const playerToSocket: Record<string, string> = {};
export const roomTimers: Record<string, RoomTimer> = {};
