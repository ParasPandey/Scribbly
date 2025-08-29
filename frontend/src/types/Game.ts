import { JSX } from "react";

export interface GameSettingOption {
  icon: JSX.Element;
  label: string;
  options: string[];
  default: string;
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
  players: string;
  drawTime: string;
  rounds: string;
  wordCount: string;
  hints: string;
  customWords: string[];
}
