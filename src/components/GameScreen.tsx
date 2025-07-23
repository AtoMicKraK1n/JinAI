"use client";

import React from "react";
import GameHeader from "./game/GameHeader";
import QuizProgressBar from "./game/QuizProgressBar";
import LiveLeaderboard from "./game/LiveLeaderboard";
import QuestionCard from "./game/QuestionCard";
import AnswerOptions from "./game/AnswerOptions";
import Explanation from "./game/Explanation";
import NextButton from "./game/NextButton";

interface Player {
  wallet: string;
  score: number;
  avatar?: string;
  isOnline?: boolean;
  username?: string;
}

interface Question {
  category: string;
  question: string;
  correctAnswer: number;
  explanation?: string;
  options: string[];
  difficulty: string;
}

interface GameState {
  answered: boolean;
  isCorrect: boolean;
  selectedAnswer: number | null;
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  streak: number;
  timeLeft: number;
  multiplier: number;
  correctAnswer?: number;
}

interface GameScreenProps {
  players: Player[];
  gameState: GameState;
  question: Question;
  selectAnswer: (index: number) => void;
  getAnswerButtonStyle: (index: number) => string;
  nextQuestion: () => void;
  getDifficultyColor: (difficulty: string) => string;
}

const GameScreen: React.FC<GameScreenProps> = ({
  players,
  gameState,
  question,
  selectAnswer,
  getAnswerButtonStyle,
  nextQuestion,
  getDifficultyColor,
}) => {
  return (
    <div className="relative z-10 container mx-auto px-6 py-8 pt-32">
      {/* Game Info Header */}
      <GameHeader
        gameState={gameState}
        currentQuestion={question}
        getDifficultyColor={getDifficultyColor}
      />

      {/* Progress Bar */}
      <QuizProgressBar gameState={gameState} />

      {/* Game Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <LiveLeaderboard players={players} gameState={gameState} />

        <div className="lg:col-span-3">
          <QuestionCard currentQuestion={question} gameState={gameState} />
          <AnswerOptions
            currentQuestion={question}
            gameState={gameState}
            selectAnswer={selectAnswer}
            getAnswerButtonStyle={getAnswerButtonStyle}
          />
          <Explanation currentQuestion={question} gameState={gameState} />
          <NextButton gameState={gameState} nextQuestion={nextQuestion} />
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
