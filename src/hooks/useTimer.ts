import { useEffect, useRef, useState } from "react";

interface UseTimerProps {
  duration: number;
  isRunning: boolean;
  isHost: boolean;
  roomId: string;
  socket: any;
  onExpire: () => void;
  dependencies?: any[];
}

// useTimer.ts
export function useTimer({
  duration,
  isRunning,
  isHost,
  roomId,
  socket,
  onExpire,
  dependencies = [],
}: UseTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    setTimeLeft(duration);

    if (isHost) {
      socket.emit("timer-sync", { roomId, timeLeft: duration });
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // sync from host
  useEffect(() => {
    const handleTimerSync = ({ timeLeft: synced }) => {
      setTimeLeft(synced);
    };
    socket.on("timer-sync", handleTimerSync);
    return () => socket.off("timer-sync", handleTimerSync);
  }, []);

  // run timer if game started
  useEffect(() => {
    if (isRunning) startTimer();
    else clearTimer();
  }, [isRunning, ...dependencies]);

  return { timeLeft, startTimer };
}
