import { useSocket } from "@/context/socketContext";
import { useAppSelector } from "@/store/hooks";
import React from "react";
import { Animate } from "./Animate";

const WordChossing = () => {
  const { roomId } = useAppSelector((state) => state.game);
  const { wordsList } = useAppSelector((state) => state.round);
  const socket = useSocket();

  function selectWord(word: string) {
    socket.emit("turn:word-selected", { roomId, word });
  }

  return (
    <div className="bg-[#35394a] flex flex-col justify-center items-center gap-5">
      <Animate>
        <p className="text-white text-5xl">Choose a word</p>
        <div className="flex gap-6 flex-wrap justify-center">
          {wordsList.map((word: string) => (
            <button
              className="flex justify-center items-center text-2xl text-white border-3 border-white p-2 
            font-bold cursor-pointer hover:scale-110 ransition-all duration-200"
              key={word}
              onClick={() => selectWord(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </Animate>
    </div>
  );
};

export default WordChossing;
