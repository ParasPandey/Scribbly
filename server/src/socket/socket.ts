import { io } from "..";
import { RoomEvents } from "./RoomEvents";
import { GameEvents } from "./GameEvents";
import { ChatEvents } from "./ChatEvents";
import { CanvasEvents } from "./CanvasEvents";
import { DisconnectEvent } from "./DisconnectEvent";

export function runningSocket() {
  io.on("connection", (socket) => {
    // ---------ROOM EVENT------------
    RoomEvents(socket);

    // ---------CHAT EVENT------------
    ChatEvents(socket);

    // ---------GAME EVENT------------
    GameEvents(socket);

    // ---------CANVAS EVENT------------
    CanvasEvents(socket);

    // ---------DISCONNECT EVENT------------
    DisconnectEvent(socket);
  });
}
