"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  IconClock,
  IconFlame,
  IconBolt,
  IconTarget,
  IconTrophy,
  IconStar,
  IconShield,
  IconUsers,
} from "@tabler/icons-react";

interface Player {
  userId: string;
  username: string;
}

interface StartLobbyProps {
  players: Player[];
}

const StartLobby: React.FC<StartLobbyProps> = ({ players }) => {
  console.log("🔍 Players in StartLobby:", players);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
      {/* Game Rules */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="lg:col-span-2"
      >
        <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-8 h-full">
          <div className="flex items-center gap-3 mb-6">
            <IconShield className="text-golden-400" size={32} />
            <h2 className="text-3xl font-bold text-golden-400">Battle Rules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <RuleItem
                icon={<IconClock className="text-blue-400" size={16} />}
                title="Speed Bonus"
                desc="Answer faster to earn massive time bonuses"
                bg="bg-blue-500/20"
              />
              <RuleItem
                icon={<IconFlame className="text-orange-400" size={16} />}
                title="Streak Power"
                desc="Build streaks to unlock score multipliers up to 5x"
                bg="bg-orange-500/20"
              />
              <RuleItem
                icon={<IconBolt className="text-purple-400" size={16} />}
                title="Perfect Answers"
                desc="Answer within 1 second for perfect bonus"
                bg="bg-purple-500/20"
              />
            </div>

            <div className="space-y-4">
              <RuleItem
                icon={<IconTarget className="text-red-400" size={16} />}
                title="Difficulty Multiplier"
                desc="Hard questions give 3x points, Medium 2x"
                bg="bg-red-500/20"
              />
              <RuleItem
                icon={<IconTrophy className="text-green-400" size={16} />}
                title="Live Rankings"
                desc="Real-time leaderboard during matches"
                bg="bg-green-500/20"
              />
              <RuleItem
                icon={<IconStar className="text-golden-400" size={16} />}
                title="Rewards"
                desc="Earn tokens and climb the global leaderboard"
                bg="bg-golden-500/20"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Current Players */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-6 h-full">
          <div className="flex items-center gap-3 mb-6">
            <IconUsers className="text-blue-400" size={24} />
            <h3 className="text-xl font-bold text-blue-400">
              Players in Lobby
            </h3>
          </div>

          <div className="space-y-3">
            {players.slice(0, 4).map((player, index) => (
              <motion.div
                key={player.username}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
              >
                <div className="flex-1">
                  <span className="text-white font-semibold">
                    {player.username}
                  </span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-golden-400/10 rounded-lg border border-golden-400/30">
            <p className="text-golden-400 text-sm text-center">
              🔥 Waiting for all players to join...
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StartLobby;

// Helper component for rules
interface RuleItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bg: string;
}

const RuleItem: React.FC<RuleItemProps> = ({ icon, title, desc, bg }) => (
  <div className="flex items-start gap-3">
    <div
      className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}
    >
      {icon}
    </div>
    <div>
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  </div>
);
