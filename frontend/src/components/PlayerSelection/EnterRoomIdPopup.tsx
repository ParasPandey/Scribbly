import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useState } from "react";

interface EnterRoomIdPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (roomId: string) => void;
}

export default function EnterRoomIdPopup({
  open,
  onClose,
  onSubmit,
}: EnterRoomIdPopupProps) {
  const [value, setValue] = useState("");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        className:
          "w-[500px] max-w-[90%] rounded-2xl shadow-2xl bg-white p-2 m-0", // width + Tailwind
      }}
    >
      <DialogTitle className="text-xl font-bold text-center text-gray-800">
        Enter Room ID
      </DialogTitle>

      <DialogContent className="flex flex-col gap-4 !p-2 !pb-8">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter room code...."
          className="w-full border h-11 font-bold border-gray-300 rounded-md p-1.5 text-black bg-white
             focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </DialogContent>

      <DialogActions className="flex justify-end gap-3 px-6 pb-4">
        <Button
          onClick={onClose}
          className="!bg-[#2c8de7] h-12 hover:!bg-[#1f6bbd] !p-1 !text-white !w-30"
          sx={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit(value)}
          className="!bg-[#52e236] h-12 hover:!bg-[#44c12b] !p-1 !text-white !w-30"
          sx={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}
