"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconClock,
  IconTrophy,
  IconFlame,
  IconCheck,
  IconX,
  IconBolt,
  IconTarget,
  IconArrowRight,
  IconRefresh,
  IconHome,
  IconUsers,
  IconStar,
  IconShield,
  IconCrown,
  IconMedal,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import ParticleBackground from "../../components/ParticleBackground";
import Navbar from "../../components/Navbar";

interface Player {
  id: number;
  username: string;
  avatar: string;
  score: number;
  streak: number;
  isOnline: boolean;
  rank: number;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  explanation?: string;
}

interface GameState {
  currentQuestion: number;
  score: number;
  timeLeft: number;
  streak: number;
  totalQuestions: number;
  answered: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  gameStarted: boolean;
  gameEnded: boolean;
  multiplier: number;
  perfectAnswers: number;
}

const Quiz: React.FC = () => {
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    timeLeft: 30,
    streak: 0,
    totalQuestions: 15,
    answered: false,
    selectedAnswer: null,
    isCorrect: null,
    gameStarted: false,
    gameEnded: false,
    multiplier: 1,
    perfectAnswers: 0,
  });

  // Mock multiplayer data
  const [players] = useState<Player[]>([
    {
      id: 1,
      username: "QuizMaster2024",
      avatar: "🏆",
      score: 15420,
      streak: 12,
      isOnline: true,
      rank: 1,
    },
    {
      id: 2,
      username: "BrainStorm_AI",
      avatar: "🧠",
      score: 14890,
      streak: 8,
      isOnline: true,
      rank: 2,
    },
    {
      id: 3,
      username: "You",
      avatar: "⚡",
      score: gameState.score,
      streak: gameState.streak,
      isOnline: true,
      rank: 3,
    },
    {
      id: 4,
      username: "GameGuru_Pro",
      avatar: "🎮",
      score: 12560,
      streak: 5,
      isOnline: true,
      rank: 4,
    },
    {
      id: 5,
      username: "PuzzleSolver",
      avatar: "🧩",
      score: 11890,
      streak: 3,
      isOnline: false,
      rank: 5,
    },
  ]);

  // Gaming-themed quiz questions with legendary games
  const questions: Question[] = [
    {
      id: 1,
      question:
        "Which game is currently the best-selling video game of all time?",
      options: ["Tetris", "Minecraft", "Grand Theft Auto V", "Wii Sports"],
      correctAnswer: 1,
      category: "Gaming Records",
      difficulty: "easy",
      timeLimit: 15,
      explanation:
        "Minecraft has sold over 300 million copies across all platforms, making it the best-selling video game ever.",
    },
    {
      id: 2,
      question:
        "In what year was The Legend of Zelda: Ocarina of Time released?",
      options: ["1996", "1997", "1998", "1999"],
      correctAnswer: 2,
      category: "Nintendo Classics",
      difficulty: "medium",
      timeLimit: 18,
      explanation:
        "Ocarina of Time was released in 1998 for the Nintendo 64 and is considered one of the greatest games of all time.",
    },
    {
      id: 3,
      question: "What is the name of the protagonist in the Half-Life series?",
      options: [
        "Gordon Freeman",
        "Adrian Shephard",
        "Alyx Vance",
        "Barney Calhoun",
      ],
      correctAnswer: 0,
      category: "FPS Legends",
      difficulty: "easy",
      timeLimit: 12,
      explanation:
        "Gordon Freeman is the theoretical physicist protagonist who wields the iconic crowbar throughout the Half-Life series.",
    },
    {
      id: 4,
      question: "Which studio developed the Dark Souls series?",
      options: ["Capcom", "FromSoftware", "Bandai Namco", "Square Enix"],
      correctAnswer: 1,
      category: "Action RPG",
      difficulty: "medium",
      timeLimit: 20,
      explanation:
        "FromSoftware, led by Hidetaka Miyazaki, created the Dark Souls series and coined the 'Soulslike' genre.",
    },
    {
      id: 5,
      question: "In Counter-Strike, what does 'AWP' stand for?",
      options: [
        "Arctic Warfare Police",
        "Advanced Weapon Platform",
        "Automatic War Pistol",
        "Assault Weapon Prototype",
      ],
      correctAnswer: 0,
      category: "Esports",
      difficulty: "hard",
      timeLimit: 25,
      explanation:
        "AWP stands for Arctic Warfare Police, a powerful sniper rifle that can eliminate enemies with a single headshot.",
    },
    {
      id: 6,
      question:
        "Which battle royale game popularized the 'Winner Winner Chicken Dinner' phrase?",
      options: ["Fortnite", "Apex Legends", "PUBG", "Call of Duty: Warzone"],
      correctAnswer: 2,
      category: "Battle Royale",
      difficulty: "easy",
      timeLimit: 15,
      explanation:
        "PUBG (PlayerUnknown's Battlegrounds) made 'Winner Winner Chicken Dinner' famous as the victory message.",
    },
    {
      id: 7,
      question:
        "What is the maximum level a Pokémon can reach in the original games?",
      options: ["99", "100", "120", "255"],
      correctAnswer: 1,
      category: "RPG Classics",
      difficulty: "easy",
      timeLimit: 10,
      explanation:
        "In all main Pokémon games, the maximum level is 100, though there were glitches in early games to exceed this.",
    },
    {
      id: 8,
      question: "What is the name of Kratos' son in God of War (2018)?",
      options: ["Baldur", "Atreus", "Mimir", "Freya"],
      correctAnswer: 1,
      category: "Action Adventure",
      difficulty: "medium",
      timeLimit: 18,
      explanation:
        "Atreus is Kratos' son who accompanies him throughout the 2018 God of War reboot set in Norse mythology.",
    },
    {
      id: 9,
      question: "What was the level cap in World of Warcraft at launch?",
      options: ["50", "60", "70", "80"],
      correctAnswer: 1,
      category: "MMORPG",
      difficulty: "hard",
      timeLimit: 22,
      explanation:
        "World of Warcraft launched in 2004 with a level cap of 60, which was later increased with expansions.",
    },
    {
      id: 10,
      question:
        "Which Gran Turismo game is considered the definitive driving simulator?",
      options: [
        "Gran Turismo 3",
        "Gran Turismo 4",
        "Gran Turismo Sport",
        "Gran Turismo 7",
      ],
      correctAnswer: 1,
      category: "Racing",
      difficulty: "medium",
      timeLimit: 20,
      explanation:
        "Gran Turismo 4 is widely regarded as the peak of the series with over 700 cars and legendary simulation physics.",
    },
    {
      id: 11,
      question:
        "In Red Dead Redemption 2, what is the name of Arthur Morgan's gang?",
      options: [
        "O'Driscoll Boys",
        "Van der Linde Gang",
        "Micah's Gang",
        "Cornwall Company",
      ],
      correctAnswer: 1,
      category: "Open World",
      difficulty: "easy",
      timeLimit: 15,
      explanation:
        "Arthur Morgan is a member of the Van der Linde Gang, led by Dutch van der Linde in the American frontier.",
    },
    {
      id: 12,
      question: "Which city is NOT featured in Grand Theft Auto: Vice City?",
      options: ["Vice City", "Little Haiti", "Downtown", "Liberty City"],
      correctAnswer: 3,
      category: "GTA Series",
      difficulty: "medium",
      timeLimit: 18,
      explanation:
        "Liberty City is the setting for GTA III and GTA IV, while Vice City is based on 1980s Miami.",
    },
    {
      id: 13,
      question: "What horse does Arthur Morgan start with in RDR2?",
      options: ["Boadicea", "Old Boy", "Buell", "The Count"],
      correctAnswer: 1,
      category: "Red Dead",
      difficulty: "hard",
      timeLimit: 25,
      explanation:
        "Old Boy is Arthur's initial horse at the beginning of Red Dead Redemption 2's story mode.",
    },
    {
      id: 14,
      question: "Which GTA game introduced the three-protagonist system?",
      options: [
        "GTA IV",
        "GTA V",
        "GTA: San Andreas",
        "GTA: Vice City Stories",
      ],
      correctAnswer: 1,
      category: "GTA Series",
      difficulty: "easy",
      timeLimit: 12,
      explanation:
        "GTA V was the first game in the series to feature three playable protagonists: Michael, Franklin, and Trevor.",
    },
    {
      id: 15,
      question:
        "In RDR2, what is the name of the tuberculosis-infected character?",
      options: [
        "John Marston",
        "Dutch van der Linde",
        "Arthur Morgan",
        "Micah Bell",
      ],
      correctAnswer: 2,
      category: "Red Dead",
      difficulty: "medium",
      timeLimit: 20,
      explanation:
        "Arthur Morgan contracts tuberculosis during the story, which becomes a central plot element in RDR2's narrative.",
    },
  ];

  const currentQuestion = questions[gameState.currentQuestion];

  // Timer effect
  useEffect(() => {
    if (!gameState.gameStarted || gameState.answered || gameState.gameEnded)
      return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          // Time's up - auto submit
          return {
            ...prev,
            timeLeft: 0,
            answered: true,
            selectedAnswer: null,
            isCorrect: false,
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [
    gameState.gameStarted,
    gameState.answered,
    gameState.currentQuestion,
    gameState.gameEnded,
  ]);

  const startGame = () => {
    setGameState((prev) => ({
      ...prev,
      gameStarted: true,
      timeLeft: currentQuestion.timeLimit,
    }));
  };

  const selectAnswer = (answerIndex: number) => {
    if (gameState.answered) return;

    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const timeBonus = gameState.timeLeft * 20;
    const streakBonus = gameState.streak * 100;
    const difficultyMultiplier =
      currentQuestion.difficulty === "hard"
        ? 3
        : currentQuestion.difficulty === "medium"
        ? 2
        : 1;
    const perfectBonus =
      gameState.timeLeft === currentQuestion.timeLimit ? 500 : 0;

    const points = isCorrect
      ? (timeBonus + streakBonus + perfectBonus) *
        difficultyMultiplier *
        gameState.multiplier
      : 0;

    setGameState((prev) => ({
      ...prev,
      answered: true,
      selectedAnswer: answerIndex,
      isCorrect,
      score: prev.score + points,
      streak: isCorrect ? prev.streak + 1 : 0,
      multiplier:
        isCorrect && prev.streak >= 2 ? Math.min(prev.multiplier + 0.5, 5) : 1,
      perfectAnswers:
        gameState.timeLeft === currentQuestion.timeLimit && isCorrect
          ? prev.perfectAnswers + 1
          : prev.perfectAnswers,
    }));
  };

  const nextQuestion = () => {
    if (gameState.currentQuestion + 1 >= gameState.totalQuestions) {
      // Game ended
      setGameState((prev) => ({ ...prev, gameEnded: true }));
    } else {
      // Next question
      const nextQ = questions[gameState.currentQuestion + 1];
      setGameState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        answered: false,
        selectedAnswer: null,
        isCorrect: null,
        timeLeft: nextQ.timeLimit,
      }));
    }
  };

  const restartGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      timeLeft: questions[0].timeLimit,
      streak: 0,
      totalQuestions: 15,
      answered: false,
      selectedAnswer: null,
      isCorrect: null,
      gameStarted: true,
      gameEnded: false,
      multiplier: 1,
      perfectAnswers: 0,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400 bg-green-400/20 border-green-400/50";
      case "medium":
        return "text-yellow-400 bg-yellow-400/20 border-yellow-400/50";
      case "hard":
        return "text-red-400 bg-red-400/20 border-red-400/50";
      default:
        return "text-gray-400 bg-gray-400/20 border-gray-400/50";
    }
  };

  const getAnswerButtonStyle = (index: number) => {
    if (!gameState.answered) {
      return "neo-card bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:border-golden-400/50 transition-all duration-300 hover:scale-[1.02]";
    }

    if (index === currentQuestion.correctAnswer) {
      return "neo-card bg-gradient-to-r from-green-500/30 to-green-600/30 border-green-400/70";
    }

    if (index === gameState.selectedAnswer && !gameState.isCorrect) {
      return "neo-card bg-gradient-to-r from-red-500/30 to-red-600/30 border-red-400/70";
    }

    return "neo-card bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-700/30 opacity-50";
  };

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <ParticleBackground />
        <Navbar />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-golden-400/10 rounded-full blur-xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-32 right-20 w-40 h-40 bg-blue-400/10 rounded-full blur-xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Hero Section */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-center gap-4 mb-6"
              >
                <div className="relative">
                  <IconBolt className="text-golden-400" size={64} />
                  <motion.div
                    className="absolute inset-0 bg-golden-400/20 rounded-full blur-md"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-golden-400 via-golden-300 to-golden-500 bg-clip-text text-transparent">
                  Quiz Arena
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-2xl mb-8 font-light"
              >
                Compete against players worldwide in real-time knowledge battles
              </motion.p>

              {/* Live Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-8 mb-12"
              >
                <div className="flex items-center gap-2 bg-green-400/20 px-4 py-2 rounded-full border border-green-400/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-semibold">
                    1,247 Online
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-blue-400/20 px-4 py-2 rounded-full border border-blue-400/30">
                  <IconUsers className="text-blue-400" size={16} />
                  <span className="text-blue-400 font-semibold">
                    5 Players in Queue
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Game Rules */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2"
              >
                <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-8 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <IconShield className="text-golden-400" size={32} />
                    <h2 className="text-3xl font-bold text-golden-400">
                      Battle Rules
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <IconClock className="text-blue-400" size={16} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Speed Bonus
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Answer faster to earn massive time bonuses
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <IconFlame className="text-orange-400" size={16} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Streak Power
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Build streaks to unlock score multipliers up to 5x
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <IconBolt className="text-purple-400" size={16} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Perfect Answers
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Answer within 1 second for perfect bonus
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <IconTarget className="text-red-400" size={16} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Difficulty Multiplier
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Hard questions give 3x points, Medium 2x
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <IconTrophy className="text-green-400" size={16} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            Live Rankings
                          </h3>
                          <p className="text-gray-400 text-sm">
                            Real-time leaderboard during matches
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-golden-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <IconStar className="text-golden-400" size={16} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Rewards</h3>
                          <p className="text-gray-400 text-sm">
                            Earn tokens and climb the global leaderboard
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Current Players */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-6 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <IconUsers className="text-blue-400" size={24} />
                    <h3 className="text-xl font-bold text-blue-400">
                      Players in Lobby
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {players.slice(0, 4).map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                      >
                        <div className="text-2xl">{player.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">
                              {player.username}
                            </span>
                            {player.isOnline && (
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">
                            Score: {player.score.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-golden-400 font-bold">
                          #{player.rank}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-golden-400/10 rounded-lg border border-golden-400/30">
                    <p className="text-golden-400 text-sm text-center">
                      🔥 Match starting in 30 seconds...
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <motion.button
                onClick={startGame}
                className="relative group overflow-hidden bg-gradient-to-r from-golden-500 via-golden-400 to-golden-600 text-white px-16 py-6 rounded-2xl text-2xl font-bold transition-all duration-300 border border-golden-400/50"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-golden-600 to-golden-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3">
                  <IconBolt size={32} />
                  <span>Join Battle</span>
                  <IconArrowRight size={32} />
                </div>
              </motion.button>

              <p className="text-gray-400 mt-4">
                Ready to prove your knowledge? The arena awaits!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (gameState.gameEnded) {
    const accuracy = Math.round(
      (gameState.score / (gameState.totalQuestions * 1000)) * 100
    );
    const rank =
      gameState.score > 15000
        ? 1
        : gameState.score > 12000
        ? 2
        : gameState.score > 8000
        ? 3
        : 4;
    const rankColors = {
      1: "from-yellow-400 to-yellow-600",
      2: "from-gray-300 to-gray-500",
      3: "from-orange-400 to-orange-600",
      4: "from-purple-400 to-purple-600",
    };
    const rankIcons = {
      1: <IconCrown size={48} />,
      2: <IconMedal size={48} />,
      3: <IconMedal size={48} />,
      4: <IconTrophy size={48} />,
    };

    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <ParticleBackground />
        <Navbar />

        {/* Celebration Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-golden-400 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                opacity: 1,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: window.innerHeight + 20,
                opacity: 0,
                rotate: 360,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6 py-8 pt-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            {/* Victory Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r ${
                  rankColors[rank as keyof typeof rankColors]
                } rounded-full mb-6 relative`}
              >
                <div className="text-black">
                  {rankIcons[rank as keyof typeof rankIcons]}
                </div>
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-6xl font-bold bg-gradient-to-r from-golden-400 to-golden-600 bg-clip-text text-transparent mb-4"
              >
                Battle Complete!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-2xl text-gray-300"
              >
                {rank === 1
                  ? "🏆 LEGENDARY VICTORY!"
                  : rank === 2
                  ? "🥈 Outstanding Performance!"
                  : rank === 3
                  ? "🥉 Great Job!"
                  : "💪 Well Played!"}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Final Stats */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="lg:col-span-2"
              >
                <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-8">
                  <h2 className="text-3xl font-bold text-golden-400 mb-8 flex items-center gap-3">
                    <IconTarget />
                    Your Performance
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                      className="text-center"
                    >
                      <div className="text-4xl font-bold text-golden-400 mb-2">
                        {gameState.score.toLocaleString()}
                      </div>
                      <div className="text-gray-400">Final Score</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.1, type: "spring" }}
                      className="text-center"
                    >
                      <div className="text-4xl font-bold text-green-400 mb-2">
                        {accuracy}%
                      </div>
                      <div className="text-gray-400">Accuracy</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <IconFlame className="text-orange-400" size={24} />
                        <div className="text-4xl font-bold text-orange-400">
                          {gameState.streak}
                        </div>
                      </div>
                      <div className="text-gray-400">Best Streak</div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3, type: "spring" }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <IconBolt className="text-purple-400" size={24} />
                        <div className="text-4xl font-bold text-purple-400">
                          {gameState.perfectAnswers}
                        </div>
                      </div>
                      <div className="text-gray-400">Perfect Answers</div>
                    </motion.div>
                  </div>

                  {/* Achievements */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-golden-400 mb-4">
                      🏅 Achievements Unlocked
                    </h3>
                    {gameState.streak >= 5 && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="flex items-center gap-3 p-3 bg-orange-500/20 rounded-lg border border-orange-400/30"
                      >
                        <IconFlame className="text-orange-400" size={24} />
                        <div>
                          <div className="text-white font-semibold">
                            Streak Master
                          </div>
                          <div className="text-gray-400 text-sm">
                            Achieved 5+ correct answers in a row
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {gameState.perfectAnswers >= 3 && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.7 }}
                        className="flex items-center gap-3 p-3 bg-purple-500/20 rounded-lg border border-purple-400/30"
                      >
                        <IconBolt className="text-purple-400" size={24} />
                        <div>
                          <div className="text-white font-semibold">
                            Lightning Fast
                          </div>
                          <div className="text-gray-400 text-sm">
                            3+ perfect speed answers
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {accuracy >= 90 && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.9 }}
                        className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg border border-green-400/30"
                      >
                        <IconTarget className="text-green-400" size={24} />
                        <div>
                          <div className="text-white font-semibold">
                            Sharpshooter
                          </div>
                          <div className="text-gray-400 text-sm">
                            90%+ accuracy achieved
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Final Leaderboard */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-6">
                  <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                    <IconTrophy />
                    Final Rankings
                  </h3>

                  <div className="space-y-3">
                    {players.slice(0, 5).map((player, index) => {
                      const isYou = player.username === "You";
                      const finalScore = isYou ? gameState.score : player.score;

                      return (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.2 + index * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                            isYou
                              ? "bg-golden-500/20 border-golden-400/50 transform scale-105"
                              : "bg-gray-800/50 border-gray-700/30"
                          }`}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700">
                            <span className="text-white font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <div className="text-2xl">{player.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold ${
                                  isYou ? "text-golden-400" : "text-white"
                                }`}
                              >
                                {player.username}
                              </span>
                              {isYou && (
                                <span className="text-xs bg-golden-400 text-black px-2 py-1 rounded-full">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">
                              {finalScore.toLocaleString()} pts
                            </p>
                          </div>
                          {index < 3 && (
                            <div className="flex items-center gap-1">
                              {index === 0 ? (
                                <IconChevronUp
                                  className="text-green-400"
                                  size={20}
                                />
                              ) : index === 1 ? (
                                <IconChevronUp
                                  className="text-blue-400"
                                  size={20}
                                />
                              ) : (
                                <IconChevronDown
                                  className="text-red-400"
                                  size={20}
                                />
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-golden-500/20 to-golden-600/20 rounded-lg border border-golden-400/30">
                    <div className="text-center">
                      <div className="text-golden-400 font-bold text-lg">
                        +{Math.floor(gameState.score / 100)} Tokens Earned
                      </div>
                      <div className="text-gray-400 text-sm">
                        Added to your account
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <motion.button
                onClick={restartGame}
                className="neo-button bg-gradient-to-r from-golden-500 to-golden-600 text-black px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconRefresh size={24} />
                <span className="text-lg">Play Again</span>
              </motion.button>

              <motion.button
                onClick={() => router.push("/leaderboard")}
                className="neo-button bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconTrophy size={24} />
                <span className="text-lg">View Leaderboard</span>
              </motion.button>

              <motion.button
                onClick={() => router.push("/community")}
                className="neo-button bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconUsers size={24} />
                <span className="text-lg">Share Victory</span>
              </motion.button>

              <motion.button
                onClick={() => router.push("/")}
                className="neo-button bg-gradient-to-r from-gray-700 to-gray-800 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconHome size={24} />
                <span className="text-lg">Home</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <div className="relative z-10 container mx-auto px-6 py-8 pt-32">
        {/* Live Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-semibold">LIVE</span>
            </div>

            <div className="neo-card bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-600/50 px-4 py-2">
              <span className="text-blue-400 font-semibold">
                Question {gameState.currentQuestion + 1}/
                {gameState.totalQuestions}
              </span>
            </div>
          </div>

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

        {/* Progress Bar with Animation */}
        <div className="relative mb-8">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{
                scaleX:
                  (gameState.currentQuestion + 1) / gameState.totalQuestions,
              }}
              className="h-full bg-gradient-to-r from-golden-400 to-golden-600 rounded-full origin-left"
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {Math.round(
                ((gameState.currentQuestion + 1) / gameState.totalQuestions) *
                  100
              )}
              %
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Live Leaderboard Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 order-2 lg:order-1"
          >
            <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-700/50 p-6 sticky top-32">
              <div className="flex items-center gap-3 mb-6">
                <IconUsers className="text-blue-400" size={24} />
                <h3 className="text-xl font-bold text-blue-400">
                  Live Rankings
                </h3>
              </div>

              {/* Current Player Stats */}
              <div className="mb-6 p-4 bg-golden-500/20 rounded-lg border border-golden-400/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-golden-400 mb-1">
                    {gameState.score.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm mb-3">Your Score</div>

                  {gameState.streak > 0 && (
                    <div className="flex items-center justify-center gap-2">
                      <IconFlame className="text-orange-400" size={16} />
                      <span className="text-orange-400 font-semibold">
                        {gameState.streak} streak
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Players */}
              <div className="space-y-3">
                {players.slice(0, 4).map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                      player.username === "You"
                        ? "bg-golden-500/20 border-golden-400/50"
                        : "bg-gray-800/50 border-gray-700/30"
                    }`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="text-lg">{player.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">
                          {player.username}
                        </span>
                        {player.isOnline && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-gray-400 text-xs">
                        {player.username === "You"
                          ? gameState.score.toLocaleString()
                          : player.score.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-blue-400 text-sm text-center">
                  ⚡ Next question in{" "}
                  {gameState.answered ? "5" : gameState.timeLeft}s
                </p>
              </div>
            </div>
          </motion.div>

          {/* Main Question Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
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
                      <span className="text-golden-400 text-sm font-semibold bg-golden-400/20 px-3 py-1 rounded-full border border-golden-400/30">
                        {currentQuestion.category}
                      </span>

                      {gameState.answered && gameState.isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30"
                        >
                          <IconCheck className="text-green-400" size={16} />
                          <span className="text-green-400 font-semibold">
                            Correct!
                          </span>
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

                    <h2 className="text-3xl font-bold text-white leading-relaxed">
                      {currentQuestion.question}
                    </h2>
                  </div>

                  {/* Answer Options with Enhanced Styling */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {currentQuestion.options.map((option, index) => (
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
                        <div className="absolute inset-0 bg-gradient-to-r from-golden-400/0 to-golden-400/0 group-hover:from-golden-400/10 group-hover:to-golden-400/5 transition-all duration-300" />

                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                                gameState.answered &&
                                index === currentQuestion.correctAnswer
                                  ? "bg-green-500 border-green-400 text-white"
                                  : gameState.answered &&
                                    index === gameState.selectedAnswer &&
                                    !gameState.isCorrect
                                  ? "bg-red-500 border-red-400 text-white"
                                  : "bg-gray-800/50 border-gray-600 text-gray-400"
                              }`}
                            >
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="text-xl text-white group-hover:text-golden-400 transition-colors duration-300">
                              {option}
                            </span>
                          </div>

                          <div className="text-right">
                            {gameState.answered && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                {index === currentQuestion.correctAnswer && (
                                  <IconCheck
                                    className="text-green-400"
                                    size={32}
                                  />
                                )}
                                {index === gameState.selectedAnswer &&
                                  !gameState.isCorrect && (
                                    <IconX className="text-red-400" size={32} />
                                  )}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Explanation */}
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
                </div>

                {/* Next Button */}
                <AnimatePresence>
                  {gameState.answered && (
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
                        <span>
                          {gameState.currentQuestion + 1 >=
                          gameState.totalQuestions
                            ? "Finish Battle"
                            : "Next Question"}
                        </span>
                        <IconArrowRight size={24} />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
