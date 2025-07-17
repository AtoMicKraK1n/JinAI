"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconTarget } from "@tabler/icons-react";

interface Question {
  explanation?: string;
}

interface GameState {
  answered: boolean;
}

interface ExplanationProps {
  currentQuestion: Question;
  gameState: GameState;
}

const Explanation: React.FC<ExplanationProps> = ({
  currentQuestion,
  gameState,
}) => {
  return (
    <AnimatePresence>
      {gameState.answered && currentQuestion.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -20 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-500/30">
            <div className="flex items-start gap-3">
              <IconTarget
                className="text-blue-400 flex-shrink-0 mt-1"
                size={20}
              />
              <div>
                <h4 className="text-blue-400 font-semibold mb-2">
                  Explanation
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Explanation;
