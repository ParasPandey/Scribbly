import { io } from "../..";
import { rooms } from "../../store";
import { changeTurn } from "./changeTurn";
import { calculateScore } from "./scoreCalculation";

export function handleTurnTimeout(roomId: string) {
  // do points display, then changeTurn
  const { scores, isEveryPlayerGuessed } = calculateScore(roomId);
  const prevSelectedWord = rooms[roomId].game?.currentTurn?.selectedWord;

  let scoreMsg = isEveryPlayerGuessed
    ? "Everyone gussed the word!"
    : "Time is up!";

  console.log("final scores", rooms[roomId].players);
  io.to(roomId).emit("game:score", {
    scores: scores,
    message: scoreMsg,
    word: prevSelectedWord,
  });

  // console.log("scores", rooms[roomId].players);
  setTimeout(() => {
    io.to(roomId).emit("turn:timeout", { roomId });
    changeTurn(roomId);
  }, 5000);
}
