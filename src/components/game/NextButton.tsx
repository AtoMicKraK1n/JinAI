"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowRight } from "@tabler/icons-react";

interface GameState {
  answered: boolean;
  currentQuestion: number;
  totalQuestions: number;
}

interface NextButtonProps {
  gameState: GameState;
  nextQuestion: () => void;
}

const NextButton: React.FC<NextButtonProps> = ({ gameState, nextQuestion }) => {
  if (!gameState.answered) return null;

  const isLastQuestion =
    gameState.currentQuestion + 1 >= gameState.totalQuestions;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-center"
      >
        <motion.button
          onClick={nextQuestion}
          className="neo-button bg-gradient-to-r from-golden-500 to-golden-600 text-white px-12 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto text-xl border border-golden-400/50"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{isLastQuestion ? "Finish Battle" : "Next Question"}</span>
          <IconArrowRight size={24} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default NextButton;
