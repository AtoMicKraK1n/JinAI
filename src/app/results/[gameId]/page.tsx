"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import ClaimPrizeButton from "@/components/ClaimPrizeButton"; // ✅ <-- Add this

interface PlayerResult {
  username: string;
  finalRank: number;
  finalScore: number;
}

export default function ResultsPage() {
  const { gameId } = useParams();
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      const token = sessionStorage.getItem("jwt");
      if (!token) {
        console.warn("⚠️ No JWT token found in sessionStorage");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/quiz/results?gameId=${gameId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (
          (data.success && Array.isArray(data.results)) ||
          data.message === "Already completed"
        ) {
          setResults(data.results);
        } else {
          console.error("❌ Failed to load results:", data.message || data);
        }
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchResults();
    }
  }, [gameId]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-400";
    return "text-white";
  };

  // Parse numeric pool index from gameId (you can adjust this if needed)
  const poolIndex = typeof gameId === "string" ? 0 : 0; // <-- Replace with actual logic if needed

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-20 px-4">
        <motion.h1
          className="text-4xl font-bold mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Final Results
        </motion.h1>

        {loading ? (
          <p className="text-lg">Loading results...</p>
        ) : results && results.length > 0 ? (
          <div className="bg-zinc-900 rounded-2xl shadow-lg p-6 w-full max-w-md">
            {results.map((player, index) => (
              <div
                key={index}
                className={`flex justify-between py-2 border-b border-zinc-700 ${
                  index === results.length - 1 ? "border-none" : ""
                }`}
              >
                <span
                  className={`font-semibold ${getMedalColor(player.finalRank)}`}
                >
                  #{player.finalRank} {player.username || "Unknown"}
                </span>

                <span className="text-zinc-400">{player.finalScore} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-zinc-400">
            No results available yet.
          </div>
        )}

        <div className="mt-6 w-full max-w-md">
          <ClaimPrizeButton poolIndex={poolIndex} gameId={""} />
        </div>
      </main>
    </div>
  );
}
