import { roomTimers } from "../../store";

export function startRoomTimer(
  roomId: string,
  duration: number,
  callback: () => void
) {
  const startTime = Date.now();
  const timeoutId = setTimeout(callback, duration);

  roomTimers[roomId] = { timeoutId, startTime, duration };
}

export function getRemainingTime(roomId: string): number {
  const timer = roomTimers[roomId];
  if (!timer) return 0;

  const elapsed = Date.now() - timer.startTime;
  const remaining = Math.max(timer.duration - elapsed, 0);
  return Math.ceil(remaining / 1000); // seconds
}
