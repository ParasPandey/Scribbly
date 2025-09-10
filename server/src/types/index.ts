import { DefaultEventsMap, Socket } from "socket.io";

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
  guessedBy?: Map<string, number>;
  currentPlayerId?: string;
  startAt?: number;
}

export interface GussedBy {
  playerId: string;
  guessedAt: number;
}

// Game (per running match)
export interface GameState {
  canvas: CanvasPath[];
  turnOrder: string[];
  currentTurnIndex: number;
  roundNumber: number;
  wordsCollection: string[]; // pool for this game
  currentTurn?: TurnState;
  score: Map<string, number>;
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

export interface SocketType
  extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {}

export enum MessageTypes {
  SYSTEM = "system",
  DEFAULT = "message",
  SELF = "self",
  INFO = "info",
  CORRECTLY_GUESSED = "correctly-guessed",
  PARTIALLY_GUESSED = "partially-guessed",
  START_DRAWING = "start-drawing",
  ROOM_LEAVE = "room-leave",
  ROOM_JOIN = "room-join",
  ROOM_CREATION = "room-creation",
  ALERT = "alert",
}

export interface Scores {
  playerId: string;
  playerName: string;
  roundScore: number;
  roundRank: number;
  totalScore: number;
  totalRank: number;
}

export interface FinalPlayerScore
  extends Omit<Player, "isHost" | "isPlayerTurn"> {}
