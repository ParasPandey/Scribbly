import { useAppSelector } from "@/store/hooks";
import { AnimatePresence, motion } from "framer-motion";

import { ReactNode } from "react";

export function Animate({ children }: { children: ReactNode }) {
  const { gameState, isMyTurn } = useAppSelector((state) => state.game);

  const round = useAppSelector((state) => state.round);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameState + round.message + (isMyTurn ? "turn" : "notTurn")}
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center w-full h-full gap-5"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
