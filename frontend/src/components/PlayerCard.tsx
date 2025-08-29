import { AvatarType } from "@/types/Avatar";
import Image from "next/image";

interface PlayerCardProps {
  rank: number;
  name: string;
  score: number;
  avatar: AvatarType;
  isAdmin: boolean;
  even: boolean;
  isSelf: boolean;
}
export default function PlayerCard({
  rank,
  name,
  score,
  avatar,
  isAdmin,
  even,
  isSelf,
}: PlayerCardProps) {
  return (
    <div
      className={`grid grid-cols-[1fr_3fr_1.3fr] gap-2 p-1 pl-3 pr-2 rounded-sm shadow-sm w-full 
        ${even ? "bg-white" : "bg-gray-200"}`}
    >
      <div className="flex flex-col  justify-center">
        <span className="text-lg font-bold">#{rank}</span>
        {isAdmin && (
          <Image
            src="/crown.svg" // crown icon asset
            alt="Crown"
            width={24}
            height={24}
          />
        )}
      </div>
      <div className="flex flex-col items-center">
        <p className="text-blue-600 font-semibold">
          {name} {isSelf && <span className="text-gray-500">(You)</span>}
        </p>
        <p className="text-sm text-gray-700">{score} points</p>
      </div>
      <div className="flex items-center justify-center">
        <Image
          src={avatar.src} // your pixel avatar
          alt="Avatar"
          width={50}
          height={50}
        />
      </div>
    </div>
  );
}
