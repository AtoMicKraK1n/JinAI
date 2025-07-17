"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconUsers, IconFlame } from "@tabler/icons-react";

interface Player {
  wallet: string;
  score: number;
  avatar?: string; // Optional, just for UI icons
  isOnline?: boolean;
  username?: string; // Optional if you want to label "You"
}

interface GameState {
  score: number;
  streak: number;
  answered: boolean;
  timeLeft: number;
}

interface LiveLeaderboardProps {
  players: Player[];
  gameState: GameState;
}

const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  players,
  gameState,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-1 order-2 lg:order-1"
    >
      <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-6 sticky top-32">
        <div className="flex items-center gap-3 mb-6">
          <IconUsers className="text-blue-400" size={24} />
          <h3 className="text-xl font-bold text-blue-400">Live Rankings</h3>
        </div>

        {/* Current Player Score */}
        <div className="mb-6 p-4 bg-golden-500/20 rounded-lg border border-golden-400/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-golden-400 mb-1">
              {gameState.score.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm mb-3">Your Score</div>

            {gameState.streak > 0 && (
              <div className="flex items-center justify-center gap-2">
                <IconFlame className="text-orange-400" size={16} />
                <span className="text-orange-400 font-semibold">
                  {gameState.streak} streak
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Other Players */}
        <div className="space-y-3">
          {players.slice(0, 4).map((player, index) => {
            const isCurrentPlayer = player.username === "You";
            const displayName = isCurrentPlayer
              ? "You"
              : `Player_${player.wallet.slice(0, 6)}`;

            return (
              <motion.div
                key={player.wallet}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                  isCurrentPlayer
                    ? "bg-golden-500/20 border-golden-400/50"
                    : "bg-gray-800/50 border-gray-700/30"
                }`}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs font-bold">
                  {index + 1}
                </div>
                <div className="text-lg">{player.avatar ?? "👤"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">
                      {displayName}
                    </span>
                    {player.isOnline && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    {isCurrentPlayer
                      ? gameState.score.toLocaleString()
                      : player.score.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Countdown */}
        <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <p className="text-blue-400 text-sm text-center">
            ⚡ Next question in {gameState.answered ? "5" : gameState.timeLeft}s
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveLeaderboard;
