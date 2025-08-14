"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconCheck, IconX } from "@tabler/icons-react";

interface Question {
  options: string[] | undefined;
  correctAnswer: string | number;
}

interface GameState {
  answered: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean;
}

interface AnswerOptionsProps {
  currentQuestion: Question;
  gameState: GameState;
  selectAnswer: (index: number) => void;
  getAnswerButtonStyle: (index: number) => string;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  currentQuestion,
  gameState,
  selectAnswer,
  getAnswerButtonStyle,
}) => {
  if (!Array.isArray(currentQuestion.options)) {
    return <div className="text-red-400">Invalid question data</div>;
  }

  // Convert correctAnswer to index
  const getCorrectAnswerIndex = () => {
    const val = currentQuestion.correctAnswer;

    if (typeof val === "number" && val >= 0 && val <= 3) {
      return val;
    }

    if (typeof val === "string") {
      const letterIndex = ["A", "B", "C", "D"].indexOf(
        val.toUpperCase().trim()
      );
      if (letterIndex >= 0) return letterIndex;
    }

    console.warn("⚠ Invalid correctAnswer format:", val);
    return 0;
  };

  const correctAnswerIndex = getCorrectAnswerIndex();

  // Circle background color
  const getCircleStyle = (index: number) => {
    if (!gameState.answered)
      return "bg-gray-800/50 border-gray-600 text-gray-400";

    if (index === correctAnswerIndex)
      return "bg-green-500 border-green-400 text-white";

    if (index === gameState.selectedAnswer && index !== correctAnswerIndex)
      return "bg-red-500 border-red-400 text-white";

    return "bg-gray-800/50 border-gray-600 text-gray-400";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {currentQuestion.options.map((option, index) => {
        const isCorrect = index === correctAnswerIndex;
        const isSelected = index === gameState.selectedAnswer;
        const isWrongSelected = gameState.answered && isSelected && !isCorrect;

        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => selectAnswer(index)}
            disabled={gameState.answered}
            className={`${getAnswerButtonStyle(
              index
            )} p-6 text-left transition-all duration-500 transform-gpu relative overflow-hidden group`}
            whileHover={
              !gameState.answered
                ? {
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 8px 25px rgba(212, 175, 55, 0.3)",
                  }
                : {}
            }
            whileTap={!gameState.answered ? { scale: 0.98 } : {}}
          >
            {/* Background Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-golden-400/0 to-golden-400/0 group-hover:from-golden-400/10 group-hover:to-golden-400/5 transition-all duration-300" />

            <div className="relative flex items-center justify-between">
              {/* Left: Option label + text */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${getCircleStyle(
                    index
                  )}`}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-xl text-white group-hover:text-golden-400 transition-colors duration-300">
                  {option}
                </span>
              </div>

              {/* Right: Icons */}
              {gameState.answered && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {isCorrect && (
                    <IconCheck className="text-green-400" size={32} />
                  )}
                  {isWrongSelected && (
                    <IconX className="text-red-400" size={32} />
                  )}
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default AnswerOptions;
