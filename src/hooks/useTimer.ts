import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

interface UseTimerOptions {
  duration: number;
  isRunning: boolean;
  isHost: boolean;
  socket: Socket | null;
  roomId: string;
  onExpire?: () => void;
  onTick?: (timeLeft: number) => void;
  dependencies?: any[];
}

export const useTimer = ({
  duration,
  isRunning,
  isHost,
  socket,
  roomId,
  onExpire,
  onTick,
  dependencies = [],
}: UseTimerOptions) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Reset timer when question changes (dependencies change)
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, ...dependencies]);

  // ✅ Host emits timer updates
  useEffect(() => {
    if (!isRunning || !isHost || !socket) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;

        if (next <= 0) {
          clearInterval(intervalRef.current!);
          socket.emit("timer-expired", { roomId });
          onExpire?.();
          return 0;
        }

        socket.emit("timer-update", { roomId, timeLeft: next });
        onTick?.(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [isRunning, isHost, socket, roomId]);

  // ✅ Non-host listens to host's timer
  useEffect(() => {
    if (!socket || isHost) return;

    const handleUpdate = (data: { roomId: string; timeLeft: number }) => {
      if (data.roomId === roomId) {
        setTimeLeft(data.timeLeft);
      }
    };

    socket.on("timer-update", handleUpdate);

    return () => {
      socket.off("timer-update", handleUpdate); // ✅ now it's a void-returning cleanup
    };
  }, [socket, isHost, roomId]);

  return { timeLeft, isExpired: timeLeft === 0 };
};
