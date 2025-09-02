"use client";
import Image from "next/image";
import { Gamebar } from "@/components/Gamebar";
import { PlayerPanel } from "@/components/PlayerPanel";
import { ChatRoom } from "@/components/ChatRoom";
import { GameSettings } from "@/components/GameSettings";
import { useAppSelector } from "@/store/hooks";
import { GameState } from "@/enums";
import { PlayerSelection } from "@/components/PlayerSelection";
import { Canva } from "@/components/Canva";
import WordChossing from "@/components/WordChossing";
import { WordGuessingHelper } from "@/components/WordGuessingHelper";

export default function Game() {
  const { gameState, isMyTurn } = useAppSelector((state) => state.game);

  const round = useAppSelector((state) => state.round);

  if (gameState === GameState.USER_REGISTERING) {
    return <PlayerSelection />;
  }

  function renderContent() {
    if (gameState === GameState.ROOM_CREATION) {
      return <GameSettings />;
    }

    if (isMyTurn && !round.isRoundStarted) {
      return <WordChossing />;
    }

    if (!isMyTurn && !round.isRoundStarted && round.message) {
      return <WordGuessingHelper message={round.message} />;
    }

    return <Canva />;
  }

  return (
    <div className="w-[95%] max-w-[1320px] flex flex-col gap-2 mb-5">
      <Image src="/logo.png" alt="logo" width={350} height={100} />
      <Gamebar />
      <div className="game-wrapper h-[600px] grid grid-cols-[1.1fr_3fr_1.1fr] gap-2">
        <PlayerPanel />
        {renderContent()}
        <ChatRoom />
      </div>
    </div>
  );
}
