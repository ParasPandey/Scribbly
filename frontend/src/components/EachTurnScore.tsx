import { RoundScores } from "@/types/Round";
import { Animate } from "./Animate";

interface EachTurnScoreProps {
  scores: RoundScores[];
  word: string;
  message: string | undefined;
}

export function EachTurnScore({ scores, word, message }: EachTurnScoreProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-white bg-blue-950">
      <Animate>
        {/* Message Section */}
        <div className=" flex flex-col text-center mb-2 gap-2">
          <p className="text-4xl font-bold">
            The word was <span className="text-[#ffdfb4]">{word}</span>
          </p>
          <p className="text-xl text-gray-300">{message}</p>
        </div>

        {/* Scores Section */}
        <div
          className="max-w-md w-[320px] max-h-100 overflow-y-auto flex flex-col gap-0.5
             pr-5 custom-scrollbar"
        >
          {scores.map((score, i) => (
            <div
              key={score.name + i}
              className="grid grid-cols-[1fr_auto] items-center text-xl font-semibold w-full"
            >
              {/* Player Name */}
              <div>{score.name}</div>

              {/* Score (always aligned right) */}
              <div
                className={`text-right ${
                  score.score > 0 ? "text-[#15db17]" : "text-red-500"
                }`}
              >
                {score.score > 0 ? `+${score.score}` : score.score}
              </div>
            </div>
          ))}
        </div>
      </Animate>
    </div>
  );
}
