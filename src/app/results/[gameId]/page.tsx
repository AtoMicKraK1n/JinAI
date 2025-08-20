"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

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
  const router = useRouter();
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

          // Set game data from API response
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

  const handleClaimPrizes = () => {
    if (gameData) {
      // Navigate to claim page with game data
      router.push(
        `/claim?gameId=${gameData.gameId}&poolIndex=${gameData.poolIndex}`
      );
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
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
            <p className="text-xl text-golden-400 font-semibold">
              💰 Prize Pool: {gameData.prizePool} SOL
            </p>
            <p className="text-sm text-zinc-400">Pool #{gameData.poolIndex}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-400 mx-auto"></div>
            <p className="text-lg mt-4">Loading results...</p>
          </div>
        ) : results && results.length > 0 ? (
          <>
            <motion.div
              className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 w-full max-w-md border border-zinc-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
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
                      {/* Show prize amount if available */}
                      {player.prizeWon && player.prizeWon > 0 && (
                        <div className="text-xs text-golden-400 font-semibold">
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
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="mt-8 w-full max-w-md space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {/* Claim Prizes Button - Only show for host when game is completed */}
              {gameData?.status === "COMPLETED" && gameData?.isHost && (
                <button
                  onClick={handleClaimPrizes}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🏆 Claim & Distribute Prizes
                </button>
              )}

              {/* Back to Dashboard Button */}
              <button
                onClick={handleBackToDashboard}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                📊 Back to Dashboard
              </button>
            </motion.div>

            {/* Info Message for Non-Host Players */}
            {gameData?.status === "COMPLETED" && !gameData?.isHost && (
              <motion.div
                className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg text-center max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-blue-200 text-sm">
                  🎯 Game completed! The host will claim and distribute prizes
                  to all players.
                </p>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            className="text-center text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg">No results available yet.</p>
            <p className="text-sm mt-2">The game might still be in progress.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
