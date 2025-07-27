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

interface ResultFromAPI {
  userId: string;
  walletAddress: string;
  username: string;
  totalScore?: number;
  correctAnswers?: number;
  totalAnswers?: number;
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
        const me: ResultFromAPI | undefined = data.results.find(
          (r: ResultFromAPI) => r.userId === myId
        );

        if (me) {
          const score = me.totalScore ?? 0;
          const correctAnswers = me.correctAnswers ?? 0;
          const totalAnswers = me.totalAnswers ?? 0;

          setGameState({
            score,
            streak: 0,
            perfectAnswers: correctAnswers,
          });

          const acc =
            totalAnswers > 0
              ? Math.round((correctAnswers / totalAnswers) * 100)
              : 0;

          setAccuracy(acc);
        }

        const formattedPlayers: Player[] = data.results.map(
          (r: ResultFromAPI) => ({
            id: r.userId,
            username: r.username ?? "Player",
            wallet: r.walletAddress ?? "",
            score: r.totalScore ?? 0,
          })
        );

        setPlayers(formattedPlayers);
      })
      .catch((err) => {
        console.error("Failed to fetch results:", err);
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
