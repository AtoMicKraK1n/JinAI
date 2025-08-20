"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

interface Game {
  id: string;
  poolIndex: number;
  prizeWon: number;
}

export default function ClaimListPage() {
  const [games, setGames] = useState<Game[]>([]);
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (!connected || !publicKey) return;

    async function fetchGames() {
      const res = await fetch(
        `/api/claim/games?wallet=${publicKey.toBase58()}`
      );
      if (res.ok) {
        const data = await res.json();
        setGames(data.games);
      }
    }
    fetchGames();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl">
          Please connect your wallet to view claimable rewards
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Claim Your Rewards</h1>
      <div className="space-y-4 w-full max-w-md">
        {games.length > 0 ? (
          games.map((game) => (
            <button
              key={game.id}
              onClick={() => router.push(`/claim/${game.id}`)}
              className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl shadow-lg transition flex justify-between"
            >
              <span>Game {game.poolIndex}</span>
              <span className="text-green-400">+{game.prizeWon} SOL</span>
            </button>
          ))
        ) : (
          <p>No rewards to claim.</p>
        )}
      </div>
    </div>
  );
}
