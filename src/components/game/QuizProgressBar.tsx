"use client";

import React from "react";
import { motion } from "framer-motion";

interface GameState {
  currentQuestion: number;
  totalQuestions: number;
}

const QuizProgressBar: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const progress = (gameState.currentQuestion + 1) / gameState.totalQuestions;

  return (
    <div className="relative mb-8">
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          className="h-full bg-gradient-to-r from-golden-400 to-golden-600 rounded-full origin-left"
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-semibold text-sm">
          {Math.round(progress * 100)}%
        </span>
      </div>
    </div>
  );
};

export default QuizProgressBar;
