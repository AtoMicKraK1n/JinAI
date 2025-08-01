"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import socket from "@/lib/socket";
import GameScreen from "@/components/GameScreen";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import { useTimer } from "@/hooks/useTimer";
import { getDifficultyColor } from "@/lib/utils";

socket.connect();

function getCurrentUserId(): string | null {
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

  const userId = getCurrentUserId();
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

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    if (!token || !gameId) return;

    socket.emit("join-game", { gameId, token });

    socket.on("existing-players", (playersList) => {
      setPlayers(playersList);
    });

    socket.on("player-joined", (data) => {
      setPlayers((prev) => {
        const exists = prev.some((p) => p.userId === data.userId);
        return exists ? prev : [...prev, data];
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
      startTimer();
    });

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
    };
  }, [gameId]);

  useEffect(() => {
    setGameState((prev) => ({ ...prev, timeLeft }));
  }, [timeLeft]);

  const selectAnswer = async (index: number) => {
    if (answered) return;

    const token = sessionStorage.getItem("jwt");
    if (!token || !userId) {
      console.warn("JWT missing, cannot submit answer");
      return;
    }

    const currentQ = questions[gameState.currentQuestion];
    if (!currentQ) {
      console.warn("No current question");
      return;
    }

    setAnswered(true); // 👈 UI immediately locks the selection
    setGameState((prev) => ({
      ...prev,
      selectedAnswer: index,
    }));

    // Start a fallback timeout: if response takes too long, still show something
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s max wait

    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          gameId,
          questionId: currentQ.id,
          selectedAnswer: index,
          responseTime: (30 - gameState.timeLeft) * 1000,
        }),
      });

      clearTimeout(timeout);

      const data = await res.json();

      if (!data.success) {
        console.warn("Failed to submit answer:", data.message || data.error);
        return;
      }

      const { isCorrect, points, correctAnswer } = data.result;

      setGameState((prev) => ({
        ...prev,
        isCorrect,
        score: prev.score + points,
        streak: isCorrect ? prev.streak + 1 : 0,
        multiplier: isCorrect ? prev.multiplier + 1 : 1,
        perfectAnswers: isCorrect
          ? prev.perfectAnswers + 1
          : prev.perfectAnswers,
        correctAnswer,
      }));

      socket.emit("score-update", {
        gameId,
        userId,
        score: gameState.score + points,
      });
    } catch (err) {
      console.warn("Answer submission failed or slow:", err);
      setGameState((prev) => ({
        ...prev,
        isCorrect: false,
        correctAnswer: null,
      }));
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
