import { rooms } from "../../store";

export function isRoom(roomId: string) {
  const room = rooms[roomId];
  return room;
}
