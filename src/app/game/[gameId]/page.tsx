"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";
import GameScreen from "@/components/GameScreen";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import { useTimer } from "@/hooks/useTimer";
import { getDifficultyColor } from "@/lib/utils";

const socket: Socket = io("http://localhost:4000");

export default function QuizGamePage() {
  const { gameId } = useParams();
  const router = useRouter();

  const [players, setPlayers] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [gameState, setGameState] = useState({
    currentQuestion: 0,
    totalQuestions: 0,
    answered: false,
    isCorrect: false,
    selectedAnswer: null,
    score: 0,
    streak: 0,
    timeLeft: 30,
    multiplier: 1,
    perfectAnswers: 0,
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) return;

      const payloadBase64 = token.split(".")[1];
      if (!payloadBase64) return;

      const payload = JSON.parse(atob(payloadBase64));
      setUserId(payload.userId);
    } catch (err) {
      console.error("Failed to parse JWT", err);
    }
  }, []);

  const isHost = players[0]?.userId === userId;

  const { timeLeft } = useTimer({
    duration: 30,
    isRunning: !gameState.answered,
    isHost,
    roomId: gameId as string,
    socket,
    onExpire: () => {
      setGameState((prev) => ({
        ...prev,
        answered: true,
        selectedAnswer: null,
        isCorrect: false,
      }));
    },
    dependencies: [gameState.currentQuestion],
  });

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token || !gameId) return;

    socket.emit("join-game", { gameId, token });

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
        }
      });

    return () => {
      socket.disconnect();
    };
  }, [gameId]);

  useEffect(() => {
    setGameState((prev) => ({ ...prev, timeLeft }));
  }, [timeLeft]);

  const selectAnswer = async (index: number) => {
    if (gameState.answered) return;

    const token = localStorage.getItem("jwt");
    if (!token) {
      console.warn("JWT missing, cannot submit answer");
      return;
    }

    const currentQ = questions[gameState.currentQuestion];
    if (!currentQ) {
      console.warn("No current question");
      return;
    }

    const selectedOptionText = currentQ.options[index];

    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          questionId: currentQ.id, // ✅ send questionId instead of questionIndex
          selectedAnswer: selectedOptionText,
          responseTime: (30 - gameState.timeLeft) * 1000, // optional bonus
        }),
      });

      const data = await res.json();

      if (!data.success) {
        console.warn("Failed to submit answer:", data.message || data.error);
        return;
      }

      const { isCorrect, points, correctAnswer } = data.result;

      setGameState((prev) => ({
        ...prev,
        answered: true,
        selectedAnswer: index,
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
      console.error("Error submitting answer:", err);
    }
  };

  const nextQuestion = () => {
    const next = gameState.currentQuestion + 1;
    if (next >= questions.length) {
      router.push(`/quiz/${gameId}/results`);
    } else {
      setGameState((prev) => ({
        ...prev,
        currentQuestion: next,
        answered: false,
        isCorrect: false,
        selectedAnswer: null,
        timeLeft: 30,
      }));
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
            gameState={gameState}
            question={questions[gameState.currentQuestion]}
            selectAnswer={selectAnswer}
            getAnswerButtonStyle={getAnswerButtonStyle}
            nextQuestion={nextQuestion}
            getDifficultyColor={getDifficultyColor}
          />
        ) : (
          <div className="text-white text-center pt-24 text-xl">
            Loading questions or something went wrong...
          </div>
        )}
      </motion.div>
    </>
  );
}
