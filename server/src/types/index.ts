export interface Player {
  id: string;
  name: string;
  avatar: AvatarType;
  isHost: boolean;
  rank: number;
  score: number;
}

export interface AvatarType {
  id: number;
  src: string;
  alt: string;
}

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
  messageType: string;
}

export interface InGameSettings {
  players: string;
  drawTime: string;
  rounds: string;
  wordCount: string;
  hints: string;
  customWords: string[];
}
export interface Room {
  owner: Player;
  players: Record<string, Player>;
  chat: ChatMessage[];
  gameSetting: InGameSettings;
  isGameStarted: boolean;
  canvas: CanvasPath[];
  turnOrder: string[];
  currentTurnIndex: number;
}

// types/canvas.ts
export type Point = {
  x: number;
  y: number;
};

export type CanvasPath = {
  strokeColor: string;
  strokeWidth: number;
  drawMode: boolean;
  paths: Point[];
};
