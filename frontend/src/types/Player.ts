import { AvatarType } from "./Avatar";

export interface Player {
  id: string;
  name: string;
  avatar: AvatarType;
  isHost: boolean;
  rank: number;
  score: number;
  isPlayerTurn: boolean;
}
