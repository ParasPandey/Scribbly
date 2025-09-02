export interface RoundState {
  wordsList: string[];
  selectedWord: string;
  isRoundStarted: boolean;
  timmer: number;
  message?: RoundMessage;
}

export interface RoundMessage {
  text: string;
  avatar: string;
}
