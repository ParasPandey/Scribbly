import { useState } from "react";
import { useSocket } from "@/context/socketContext";
import { useAppSelector } from "@/store/hooks";

export function SearchField() {
  const [input, setInput] = useState("");

  const { roomId } = useAppSelector((state) => state.game);

  const socket = useSocket();
  const user = useAppSelector((state) => state.user);
  const onSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input) {
      if (!input.trim()) return;
      socket.emit("chat:send", {
        message: input.trim(),
        roomId: roomId,
        senderId: user.uuid,
      });
      setInput("");
    }
  };
  return (
    <div className="chat-input flex border rounded items-center mx-1 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
      <input
        type="text"
        id="chat-input"
        placeholder="Type your guess here..."
        className="w-full px-1.5 py-1.5 border-none focus:outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onSubmit}
        maxLength={100}
      />
      {input && (
        <span className=" text-black-400 w-6 h-full text-sm">
          {input.length}
        </span>
      )}
    </div>
  );
}
