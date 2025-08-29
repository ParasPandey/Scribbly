"use client";
import Image from "next/image";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import IconButton from "@mui/material/IconButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAvatar } from "@/store/userSlice";
import { getAvatarImages } from "@/utils/getAvatar";
import { AvatarType } from "@/types/Avatar";

export function Avatar() {
  const dispatch = useAppDispatch();
  const selectedAvatar = useAppSelector((state) => state.user.selectedAvatar);
  const avatars: AvatarType[] = getAvatarImages();

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
  return (
    <div className="flex justify-center bg-[#123695]/80 p-3 flex-col gap-3 rounded-md">
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
