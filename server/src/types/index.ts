// Avatar & Player
export interface AvatarType {
  id: number;
  src: string;
  alt: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: AvatarType;
  isHost: boolean;
  rank: number;
  score: number;
  isPlayerTurn: boolean;
}

// Chat
export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: number;
  messageType: string;
}

// Settings
export interface InGameSettings {
  players: number;
  drawTime: number; // seconds
  rounds: number;
  wordCount: number; // how many options shown to drawer
  hints: number;
  customWords: string[];
}

// Canvas
export type Point = { x: number; y: number };

export type CanvasPath = {
  strokeColor: string;
  strokeWidth: number;
  drawMode: boolean;
  paths: Point[];
};

// Turn (ephemeral)
export interface TurnState {
  wordOptions: string[]; // options visible to current drawer
  selectedWord?: string; // set after user picks
  startedAt?: number; // ms epoch, set after selection
  endsAt?: number; // ms epoch, set after selection
}

// Game (per running match)
export interface GameState {
  canvas: CanvasPath[];
  turnOrder: string[];
  currentTurnIndex: number;
  roundNumber: number;
  wordsCollection: string[]; // pool for this game
  currentTurn?: TurnState;
}

// Room (lobby + game container)
export interface Room {
  id: string;
  owner: Player;
  players: Record<string, Player>;
  chat: ChatMessage[];
  gameSetting: InGameSettings;
  isGameStarted: boolean;
  game?: GameState; // present only when a game is running
}
