"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconFlame, IconBolt, IconTarget } from "@tabler/icons-react";

interface GameState {
  streak: number;
  perfectAnswers: number;
}

interface AchievementsProps {
  gameState: GameState;
  accuracy: number;
}

const Achievements: React.FC<AchievementsProps> = ({ gameState, accuracy }) => {
  return (
    <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-8 mt-8">
      <h3 className="text-xl font-bold text-golden-400 mb-4">
        🏅 Achievements Unlocked
      </h3>

      <div className="space-y-3">
        {gameState.streak >= 5 && (
          <AchievementItem
            icon={<IconFlame className="text-orange-400" size={24} />}
            title="Streak Master"
            desc="Achieved 5+ correct answers in a row"
            bg="bg-orange-500/20"
            border="border-orange-400/30"
            delay={1.5}
          />
        )}

        {gameState.perfectAnswers >= 3 && (
          <AchievementItem
            icon={<IconBolt className="text-purple-400" size={24} />}
            title="Lightning Fast"
            desc="3+ perfect speed answers"
            bg="bg-purple-500/20"
            border="border-purple-400/30"
            delay={1.7}
          />
        )}

        {accuracy >= 90 && (
          <AchievementItem
            icon={<IconTarget className="text-green-400" size={24} />}
            title="Sharpshooter"
            desc="90%+ accuracy achieved"
            bg="bg-green-500/20"
            border="border-green-400/30"
            delay={1.9}
          />
        )}
      </div>
    </div>
  );
};

export default Achievements;

const AchievementItem = ({
  icon,
  title,
  desc,
  bg,
  border,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bg: string;
  border: string;
  delay: number;
}) => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay }}
    className={`flex items-center gap-3 p-3 ${bg} rounded-lg border ${border}`}
  >
    {icon}
    <div>
      <div className="text-white font-semibold">{title}</div>
      <div className="text-gray-400 text-sm">{desc}</div>
    </div>
  </motion.div>
);
