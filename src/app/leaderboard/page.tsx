"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  IconTrophy,
  IconMedal,
  IconCrown,
  IconFlame,
  IconTarget,
  IconCalendar,
  IconUsers,
} from "@tabler/icons-react";
import ParticleBackground from "../../components/ParticleBackground";
import Navbar from "../../components/Navbar";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  games: number;
  accuracy: number;
  streak: number;
  avatar: string;
  level: number;
  badge?: string;
}

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<
    "daily" | "weekly" | "monthly" | "alltime"
  >("weekly");
  const [category, setCategory] = useState<
    "overall" | "trivia" | "puzzle" | "speed"
  >("overall");

  // Mock leaderboard data
  const leaderboardData: LeaderboardEntry[] = [
    {
      rank: 1,
      username: "QuizMaster2024",
      score: 15420,
      games: 287,
      accuracy: 94.5,
      streak: 23,
      avatar: "🏆",
      level: 42,
      badge: "Champion",
    },
    {
      rank: 2,
      username: "BrainStorm_AI",
      score: 14890,
      games: 312,
      accuracy: 91.2,
      streak: 18,
      avatar: "🧠",
      level: 38,
      badge: "Genius",
    },
    {
      rank: 3,
      username: "GameGuru_Pro",
      score: 13975,
      games: 245,
      accuracy: 88.7,
      streak: 15,
      avatar: "⚡",
      level: 35,
      badge: "Expert",
    },
    {
      rank: 4,
      username: "TriviaKing",
      score: 12560,
      games: 198,
      accuracy: 92.1,
      streak: 12,
      avatar: "👑",
      level: 32,
    },
    {
      rank: 5,
      username: "PuzzleSolver",
      score: 11890,
      games: 176,
      accuracy: 89.4,
      streak: 9,
      avatar: "🧩",
      level: 29,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <IconCrown className="text-yellow-400" size={24} />;
      case 2:
        return <IconMedal className="text-gray-300" size={24} />;
      case 3:
        return <IconMedal className="text-orange-400" size={24} />;
      default:
        return <span className="text-golden-400 font-bold">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3)
      return "neo-card bg-gradient-to-r from-golden-500/20 to-golden-600/20 border-golden-400/50";
    if (rank <= 10)
      return "neo-card bg-gradient-to-r from-gray-700/30 to-gray-800/30 border-gray-600/50";
    return "neo-card bg-gradient-to-r from-gray-800/20 to-gray-900/20 border-gray-700/30";
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <div className="relative z-10 container mx-auto px-6 py-8 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <IconTrophy className="text-golden-400" size={40} />
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Compete with the best players worldwide
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          {/* Timeframe Filter */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
            {(["daily", "weekly", "monthly", "alltime"] as const).map(
              (time) => (
                <button
                  key={time}
                  onClick={() => setTimeframe(time)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${
                    timeframe === time
                      ? "bg-golden-500 text-white font-semibold"
                      : "text-gray-400 hover:text-golden-400"
                  }`}
                >
                  {time === "alltime" ? "All Time" : time}
                </button>
              )
            )}
          </div>

          {/* Category Filter */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
            {(["overall", "trivia", "puzzle", "speed"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${
                  category === cat
                    ? "bg-golden-500 text-white font-semibold"
                    : "text-gray-400 hover:text-golden-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="neo-card bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-600/50 p-4 text-center">
            <IconUsers className="text-blue-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-blue-400">1,247</p>
            <p className="text-gray-400 text-sm">Active Players</p>
          </div>

          <div className="neo-card bg-gradient-to-r from-green-900/30 to-green-800/30 border-green-600/50 p-4 text-center">
            <IconTarget className="text-green-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-green-400">89.2%</p>
            <p className="text-gray-400 text-sm">Avg Accuracy</p>
          </div>

          <div className="neo-card bg-gradient-to-r from-purple-900/30 to-purple-800/30 border-purple-600/50 p-4 text-center">
            <IconFlame className="text-purple-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-purple-400">23</p>
            <p className="text-gray-400 text-sm">Top Streak</p>
          </div>

          <div className="neo-card bg-gradient-to-r from-golden-900/30 to-golden-800/30 border-golden-600/50 p-4 text-center">
            <IconCalendar className="text-golden-400 mx-auto mb-2" size={24} />
            <p className="text-2xl font-bold text-golden-400">8,492</p>
            <p className="text-gray-400 text-sm">Games Played</p>
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {leaderboardData.map((player, index) => (
            <motion.div
              key={player.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`${getRankBadge(
                player.rank
              )} p-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Rank, Avatar, User Info */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800/50">
                    {getRankIcon(player.rank)}
                  </div>

                  <div className="text-4xl">{player.avatar}</div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-white">
                        {player.username}
                      </h3>
                      {player.badge && (
                        <span className="px-2 py-1 bg-golden-500/20 text-golden-400 text-xs rounded-full border border-golden-400/30">
                          {player.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Level {player.level}
                    </p>
                  </div>
                </div>

                {/* Right: Stats */}
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="text-golden-400 font-bold text-xl">
                      {player.score.toLocaleString()}
                    </p>
                    <p className="text-gray-400">Score</p>
                  </div>

                  <div className="text-center hidden md:block">
                    <p className="text-white font-semibold">{player.games}</p>
                    <p className="text-gray-400">Games</p>
                  </div>

                  <div className="text-center hidden md:block">
                    <p className="text-green-400 font-semibold">
                      {player.accuracy}%
                    </p>
                    <p className="text-gray-400">Accuracy</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <IconFlame className="text-orange-400" size={16} />
                      <p className="text-orange-400 font-semibold">
                        {player.streak}
                      </p>
                    </div>
                    <p className="text-gray-400">Streak</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <button className="neo-button bg-gradient-to-r from-golden-500 to-golden-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300">
            Load More Players
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
