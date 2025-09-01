import { useAppSelector } from "@/store/hooks";
import AccessAlarmIcon from "@mui/icons-material/AccessAlarm";
import { useEffect, useRef, useState } from "react";

export function Watch() {
  const { isRoundStarted, timmer } = useAppSelector(
    (state) => state.game.currRound
  );

  const drawTime = useAppSelector((state) => state.game.gameSettings.drawTime);
  const [timeLeft, setTimeLeft] = useState(timmer);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If round starts, initialize timer
    if (isRoundStarted) {
      setTimeLeft(timmer); // reset countdown

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup if round ends OR component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRoundStarted, timmer]);

  return (
    <div className="clock flex items-center gap-1">
      <AccessAlarmIcon sx={{ height: 50, width: 50 }} />
      <span className="text-xl font-bold">
        {isRoundStarted ? timeLeft : drawTime} sec
      </span>
    </div>
  );
}
