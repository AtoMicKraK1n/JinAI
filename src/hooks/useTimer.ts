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

  // Host: emit tick updates
  useEffect(() => {
    if (!isRunning || !isHost || !socket) return;

    setTimeLeft(duration);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isHost, socket, roomId, ...dependencies]);

  // Non-host: listen for updates from socket
  useEffect(() => {
    if (!socket || isHost) return;

    const handleUpdate = (data: { roomId: string; timeLeft: number }) => {
      if (data.roomId === roomId) {
        setTimeLeft(data.timeLeft);
      }
    };

    socket.on("timer-update", handleUpdate);

    return () => {
      socket.off("timer-update", handleUpdate);
    };
  }, [socket, isHost, roomId]);

  return { timeLeft, isExpired: timeLeft === 0 };
};
