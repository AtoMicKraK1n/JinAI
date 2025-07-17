"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCheck, IconX } from "@tabler/icons-react";

interface Question {
  category: string;
  question: string;
  correctAnswer: number;
  explanation?: string;
  options: string[];
}

interface GameState {
  answered: boolean;
  isCorrect: boolean;
  selectedAnswer: number | null;
  currentQuestion: number;
  totalQuestions: number;
}

interface QuestionCardProps {
  currentQuestion: Question;
  gameState: GameState;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  currentQuestion,
  gameState,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={gameState.currentQuestion}
        initial={{ opacity: 0, x: 50, rotateY: -15 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -50, rotateY: 15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="perspective-1000"
      >
        <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-8 mb-8 transform-gpu">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {/* Category */}
              <span className="text-golden-400 text-sm font-semibold bg-golden-400/20 px-3 py-1 rounded-full border border-golden-400/30">
                {currentQuestion.category}
              </span>

              {/* Feedback Badge */}
              {gameState.answered && gameState.isCorrect && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30"
                >
                  <IconCheck className="text-green-400" size={16} />
                  <span className="text-green-400 font-semibold">Correct!</span>
                </motion.div>
              )}

              {gameState.answered &&
                !gameState.isCorrect &&
                gameState.selectedAnswer !== null && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30"
                  >
                    <IconX className="text-red-400" size={16} />
                    <span className="text-red-400 font-semibold">
                      Incorrect
                    </span>
                  </motion.div>
                )}
            </div>

            {/* Question Text */}
            <h2 className="text-3xl font-bold text-white leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuestionCard;
