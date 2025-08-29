import { useEffect, useRef, useState } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import CanvaButtons from "./CanvaButtons";
import { useSocket } from "@/context/socketContext";
import { useAppSelector } from "@/store/hooks";
import { CanvaMode } from "../../../enums";

export function Canva() {
  const socket = useSocket();
  const { roomId, canvasPaths, isMyTurn } = useAppSelector(
    (state) => state.game
  );
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [mode, setMode] = useState<CanvaMode>(CanvaMode.DRAW);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const debounceTimer = useRef<number | null>(null);

  const styles: React.CSSProperties = {
    borderBottom: "2px solid black",
    pointerEvents: !isMyTurn ? "none" : "auto",
  };

  useEffect(() => {
    async function updatepaths() {
      if (canvasRef.current) {
        await canvasRef.current.resetCanvas();
        await canvasRef.current.loadPaths(canvasPaths);
      }
    }
    updatepaths();
  }, [canvasPaths]);

  // Reflect mode to eraseMode method
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.eraseMode(mode === "erase");
  }, [mode]);

  // Debounced exporter to reduce chatter
  const emitPathsDebounced = () => {
    if (!canvasRef.current || !socket) return;

    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(async () => {
      const paths = await canvasRef.current!.exportPaths();
      socket.emit("canvas:paths", roomId, paths);
    }, 100); // tweak delay if needed
  };

  // onStroke fires whenever a stroke is updated/added
  const handleStroke = () => {
    if (isMyTurn) emitPathsDebounced();
  };

  return (
    <div className="bg-white rounded-sm overflow-hidden flex flex-col justify-around">
      <ReactSketchCanvas
        ref={canvasRef}
        style={styles}
        strokeWidth={strokeWidth}
        strokeColor={strokeColor}
        eraserWidth={strokeWidth}
        className={mode === "draw" ? "cursor-pencil" : "cursor-eraser"}
        onStroke={handleStroke} // fire when a stroke is done
      />
      {isMyTurn && (
        <CanvaButtons
          setStrokeColor={setStrokeColor}
          setMode={setMode}
          canvasRef={canvasRef}
          setStrokeWidth={setStrokeWidth}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          mode={mode}
        />
      )}
    </div>
  );
}
