"use client";

import React from "react";
import FinalStats from "./results/FinalStats";
import Achievements from "./results/Achievements";
import FinalLeaderboard from "./results/FinalLeaderboard";

interface Player {
  id: string;
  wallet: string;
  avatar?: string;
  username: string;
  score: number;
}

interface GameState {
  score: number;
  streak: number;
  perfectAnswers: number;
}

interface ResultsScreenProps {
  players: Player[];
  gameState: GameState;
  accuracy: number;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  players,
  gameState,
  accuracy,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full">
      {/* Top Trophy & Message */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-20 h-20 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 text-3xl">
          🏆
        </div>
        <h2 className="text-xl text-white font-semibold">💪 Well Played!</h2>
      </div>

      {/* Main Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
        <div>
          <FinalStats gameState={gameState} accuracy={accuracy} />
          <Achievements gameState={gameState} accuracy={accuracy} />
        </div>
        <FinalLeaderboard players={players} gameState={gameState} />
      </div>
    </div>
  );
};

export default ResultsScreen;
