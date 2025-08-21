"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";

export default function PrizeClaimPage() {
  const { publicKey, signMessage, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);

  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const handleClaimPrize = async () => {
    if (!connected || !publicKey || !signMessage) {
      toast.warning("Please connect your wallet first", { duration: 4000 });
      return;
    }
    if (!gameId) {
      toast.error("Game ID is missing in the URL", { duration: 4000 });
      return;
    }

    try {
      setIsLoading(true);

      const timestamp = Date.now();
      const messageToSign = `Claim prize for game: ${gameId} at ${timestamp}`;

      // Ask user to sign
      const messageBytes = new TextEncoder().encode(messageToSign);
      const signature = await signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);

      // Submit claim
      const res = await fetch("/api/quiz/prize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          walletAddress: publicKey.toString(),
          signature: signatureBase58,
          message: messageToSign,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error || "Failed to claim prize");
      }

      setClaimResult(result);

      // Success toast with explorer link
      const tx = result?.data?.transactionSignature;
      toast.success("Claim successful 🎉", {
        description: tx ? (
          <a
            href={`https://explorer.solana.com/tx/${tx}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Solana Explorer
          </a>
        ) : (
          "Your reward has been claimed."
        ),
        duration: 10000,
        position: "bottom-right",
      });
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong while claiming ❌", {
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col">
      {/* Toast portal */}
      <Toaster richColors position="bottom-right" duration={10000} />

      {/* Background + Navbar */}
      <ParticleBackground />
      <Navbar />

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Neo-card wrapper */}
          <div className="neo-card bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-500/40 p-8 rounded-xl shadow-xl">
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-yellow-400">
                Claim Rewards
              </h1>
              <p className="mt-2 text-gray-300">
                You’re claiming rewards for{" "}
                <span className="font-semibold text-yellow-300">{gameId}</span>
              </p>
            </div>

            {!connected ? (
              <div className="text-center text-gray-300">
                Connect your wallet to proceed.
              </div>
            ) : (
              <>
                <button
                  onClick={handleClaimPrize}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-6 py-4 font-semibold text-black shadow-lg transition-transform hover:scale-[1.02] hover:shadow-yellow-400/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "🏆 Claim Prize"}
                </button>

                {/* Claim result card */}
                {claimResult && (
                  <div className="mt-6 neo-card bg-gradient-to-br from-emerald-900/40 to-black/60 border border-emerald-400/40 p-5 text-center rounded-xl">
                    <h3 className="text-emerald-300 font-bold text-xl">
                      🎉 Claim Successful!
                    </h3>
                    <div className="mt-2 space-y-1 text-gray-200">
                      <p>Rank: #{claimResult.data.rank}</p>
                      <p>Prize: {claimResult.data.prizeAmount} SOL</p>
                      <p>Player: {claimResult.data.username}</p>
                    </div>
                    {claimResult.data.transactionSignature && (
                      <p className="mt-3 text-sm text-gray-400">
                        Last Tx:{" "}
                        <a
                          href={`https://explorer.solana.com/tx/${claimResult.data.transactionSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {claimResult.data.transactionSignature.slice(0, 8)}...
                          {claimResult.data.transactionSignature.slice(-8)}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
