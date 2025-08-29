"use client";

import { useRef } from "react";

export function useDebounce() {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    delay = 500
  ) {
    return (...args: Parameters<T>): void => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      timeoutId.current = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }

  return debounce;
}
