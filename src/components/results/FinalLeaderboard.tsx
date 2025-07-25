"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  IconTrophy,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";

interface Player {
  id: string;
  wallet: string;
  avatar?: string;
  username: string;
  score: number;
}

interface GameState {
  score: number;
}

interface FinalLeaderboardProps {
  players: Player[];
  gameState: GameState;
}

const FinalLeaderboard: React.FC<FinalLeaderboardProps> = ({
  players,
  gameState,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-6">
        <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3">
          <IconTrophy />
          Final Rankings
        </h3>

        <div className="space-y-3">
          {players.slice(0, 5).map((player, index) => {
            const isYou = player.username === "You";
            const finalScore = isYou ? gameState.score : player.score;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                  isYou
                    ? "bg-golden-500/20 border-golden-400/50 transform scale-105"
                    : "bg-gray-800/50 border-gray-700/30"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div className="text-2xl">{player.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        isYou ? "text-golden-400" : "text-white"
                      }`}
                    >
                      {player.username}
                    </span>
                    {isYou && (
                      <span className="text-xs bg-golden-400 text-black px-2 py-1 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {finalScore.toLocaleString()} pts
                  </p>
                </div>
                {index < 3 && (
                  <div className="flex items-center gap-1">
                    {index === 0 ? (
                      <IconChevronUp className="text-green-400" size={20} />
                    ) : index === 1 ? (
                      <IconChevronUp className="text-blue-400" size={20} />
                    ) : (
                      <IconChevronDown className="text-red-400" size={20} />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-golden-500/20 to-golden-600/20 rounded-lg border border-golden-400/30">
          <div className="text-center">
            <div className="text-golden-400 font-bold text-lg">
              +{Math.floor(gameState.score / 100)} Tokens Earned
            </div>
            <div className="text-gray-400 text-sm">Added to your account</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FinalLeaderboard;
