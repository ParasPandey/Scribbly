import { JSX } from "react";

export interface GameSettingOption {
  icon: JSX.Element;
  label: string;
  options: number[];
  default: number;
  disabled: boolean;
}

export interface Chat {
  message: string;
  sender: string;
  messageType: string;
  timestamp?: string;
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
