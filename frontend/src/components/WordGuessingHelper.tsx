import Image from "next/image";

interface WordGuessingHelperProps {
  text: string;
  avatar: string;
}

export function WordGuessingHelper({
  message,
}: {
  message: WordGuessingHelperProps;
}) {
  console.log(message.avatar);
  return (
    <div className="flex justify-center items-center bg-blue-950 flex-col gap-3">
      <p className="text-white text-5xl">{message.text}</p>
      <Image src={message.avatar} alt="avatar" height={100} width={100} />
    </div>
  );
}
