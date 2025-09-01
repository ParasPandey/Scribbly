import { useDebounce } from "@/hooks/useDebounce";
import { useAppDispatch } from "@/store/hooks";
import { setName } from "@/store/userSlice";
import RoomButtons from "./RoomButtons";
import { Avatar } from "./Avatar";
import Image from "next/image";

export function PlayerSelection() {
  const debounce = useDebounce();
  const dispatch = useAppDispatch();
  const debouncedSetName = debounce((value: unknown) => {
    dispatch(setName(value as string));
  }, 200);
  return (
    <div className="flex flex-col gap-2 p-5 items-center">
      {/* here goes logo  */}
      <Image src="/logo.png" alt="logo" width={500} height={100} priority />
      <div className="flex justify-center bg-[#123695]/80 p-3 flex-col gap-3 w-100 rounded-md">
        <input
          type="text"
          onChange={(e) => debouncedSetName(e.target.value)}
          className="w-full border h-11 font-bold border-gray-300 rounded-md p-1.5 text-black bg-white
             focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your name..."
        />
        {/* Avatar selection */}
        <Avatar />
        <RoomButtons />
      </div>
    </div>
  );
}
