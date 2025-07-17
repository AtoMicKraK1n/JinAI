"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconBolt, IconClock } from "@tabler/icons-react";

interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  multiplier: number;
}

interface Question {
  difficulty: string;
}

interface GameHeaderProps {
  gameState: GameState;
  currentQuestion: Question;
  getDifficultyColor: (difficulty: string) => string;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  gameState,
  currentQuestion,
  getDifficultyColor,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-between items-center mb-6"
    >
      {/* Left Section: LIVE + Q Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 font-semibold">LIVE</span>
        </div>

        <div className="neo-card bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-600/50 px-4 py-2">
          <span className="text-blue-400 font-semibold">
            Question {gameState.currentQuestion + 1}/{gameState.totalQuestions}
          </span>
        </div>
      </div>

      {/* Right Section: Multiplier + Difficulty + Timer */}
      <div className="flex items-center gap-4">
        {gameState.multiplier > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="neo-card bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-600/50 px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <IconBolt className="text-purple-400" size={16} />
              <span className="text-purple-400 font-semibold">
                {gameState.multiplier}x
              </span>
            </div>
          </motion.div>
        )}

        <div
          className={`neo-card px-4 py-2 ${getDifficultyColor(
            currentQuestion.difficulty
          )}`}
        >
          <span className="font-semibold capitalize">
            {currentQuestion.difficulty}
          </span>
        </div>

        <motion.div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            gameState.timeLeft <= 5
              ? "bg-red-500/20 border-red-500/50"
              : gameState.timeLeft <= 10
              ? "bg-yellow-500/20 border-yellow-500/50"
              : "bg-green-500/20 border-green-500/50"
          }`}
          animate={{
            scale: gameState.timeLeft <= 5 ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: gameState.timeLeft <= 5 ? Infinity : 0,
          }}
        >
          <IconClock
            className={
              gameState.timeLeft <= 5
                ? "text-red-400"
                : gameState.timeLeft <= 10
                ? "text-yellow-400"
                : "text-green-400"
            }
            size={20}
          />
          <span
            className={`text-2xl font-bold ${
              gameState.timeLeft <= 5
                ? "text-red-400"
                : gameState.timeLeft <= 10
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {gameState.timeLeft}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameHeader;
