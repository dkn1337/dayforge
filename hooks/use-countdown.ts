"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const completionTimestampRef = useRef<number | null>(null);

  const syncTime = useCallback(() => {
    if (!completionTimestampRef.current) return;

    const nextValue = Math.max(0, Math.ceil((completionTimestampRef.current - Date.now()) / 1000));
    setSecondsLeft(nextValue);

    if (nextValue === 0) {
      completionTimestampRef.current = null;
      setIsRunning(false);
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    if (!isRunning) return;

    syncTime();
    const interval = window.setInterval(syncTime, 500);
    return () => window.clearInterval(interval);
  }, [isRunning, syncTime]);

  const start = useCallback(() => {
    completionTimestampRef.current = Date.now() + secondsLeft * 1000;
    setIsRunning(true);
  }, [secondsLeft]);

  const pause = useCallback(() => {
    if (completionTimestampRef.current) {
      setSecondsLeft(Math.max(0, Math.ceil((completionTimestampRef.current - Date.now()) / 1000)));
    }
    completionTimestampRef.current = null;
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) pause();
    else start();
  }, [isRunning, pause, start]);

  const reset = useCallback((nextSeconds = initialSeconds) => {
    completionTimestampRef.current = null;
    setIsRunning(false);
    setSecondsLeft(nextSeconds);
  }, [initialSeconds]);


  return { secondsLeft, isRunning, toggle, reset, start, pause };
}
