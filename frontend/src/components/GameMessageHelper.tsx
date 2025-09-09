import Image from "next/image";
import { Animate } from "./Animate";

interface WordGuessingHelperProps {
  text: string;
  avatar?: string;
}

export function GameMessageHelper({
  message,
  isShowAvatar,
}: {
  message: WordGuessingHelperProps;
  isShowAvatar: boolean;
}) {
  return (
    <div className="flex justify-center items-center bg-blue-950 flex-col gap-3">
      <Animate>
        <p className="text-white font-bold text-5xl text-center">
          {message.text}
        </p>
        {isShowAvatar && message.avatar && (
          <Image src={message.avatar} alt="avatar" height={100} width={100} />
        )}
      </Animate>
    </div>
  );
}
