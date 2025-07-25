"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ResultsScreen from "@/components/ResultsScreen";

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

export default function ResultsPage() {
  const { gameId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    streak: 0,
    perfectAnswers: 0,
  });
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    if (!token || !gameId) {
      router.push("/");
      return;
    }

    fetch(`/api/quiz/results?gameId=${gameId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success || !data.results) {
          console.warn("Failed to fetch results");
          return;
        }

        const myId = getUserIdFromJWT(token);
        const me = data.results.find((r: any) => r.userId === myId);

        if (me) {
          setGameState({
            score: me.totalScore,
            streak: 0, // if you want streak, you'd need to fetch it from backend
            perfectAnswers: me.correctAnswers, // assumes perfect = correct
          });

          const acc = me.totalAnswers
            ? Math.round((me.correctAnswers / me.totalAnswers) * 100)
            : 0;

          setAccuracy(acc);
        }

        const formattedPlayers = data.results.map((r: any) => ({
          id: r.userId,
          username: r.username,
          wallet: r.walletAddress,
          score: r.totalScore,
        }));

        setPlayers(formattedPlayers);
      })
      .finally(() => setLoading(false));
  }, [gameId]);

  const getUserIdFromJWT = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center pt-24 text-xl">
        Loading final results...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <ResultsScreen
        players={players}
        gameState={gameState}
        accuracy={accuracy}
      />
    </div>
  );
}
