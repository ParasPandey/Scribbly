"use client";
import Image from "next/image";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAvatar } from "@/store/userSlice";
import { getAvatarImages } from "@/utils/getAvatar";
import { AvatarType } from "@/types/Avatar";
import { useState } from "react";

export function Avatar() {
  const dispatch = useAppDispatch();
  const selectedAvatar = useAppSelector((state) => state.user.selectedAvatar);
  const avatars: AvatarType[] = getAvatarImages();

  const [isRolling, setIsRolling] = useState(false);

  const handleAvatarChange = (direction: "left" | "right") => {
    const currentIndex = avatars.findIndex(
      (avatar) => avatar.id === selectedAvatar.id
    );
    const nextIndex =
      direction === "left"
        ? (currentIndex - 1 + avatars.length) % avatars.length
        : (currentIndex + 1) % avatars.length;

    dispatch(setAvatar(avatars[nextIndex]));
  };

  const setRandomAvatar = () => {
    if (isRolling) return; // prevent double click
    setIsRolling(true);

    let counter = 0;
    const maxIterations = 15; // how many "flashes"
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * avatars.length);
      dispatch(setAvatar(avatars[randomIndex]));
      counter++;
      if (counter >= maxIterations) {
        clearInterval(interval);
        setIsRolling(false);

        // final avatar
        const finalIndex = Math.floor(Math.random() * avatars.length);
        dispatch(setAvatar(avatars[finalIndex]));
      }
    }, 100); // speed of shuffling
  };
  return (
    <div className="flex justify-center bg-[#123695]/80 p-3 flex-col rounded-m relative">
      <div className="absolute top-2 right-2">
        <IconButton
          onClick={setRandomAvatar}
          className="!p-0 absolute top-2 right-2 transition-all duration-200 hover:scale-130 hover:rotate-12
           hover:bg-white/20 rounded-full"
        >
          <Image
            src={"/dice.svg"}
            alt="dice svg"
            width={25}
            height={25}
            color="white"
          />
        </IconButton>
      </div>
      <div className="grid grid-cols-[1fr_minmax(120px,1fr)_1fr] gap-5 items-center">
        <div className="flex justify-end">
          <IconButton
            onClick={() => handleAvatarChange("left")}
            className="self-center w-10 h-10 transition-all duration-200 hover:scale-130"
          >
            <ChevronLeftIcon sx={{ fontSize: 40, color: "white" }} />
          </IconButton>
        </div>
        <Image
          src={selectedAvatar.src}
          alt={selectedAvatar.alt}
          width={100}
          height={100}
          className="rounded-full cursor-pointer w-30 h-30"
        />
        <div className="flex justify-start">
          <IconButton
            onClick={() => handleAvatarChange("right")}
            className="self-center w-10 h-10 transition-all duration-200 hover:scale-130"
          >
            <ChevronRightIcon sx={{ fontSize: 40, color: "white" }} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
