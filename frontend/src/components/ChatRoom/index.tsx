import { useAppSelector } from "@/store/hooks";
import clsx from "clsx";
import { SearchField } from "./SerchField";
import { Chat } from "@/types/Chat";

export const ChatRoom = () => {
  const { chats } = useAppSelector((state) => state.chat);

  return (
    <div className="chat-room bg-white rounded-sm shadow-sm overflow-hidden pt-1 pb-1">
      <div className="chat-messages overflow-y-auto h-[90%] mb-4">
        {/* Chat messages will be displayed here */}
        {chats?.map((chat: Chat, index: number) => (
          <div
            key={index}
            className={clsx(
              "chat-notification flex align-center p-1 pl-2 font-bold text-sm text-black",
              (index + 1) % 2 === 0 ? "bg-gray-100" : "bg-white",
              chat.messageType === "room-creation" && " !text-[#ffa844]",
              chat.messageType === "room-join" && " !text-[#57cd27]",
              chat.messageType === "room-leave" && " !text-[#d36835]",
              chat.messageType === "info" && " !text-[#e2cb00]",
              chat.messageType === "self" && " !text-[#8ab554]",
              chat.messageType === "start-drawing" && " !text-[#6895d6]",
              chat.messageType === "correctly-guessed" &&
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
      </div>
      <SearchField />
    </div>
  );
};
