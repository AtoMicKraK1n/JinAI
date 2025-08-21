"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";

interface Game {
  id: string;
  poolIndex: number;
  prizeWon: number;
}

export default function ClaimListPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    if (!connected || !publicKey) return;

    async function fetchGames() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/claim/games?wallet=${publicKey.toBase58()}`
        );
        if (res.ok) {
          const data = await res.json();
          setGames(data.games);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, [connected, publicKey]);

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col">
      {/* Background Particles */}
      <ParticleBackground />

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 z-10">
        {!connected ? (
          <h1 className="text-2xl font-semibold text-center">
            Please connect your wallet to view claimable rewards
          </h1>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center text-yellow-400">
              Claim Your Rewards
            </h1>
            <div className="space-y-4 w-full max-w-md">
              {loading ? (
                <div className="neo-card flex flex-col items-center justify-center p-10 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/40 shadow-lg">
                  <div className="loader border-yellow-400"></div>
                  <p className="mt-4 text-yellow-300 font-medium">
                    Fetching rewards...
                  </p>
                </div>
              ) : games.length > 0 ? (
                games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => router.push(`/claim/${game.id}`)}
                    className="neo-card w-full p-5 rounded-xl shadow-lg transition flex justify-between items-center bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/40 hover:scale-[1.02] hover:shadow-yellow-400/40"
                  >
                    <span className="font-semibold text-lg text-yellow-300">
                      Game {game.poolIndex}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      +{game.prizeWon} SOL
                    </span>
                  </button>
                ))
              ) : (
                <div className="neo-card flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/40 shadow-lg">
                  <p className="text-lg text-gray-400 text-center">
                    No rewards to claim.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
