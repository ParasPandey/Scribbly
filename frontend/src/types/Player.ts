import { AvatarType } from "./Avatar";

export interface Player {
  id: string;
  name: string;
  avatar: AvatarType;
  isHost: boolean;
  rank: number; // Optional, can be used for ranking players
  score: number; // Optional, can be used to track player scores
}
