import { useAppSelector } from "@/store/hooks";
import clsx from "clsx";
import { SearchField } from "./SerchField";
import { Chat } from "@/types/Chat";
import { MessageTypes } from "../../../enums";
import { useEffect, useRef } from "react";

export const ChatRoom = () => {
  const { chats } = useAppSelector((state) => state.chat);

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom when chats change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <div className="chat-room bg-white rounded-sm shadow-sm overflow-hidden pt-1 pb-1">
      <div className="chat-messages overflow-y-auto h-[90%] mb-4">
        {chats?.map((chat: Chat, index: number) => (
          <div
            key={index}
            className={clsx(
              "chat-notification flex align-center p-1 pl-2 font-bold text-sm text-black",
              (index + 1) % 2 === 0 ? "bg-gray-100" : "bg-white",
              chat.messageType === MessageTypes.ROOM_CREATION &&
                " !text-[#ffa844]",
              chat.messageType === MessageTypes.ROOM_JOIN && " !text-[#57cd27]",
              chat.messageType === MessageTypes.ALERT && " !text-[#cf5518]",
              chat.messageType === MessageTypes.INFO && " !text-[#e2cb00]",
              chat.messageType === MessageTypes.SELF && " !text-[#8ab554]",
              chat.messageType === MessageTypes.START_DRAWING &&
                " !text-[#6895d6]",
              chat.messageType === MessageTypes.PARTIALLY_GUESSED &&
                " !text-[#e2cb00]",
              chat.messageType === MessageTypes.CORRECTLY_GUESSED &&
                "!bg-[#e7ffdf] !text-[#57cd27]"
            )}
          >
            {chat.sender === "system" ? (
              `${chat.message}`
            ) : (
              <>
                <strong> {chat.sender}:</strong>
                <span className=" font-normal pl-1">{chat.message}</span>
              </>
            )}
          </div>
        ))}
        {/* Invisible div to scroll into view */}
        <div ref={messagesEndRef} />
      </div>
      <SearchField />
    </div>
  );
};
