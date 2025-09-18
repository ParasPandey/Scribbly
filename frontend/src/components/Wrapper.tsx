"use client";

import React, { useEffect } from "react";
import { useSocketListeners } from "@/hooks/useSocketListeners";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import Loader from "./Loader";

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  useSocketListeners();
  const { isLoading } = useAppSelector((state) => state.game);

  const router = useRouter();

  useEffect(() => {
    // Handle reload / direct entry
    const navType = (
      performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming
    )?.type;

    if (navType === "reload") {
      router.replace("/");
    }

    // Handle back button
    const handlePopState = () => {
      router.replace("/");
      // push a dummy state so forward button is disabled
      window.history.replaceState(null, "", "/");
      window.location.reload();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  return (
    <>
      <div className="min-h-screen bg-[url('/bck1.png')] bg-cover bg-center flex justify-center">
        {children}
      </div>
      {isLoading && <Loader />}
    </>
  );
};

export default Wrapper;
