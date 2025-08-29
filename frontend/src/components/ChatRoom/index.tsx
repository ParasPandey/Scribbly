import { useAppSelector } from "@/store/hooks";
import { Chat } from "@/types/Game";
import clsx from "clsx";
import { SearchField } from "./SerchField";

export const ChatRoom = () => {
  const { chats } = useAppSelector((state) => state.game);

  return (
    <div className="chat-room bg-white rounded-sm shadow-sm overflow-hidden pt-1 pb-1">
      <div className="chat-messages overflow-y-auto h-[90%] mb-4">
        {/* Chat messages will be displayed here */}
        {chats?.map((chat: Chat, index) => (
          <div
            key={index}
            className={clsx(
              "chat-notification flex align-center p-1 pl-2 font-bold text-sm",
              (index + 1) % 2 === 0 ? "bg-gray-100" : "bg-white",
              chat.messageType === "room-creation" && " text-[#ffa843]",
              chat.messageType === "room-join" && " text-[#57cd27]",
              chat.messageType === "room-leave" && " text-[#ce4e0c]",
              chat.messageType === "info" && " text-[#e2cb00]"
            )}
          >
            {chat.sender === "system" ? (
              `${chat.message}`
            ) : (
              <>
                <strong> {chat.sender}:</strong>
                <span className="text-black font-normal pl-1">
                  {chat.message}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
      <SearchField />
    </div>
  );
};
