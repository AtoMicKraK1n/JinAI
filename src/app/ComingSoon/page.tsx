"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconClock, IconBell, IconX, IconRocket } from "@tabler/icons-react";

interface ComingSoonProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  isOpen,
  onClose,
  gameTitle,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="neo-card p-8 max-w-md w-full text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconX size={16} className="text-gray-400" />
            </motion.button>

            {/* Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-jingold/20 rounded-full mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <IconRocket size={32} className="text-jingold" />
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold futuristic-text text-jingold mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {gameTitle}
            </motion.h2>

            <motion.p
              className="text-lg text-gray-300 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Coming Soon!
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-gray-400 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              We're working hard to bring you an amazing quiz experience for{" "}
              {gameTitle}. Get notified when it launches!
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                className="neo-button w-full flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconBell size={18} />
                Notify Me When Ready
              </motion.button>

              <motion.button
                className="w-full px-6 py-3 border border-jingold/30 rounded-lg text-jingold hover:bg-jingold/10 transition-all duration-300 flex items-center justify-center gap-2"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconClock size={18} />
                Browse Other Games
              </motion.button>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-xs text-gray-500 mb-2">
                Development Progress
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="progress-bar h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">65% Complete</div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoon;
