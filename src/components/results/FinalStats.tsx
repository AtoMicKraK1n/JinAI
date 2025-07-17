"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconTarget, IconFlame, IconBolt } from "@tabler/icons-react";

interface GameState {
  score: number;
  streak: number;
  perfectAnswers: number;
}

interface FinalStatsProps {
  gameState: GameState;
  accuracy: number;
}

const FinalStats: React.FC<FinalStatsProps> = ({ gameState, accuracy }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-8">
        <h2 className="text-3xl font-bold text-golden-400 mb-8 flex items-center gap-3">
          <IconTarget />
          Your Performance
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
          <StatItem
            label="Final Score"
            value={gameState.score.toLocaleString()}
            color="golden"
            delay={1}
          />
          <StatItem
            label="Accuracy"
            value={`${accuracy}%`}
            color="green"
            delay={1.1}
          />
          <StatItem
            label="Best Streak"
            value={gameState.streak}
            icon={<IconFlame size={24} className="text-orange-400" />}
            color="orange"
            delay={1.2}
          />
          <StatItem
            label="Perfect Answers"
            value={gameState.perfectAnswers}
            icon={<IconBolt size={24} className="text-purple-400" />}
            color="purple"
            delay={1.3}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FinalStats;

const StatItem = ({
  label,
  value,
  color,
  icon,
  delay,
}: {
  label: string;
  value: string | number;
  color: "golden" | "green" | "orange" | "purple";
  icon?: React.ReactNode;
  delay: number;
}) => {
  const colorMap: Record<string, string> = {
    golden: "text-golden-400",
    green: "text-green-400",
    orange: "text-orange-400",
    purple: "text-purple-400",
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay, type: "spring" }}
      className="text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        {icon}
        <div className={`text-4xl font-bold ${colorMap[color]}`}>{value}</div>
      </div>
      <div className="text-gray-400">{label}</div>
    </motion.div>
  );
};
