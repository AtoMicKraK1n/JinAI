"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import NeoCard from "@/components/NeoCard"; // ✅ shared card

interface PlayerResult {
  username: string;
  finalRank: number;
  finalScore: number;
  walletAddress?: string;
  prizeWon?: number;
}

interface GameData {
  poolIndex: number;
  prizePool: number;
  status: string;
  gameId: string;
  isHost: boolean;
}

export default function ResultsPage() {
  const { gameId } = useParams();
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
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
        console.log("🎯 Results API response:", data);

        if (
          (data.success && Array.isArray(data.results)) ||
          data.message === "Already completed" ||
          data.message === "Game completed"
        ) {
          setResults(data.results);

          if (data.gameData) {
            setGameData(data.gameData);
          }
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

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏆";
  };

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
          🏆 Final Results
        </motion.h1>

        {/* Prize Pool Display */}
        {gameData && (
          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xl text-yellow-400 font-semibold">
              💰 Prize Pool: {gameData.prizePool} SOL
            </p>
            <p className="text-sm text-zinc-400">Pool #{gameData.poolIndex}</p>
          </motion.div>
        )}

        {loading ? (
          <NeoCard className="w-full max-w-md text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-lg mt-4">Loading results...</p>
          </NeoCard>
        ) : results && results.length > 0 ? (
          <>
            {/* Results List inside NeoCard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-md"
            >
              <NeoCard className="p-6">
                {results.map((player, index) => (
                  <motion.div
                    key={index}
                    className={`flex justify-between items-center py-3 border-b border-zinc-700 ${
                      index === results.length - 1 ? "border-none" : ""
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getRankEmoji(player.finalRank)}
                      </span>
                      <div>
                        <span
                          className={`font-semibold ${getMedalColor(
                            player.finalRank
                          )}`}
                        >
                          #{player.finalRank} {player.username || "Unknown"}
                        </span>
                        <div className="text-xs text-zinc-500">
                          {player.finalRank === 1 && "Winner! 🎉"}
                          {player.finalRank === 2 && "Runner-up"}
                          {player.finalRank === 3 && "Third place"}
                          {player.finalRank === 4 && "Fourth place"}
                        </div>
                        {player.prizeWon && player.prizeWon > 0 && (
                          <div className="text-xs text-yellow-400 font-semibold">
                            Prize: {player.prizeWon.toFixed(4)} SOL
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-zinc-400 font-mono">
                      {player.finalScore} pts
                    </span>
                  </motion.div>
                ))}
              </NeoCard>
            </motion.div>

            {/* Game Completed Announcement */}
            {gameData?.status === "COMPLETED" && (
              <motion.div
                className="mt-8 max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <NeoCard className="p-4 text-center border-yellow-400/40">
                  <p className="text-yellow-300 font-medium text-sm">
                    ✨ The game has ended! You can claim your rewards anytime
                    from the{" "}
                    <span className="font-semibold">Claim Rewards</span> option
                    in the navigation bar above.
                  </p>
                </NeoCard>
              </motion.div>
            )}
          </>
        ) : (
          <NeoCard className="text-center max-w-md p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-lg">No results available yet.</p>
              <p className="text-sm mt-2">
                The game might still be in progress.
              </p>
            </motion.div>
          </NeoCard>
        )}
      </main>
    </div>
  );
}
