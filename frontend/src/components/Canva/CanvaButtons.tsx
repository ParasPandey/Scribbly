import BrushIcon from "@mui/icons-material/Brush";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import clsx from "clsx";
import { ReactSketchCanvasRef } from "react-sketch-canvas";
import { useSocket } from "@/context/socketContext";
import { useAppSelector } from "@/store/hooks";
import { CanvaMode } from "../../../enums";

interface CanvaButtonsProps {
  setStrokeColor: Dispatch<SetStateAction<string>>;
  setMode: Dispatch<SetStateAction<CanvaMode>>;
  canvasRef: RefObject<ReactSketchCanvasRef | null>;
  setStrokeWidth: Dispatch<SetStateAction<number>>;
  strokeColor: string;
  strokeWidth: number;
  mode: CanvaMode;
}

export default function CanvaButtons({
  setStrokeColor,
  setMode,
  canvasRef,
  setStrokeWidth,
  strokeColor,
  strokeWidth,
  mode,
}: CanvaButtonsProps) {
  const socket = useSocket();
  const { roomId, isMyTurn } = useAppSelector((state) => state.game);
  const handleStrokeColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStrokeColor(event.target.value);
  };

  function setDrawMode() {
    if (isMyTurn) {
      setMode(CanvaMode.DRAW);
      canvasRef.current?.eraseMode(false);
    }
  }

  function setEraseMode() {
    if (isMyTurn) {
      setMode(CanvaMode.ERASE);
      canvasRef.current?.eraseMode(true);
    }
  }

  const handleUndoClick = async () => {
    if (isMyTurn) {
      if (!canvasRef.current) return;
      await canvasRef.current.undo();
      // Sync after undo
      const paths = await canvasRef.current.exportPaths();
      socket.emit("canvas:undo", roomId, paths);
    }
  };

  const handleClearClick = async () => {
    if (isMyTurn) {
      if (!canvasRef.current) return;
      await canvasRef.current.clearCanvas();
      socket.emit("canvas:clear", roomId);
    }
  };
  return (
    <div
      className={`flex my-1 rounded-sm justify-around ${!isMyTurn && "hidden"}`}
    >
      <div className="flex gap-2 items-center ">
        <label htmlFor="color">Color:</label>
        <input
          type="color"
          value={strokeColor}
          onChange={handleStrokeColorChange}
          className="cursor-pointer appearance-none h-8 bg-gray-300 border border-black"
        />
      </div>
      <div className="flex gap-2 items-center">
        <label htmlFor="strokeWidth">Width:</label>
        <input
          id="strokeWidth"
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-full accent-black cursor-pointer"
        />
      </div>
      <div className="flex gap-2 items-center">
        <button
          className={clsx(
            "relative h-10 w-10 flex justify-center items-center cursor-pointer border border-black rounded-sm",
            mode === "draw" ? "bg-purple-300" : "bg-white"
          )}
          onClick={setDrawMode}
        >
          <span className="absolute top-0 left-1 text-[10px] font-bold text-black">
            B
          </span>
          <BrushIcon />
        </button>
        <button
          className={clsx(
            "relative h-10 w-10 flex justify-center items-center cursor-pointer border border-black rounded-sm",
            mode === "erase" ? "bg-purple-300 " : "bg-white"
          )}
          onClick={setEraseMode}
        >
          <span className="absolute top-0 left-1 text-[10px] font-bold text-black">
            E
          </span>
          <AutoFixHighIcon />
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <button
          className="relative h-10 w-10 flex justify-center items-center cursor-pointer bg-white border border-black rounded-sm"
          onClick={handleUndoClick}
        >
          <span className="absolute top-0 left-1 text-[10px] font-bold text-black">
            U
          </span>
          <UndoIcon />
        </button>
        <button
          className="relative h-10 w-10 flex justify-center items-center cursor-pointer bg-white border border-black rounded-sm"
          onClick={handleClearClick}
        >
          <span className="absolute top-0 left-1 text-[10px] font-bold text-black">
            C
          </span>
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}
