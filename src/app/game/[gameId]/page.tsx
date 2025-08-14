"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import GameScreen from "@/components/GameScreen";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import { useTimer } from "@/hooks/useTimer";
import { getDifficultyColor } from "@/lib/utils";
import socket from "@/lib/socket";

socket.connect();

// ✅ Safe helper – only runs in browser
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = sessionStorage.getItem("jwt");
    if (!token) return null;
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payload = JSON.parse(atob(payloadBase64));
    return payload.userId;
  } catch (err) {
    console.error("JWT decode failed", err);
    return null;
  }
}

export default function QuizGamePage() {
  const { gameId } = useParams();
  const router = useRouter();

  const [players, setPlayers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const [gameState, setGameState] = useState({
    currentQuestion: 0,
    totalQuestions: 0,
    isCorrect: false,
    selectedAnswer: null,
    score: 0,
    streak: 0,
    timeLeft: 30,
    multiplier: 1,
    perfectAnswers: 0,
    correctAnswer: null,
  });

  const isHost = players[0]?.userId === userId;

  const { timeLeft, startTimer } = useTimer({
    duration: 30,
    isRunning,
    isHost,
    roomId: gameId as string,
    socket,
    onExpire: () => {
      setAnswered(true);
      setGameState((prev) => ({
        ...prev,
        selectedAnswer: null,
        isCorrect: false,
      }));
    },
    dependencies: [gameState.currentQuestion],
  });

  // ✅ Get userId only in browser
  useEffect(() => {
    setUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    console.log("🎮 Game State Updated:", {
      answered: answered,
      selectedAnswer: gameState.selectedAnswer,
      isCorrect: gameState.isCorrect,
      correctAnswer: gameState.correctAnswer,
      score: gameState.score,
    });
  }, [
    answered,
    gameState.selectedAnswer,
    gameState.isCorrect,
    gameState.correctAnswer,
    gameState.score,
  ]);

  // Inside your main useEffect (the one that sets up all socket listeners)
  useEffect(() => {
    if (!userId) return;
    const token = sessionStorage.getItem("jwt");
    if (!token || !gameId) return;

    socket.emit("join-game", { gameId, token });

    socket.on("existing-players", (playersList) => {
      // ✅ Initialize players with scores
      const playersWithScores = playersList.map((player: any) => ({
        ...player,
        score: player.score || 0,
      }));
      setPlayers(playersWithScores);
    });

    socket.on("player-joined", (data) => {
      setPlayers((prev) => {
        const exists = prev.some((p) => p.userId === data.userId);
        return exists ? prev : [...prev, { ...data, score: 0 }];
      });
    });

    socket.on("score-update", (data) => {
      setPlayers((prev) =>
        prev.map((p) =>
          p.userId === data.userId ? { ...p, score: data.score } : p
        )
      );
    });

    socket.on("start-game", () => {
      console.log("🔥 Game started");
      setIsRunning(true);
      setQuestionStartTime(Date.now()); // ✅ Track when question starts
    });

    socket.on("next-question", (index: number) => {
      setGameState((prev) => ({
        ...prev,
        currentQuestion: index,
        selectedAnswer: null,
        isCorrect: false,
        correctAnswer: null,
        totalQuestions: prev.totalQuestions,
      }));
      setAnswered(false);
      setQuestionStartTime(Date.now()); // ✅ Reset timer for new question
      startTimer();
    });

    // ✅ Enhanced: Listen for answer results from the server
    socket.on("answer-result", (data) => {
      console.log("📩 Received WebSocket answer result:", data);

      const { userId: answeredUser, isCorrect, points, correctAnswer } = data;

      // ✅ Update all players' scores in real-time
      setPlayers((prev) =>
        prev.map((player) => {
          if (player.userId === answeredUser) {
            return {
              ...player,
              score: (player.score || 0) + points,
            };
          }
          return player;
        })
      );

      // ✅ If it's another player's answer, show the correct answer
      if (answeredUser !== userId) {
        setGameState((prev) => ({
          ...prev,
          correctAnswer: correctAnswer,
        }));
      }
    });

    // Fetch seed questions
    fetch(`/api/games/seed-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ gameId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          console.warn("Seed questions skipped:", data?.error || data?.message);
        } else {
          console.log("✅ Questions seeded:", data.questionsSeeded);
        }
      });

    fetch(`/api/quiz/questions?gameId=${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuestions(data.questions);
          setGameState((prev) => ({
            ...prev,
            totalQuestions: data.questions.length,
          }));

          if (isHost) {
            socket.emit("start-game", { roomId: gameId });
          }
        }
      });

    return () => {
      socket.off("player-joined");
      socket.off("score-update");
      socket.off("start-game");
      socket.off("existing-players");
      socket.off("next-question");
      socket.off("answer-result");
    };
  }, [gameId, userId, isHost]);

  useEffect(() => {
    setGameState((prev) => ({ ...prev, timeLeft }));
  }, [timeLeft]);

  const selectAnswer = async (index: number) => {
    if (typeof window === "undefined") return;

    const token = sessionStorage.getItem("jwt");
    if (!token) {
      console.error("❌ No JWT found in sessionStorage");
      return;
    }

    const currentQ = questions[gameState.currentQuestion];

    if (!token || !currentQ) {
      console.error("❌ Missing token or current question");
      return;
    }

    // ✅ Calculate actual response time
    const responseTime = Date.now() - questionStartTime;

    // ✅ INSTANTLY show feedback before API call
    setAnswered(true);
    setGameState((prev) => ({
      ...prev,
      selectedAnswer: index,
    }));

    // ✅ Get the correct answer immediately from question data
    const getCorrectAnswerIndex = () => {
      const val = currentQ.correctAnswer;

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

    const correctIndex = getCorrectAnswerIndex();
    const isCorrectAnswer = index === correctIndex;

    // ✅ INSTANTLY update UI state with correct answer
    setGameState((prev) => ({
      ...prev,
      isCorrect: isCorrectAnswer,
      correctAnswer: correctIndex,
    }));

    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          userId,
          selectedAnswer: index,
          questionId: currentQ.id,
          responseTime, // ✅ Send actual response time
        }),
      });

      const data = await res.json();

      // ✅ Update score from server response (this ensures accuracy)
      setGameState((prev) => ({
        ...prev,
        score: prev.score + data.result.points,
        streak: data.result.isCorrect ? prev.streak + 1 : 0,
        multiplier: data.result.isCorrect ? prev.multiplier + 1 : 1,
        perfectAnswers: data.result.isCorrect
          ? prev.perfectAnswers + 1
          : prev.perfectAnswers,
      }));

      // ✅ Update own score in players list
      setPlayers((prev) =>
        prev.map((player) =>
          player.userId === userId
            ? { ...player, score: (player.score || 0) + data.result.points }
            : player
        )
      );
    } catch (error) {
      console.error("Error submitting answer:", error);
      // ✅ If API fails, revert the optimistic update
      setGameState((prev) => ({
        ...prev,
        isCorrect: false,
        correctAnswer: null,
      }));
      setAnswered(false);
    }
  };

  const nextQuestion = () => {
    const next = gameState.currentQuestion + 1;
    if (next >= questions.length) {
      router.push(`/results/${gameId}`);
    } else {
      if (isHost) {
        socket.emit("next-question", next);
      }
    }
  };

  const getAnswerButtonStyle = () => "neo-button";

  return (
    <>
      <Navbar />
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 min-h-screen"
      >
        {questions.length > 0 ? (
          <GameScreen
            players={players}
            gameState={{ ...gameState, answered }}
            question={questions[gameState.currentQuestion]}
            selectAnswer={selectAnswer}
            getAnswerButtonStyle={getAnswerButtonStyle}
            nextQuestion={nextQuestion}
            getDifficultyColor={getDifficultyColor}
          />
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="neo-card bg-yellow-400 px-8 py-6 text-white text-lg text-center rounded-xl shadow-lg">
              Loading questions...
              <div className="mt-4 flex justify-center">
                <div className="loader"></div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
