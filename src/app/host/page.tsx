"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ParticleBackground from "@/components/ParticleBackground";
import { motion } from "framer-motion";

export default function HostStartPage() {
  const router = useRouter();

  const handleCreateGame = async () => {
    const token = localStorage.getItem("jwt");
    const res = await fetch("/api/games/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        entryFeeBps: 500,
        minDeposit: 1 * 1e9, // 1 SOL
        endTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 mins from now
        prizeDistribution: [40, 30, 10, 10],
      }),
    });

    const data = await res.json();
    if (data.success) {
      router.push(`/lobby/${data.gameId}`);
    } else {
      alert("❌ Failed to create game");
      console.error(data);
    }
  };

  return (
    <>
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 min-h-screen flex items-center justify-center"
      >
        <div className="bg-black/60 p-10 rounded-lg border border-gray-700 shadow-lg text-center">
          <h1 className="text-4xl font-bold text-golden-400 mb-6">
            Host a New Quiz Game
          </h1>
          <p className="text-gray-400 mb-8">
            Click below to deploy a pool on-chain and start the lobby.
          </p>
          <button
            onClick={handleCreateGame}
            className="neo-button px-6 py-3 bg-golden-400 text-black font-semibold rounded hover:bg-golden-500 transition"
          >
            🚀 Create Game
          </button>
        </div>
      </motion.div>
    </>
  );
}
