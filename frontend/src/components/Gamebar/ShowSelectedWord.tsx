import { useAppSelector } from "@/store/hooks";

export function ShowSelectedWord() {
  const { currRound, isMyTurn } = useAppSelector((state) => state.game);
  const { isRoundStarted, selectedWord } = currRound;
  const showSelectedText = isMyTurn && isRoundStarted;
  return (
    <>
      {/* round Not Started yes */}
      {!isRoundStarted && (
        <div className="flex justify-center uppercase font-bold text-2xl">
          WAITING...
        </div>
      )}

      {/* Round Started but not my turn */}
      {isRoundStarted && !isMyTurn && (
        <div className="flex justify-center uppercase gap-2 h-full p-2">
          {[...selectedWord].map((ch, i) =>
            ch === " " ? (
              <span key={i} className="uppercase text-gray-400 h-full"></span>
            ) : (
              <span
                key={i}
                className="flex items-end justify-center font-bold w-7 border-b-4 border-black h-full text-center text-2xl"
              >
                {/* {ch} */}
              </span>
            )
          )}
        </div>
      )}

      {showSelectedText && (
        <div className="flex justify-center uppercase font-bold text-2xl tracking-[5px]">
          {selectedWord}
        </div>
      )}
    </>
  );
}
