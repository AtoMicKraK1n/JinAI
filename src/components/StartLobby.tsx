"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  IconUserCheck,
  IconListNumbers,
  IconCoin,
  IconSpeedboat,
  IconUsers,
} from "@tabler/icons-react";

interface Player {
  userId: string;
  username: string;
}

interface StartLobbyProps {
  players: Player[];
}

const StartLobby: React.FC<StartLobbyProps> = ({ players }) => {
  return (
    <div className="px-4 lg:px-8 pt-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/40 p-8 h-full rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <IconUserCheck className="text-yellow-400" size={32} />
              <h2 className="text-3xl font-bold text-yellow-400">
                Lobby Instructions
              </h2>
            </div>

            <div className="space-y-6 text-white text-lg">
              <InstructionItem
                icon={<IconUserCheck className="text-yellow-400" size={20} />}
                text="Please sign the transaction to join the lobby."
              />
              <InstructionItem
                icon={<IconListNumbers className="text-yellow-400" size={20} />}
                text="This quiz has 10 questions and you will compete with 3 others to win."
              />
              <InstructionItem
                icon={<IconCoin className="text-yellow-400" size={20} />}
                text="Prize Distribution — 1st: 1.6 SOL, 2nd: 1.2 SOL, 3rd: 0.4 SOL. 0.1 SOL goes to treasury."
              />
              <InstructionItem
                icon={<IconSpeedboat className="text-yellow-400" size={20} />}
                text="Score is based on how fast and correct your answers are."
              />
            </div>
          </div>
        </motion.div>

        {/* Players in Lobby */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700/50 p-6 h-full rounded-xl">
            <div className="flex items-center gap-3 mb-6">
              <IconUsers className="text-blue-400" size={24} />
              <h3 className="text-xl font-bold text-blue-400">
                Players in Lobby
              </h3>
            </div>

            <div className="space-y-3">
              {players.slice(0, 4).map((player, index) => (
                <motion.div
                  key={player.username}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                >
                  <div className="flex-1">
                    <span className="text-white font-semibold">
                      {player.username}
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </motion.div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-golden-400/10 rounded-lg border border-golden-400/30">
              <p className="text-golden-400 text-sm text-center">
                🔥 Waiting for all players to join...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StartLobby;

// 🔹 Reusable item for instructions
const InstructionItem = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <p className="text-gray-200">{text}</p>
  </div>
);
