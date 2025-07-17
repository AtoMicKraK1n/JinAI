"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import StartLobby from "@/components/StartLobby";
import ParticleBackground from "@/components/ParticleBackground";
import socket from "@/lib/socket"; // ✅ use shared socket

export default function LobbyPage() {
  const { gameId } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.userId);
    } catch (err) {
      console.error("❌ Failed to extract userId from JWT:", err);
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    if (!gameId || !userId) return;

    const token = localStorage.getItem("jwt");
    if (!token) return;

    // ✅ Connect socket once
    if (!socket.connected) {
      socket.connect();
    }

    // 🛠️ DEBUG: Connection
    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket:", socket.id);
    });

    const joinGame = async () => {
      try {
        const res = await fetch("/api/games/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ gameId }),
        });

        const data = await res.json();
        if (!data.success) {
          console.error("❌ Failed to join pool:", data.message);
          return;
        }

        console.log("📡 Emitting join-game");
        socket.emit("join-game", { gameId, token });
      } catch (err) {
        console.error("Join game error:", err);
      }
    };

    joinGame();

    socket.on("player-joined", (data) => {
      console.log("📥 player-joined event received:", data);
      setPlayers((prev) => {
        const exists = prev.some((p) => p.userId === data.userId);
        if (exists) return prev;
        return [
          ...prev,
          {
            userId: data.userId,
            wallet: data.username || `anon_${data.userId.slice(0, 4)}`,
          },
        ];
      });
    });

    socket.on("start-game", () => {
      router.push(`/game/${gameId}`);
    });

    return () => {
      socket.off("player-joined");
      socket.off("start-game");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [gameId, userId]);

  return (
    <>
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 min-h-screen px-6 pt-32"
      >
        <StartLobby players={players} />
      </motion.div>
    </>
  );
}
