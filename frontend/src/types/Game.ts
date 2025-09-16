import { JSX } from "react";
import { RoundState } from "./Round";
import { CanvasPath } from "react-sketch-canvas";
import { GameState } from "@/enums";

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

export interface JoinGame {
  gamePhase: GameState;
  canvas?: CanvasPath[];
  currentTurn?: Partial<RoundState>;
  roundNumber: number;
}
