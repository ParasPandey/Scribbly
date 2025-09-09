export enum CanvaMode {
  ERASE = "erase",
  DRAW = "draw",
}

export enum MessageTypes {
  SYSTEM = "system",
  DEFAULT = "message",
  SELF = "self",
  INFO = "info",
  CORRECTLY_GUESSED = "correctly-guessed",
  PARTIALLY_GUESSED = "partially-guessed",
  START_DRAWING = "start-drawing",
  ROOM_Leave = "room-leave",
  ROOM_JOIN = "room-join",
  ROOM_CREATION = "room-creation",
}
