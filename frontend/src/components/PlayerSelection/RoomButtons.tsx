"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Player } from "@/types/Player";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import EnterRoomIdPopup from "./EnterRoomIdPopup";
import { useSocket } from "@/context/socketContext";
import { updateIsLoading } from "@/store/gameSlice";

const RoomButtons = () => {
  const { name, selectedAvatar, uuid } = useAppSelector((state) => state.user);
  const { roomId } = useParams();
  const [showPopup, setShowPopup] = useState(false);
  const socket = useSocket();
  const dispatch = useAppDispatch();

  const PlayHandler = (roomId: string) => {
    // Handle play button click
    try {
      if (!name) {
        alert("Please enter your name before creating a room.");
        return;
      }

      if (!roomId || roomId === "undefined") {
        setShowPopup(true);
        return;
      }

      dispatch(updateIsLoading(true));
      // check url if it has roomId then join the room
      const player: Player = {
        id: uuid,
        name,
        avatar: selectedAvatar,
        isHost: false,
        rank: 1,
        score: 0,
        isPlayerTurn: false,
      };
      socket.emit("join-room", { roomId, player });
    } catch (e) {
      dispatch(updateIsLoading(false));
      console.error("Something went wrong..", e);
    }
  };

  const CreatePrivateRoomHandler = () => {
    try {
      // Handle play button click
      if (!name) {
        alert("Please enter your name before creating a room.");
        return;
      }
      dispatch(updateIsLoading(true));
      const player: Player = {
        name,
        avatar: selectedAvatar,
        id: uuid,
        isHost: true,
        rank: 1,
        score: 0,
        isPlayerTurn: false,
      };
      socket.emit("create-private-room", player);
    } catch (e) {
      dispatch(updateIsLoading(false));
      console.error("Something went wrong..", e);
    }
  };

  const OnPopupClose = () => {
    setShowPopup(false);
  };

  const OnPopupSuccess = (roomId: string) => {
    if (roomId.trim()) {
      PlayHandler(roomId); // retry PlayHandler with manualRoomId
      setShowPopup(false);
    }
  };

  return (
    <div className="flex justify-center flex-col gap-3">
      <Button
        variant="contained"
        className="!bg-[#52e236] h-15 hover:!bg-[#44c12b] !p-1"
        sx={{
          fontSize: "2rem",
          fontWeight: "bold",
          textTransform: "none",
        }}
        onClick={() => PlayHandler(String(roomId))}
      >
        Play!
      </Button>
      <Button
        variant="contained"
        className="!bg-[#2c8de7] h-12 hover:!bg-[#1f6bbd] !p-1"
        sx={{
          fontSize: "1.2rem",
          fontWeight: "bold",
          textTransform: "none",
        }}
        onClick={() => CreatePrivateRoomHandler()}
      >
        Create Private Room
      </Button>
      <EnterRoomIdPopup
        onClose={OnPopupClose}
        onSubmit={OnPopupSuccess}
        open={showPopup}
      />
    </div>
  );
};

export default RoomButtons;
