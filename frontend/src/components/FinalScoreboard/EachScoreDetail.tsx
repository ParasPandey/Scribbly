import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
interface EachScoreDetailProps {
  name: string;
  score: number;
  rank: number;
  isWinner?: boolean;
}

export function EachScoreDetail({
  name,
  score,
  rank,
  isWinner = false,
}: EachScoreDetailProps) {
  return (
    <div
      className={`relative flex flex-col w-full h-full ${isWinner ? "text-[#e7ba08]" : "text-gray-400"}`}
    >
      <p className="p-1 text-2xl font-bold">#{rank}</p>
      {isWinner && (
        <EmojiEventsIcon className="absolute right-2 top-2 !h-10 !w-10" />
      )}
      <div className="flex flex-col items-center font-bold mt-2">
        <p>{name}</p>
        <p>{score} pts</p>
      </div>
    </div>
  );
}
