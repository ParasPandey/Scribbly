import { JSX } from "react";

export interface GameSettingOption {
  icon: JSX.Element;
  label: string;
  options: number[];
  default: number;
  disabled: boolean;
}
export interface Notification {
  message: string;
  messageType: string;
  timestamp?: string;
}

export interface InGameSettings {
  players: number;
  drawTime: number;
  rounds: number;
  wordCount: number;
  hints: number;
  customWords: string[];
}
export interface Scores {
  playerId: string;
  playerName: string;
  roundScore: number;
  roundRank: number;
  totalScore: number;
  totalRank: number;
}
