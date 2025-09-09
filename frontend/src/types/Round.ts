export interface RoundState {
  wordsList: string[];
  selectedWord: string;
  isRoundStarted: boolean;
  timmer: number;
  message?: RoundMessage;
  isRoundChange: boolean;
  roundScores?: RoundScores[];
  shouldDisplayScores: boolean;
  currentTurnPlayerId: string | null;
}

export interface RoundMessage {
  text: string;
  avatar?: string;
}

export interface RoundScores {
  name: string;
  score: number;
  rank: number;
}
