"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import bs58 from "bs58";

export default function PrizeClaimComponent() {
  const { publicKey, signMessage, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [claimResult, setClaimResult] = useState<any>(null);

  // ✅ Get gameId from URL
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;

  const handleClaimPrize = async () => {
    if (!connected || !publicKey || !signMessage) {
      setMessage("Please connect your wallet first");
      return;
    }
    if (!gameId) {
      setMessage("Game ID is missing in the URL");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const timestamp = Date.now();
      const messageToSign = `Claim prize for game: ${gameId} at ${timestamp}`;
      setMessage("Please sign the verification message...");

      const messageBytes = new TextEncoder().encode(messageToSign);
      const signature = await signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);

      setMessage("Submitting claim request...");
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
      if (res.ok) {
        setClaimResult(result);
        setMessage(`Prize claimed! Tx: ${result.data.transactionSignature}`);
      } else {
        setMessage(result.error || "Failed to claim prize");
      }
    } catch (err: any) {
      console.error("Claim error:", err);
      setMessage(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      {!connected ? (
        <p>Connect your wallet to claim prizes</p>
      ) : (
        <>
          <button
            onClick={handleClaimPrize}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "🏆 Claim Prize"}
          </button>
          {message && <p className="mt-4 text-yellow-400">{message}</p>}
          {claimResult && (
            <div className="mt-4 p-4 bg-green-900 rounded-lg">
              <h3 className="text-green-400 font-bold">🎉 Claim Successful!</h3>
              <p>Rank: #{claimResult.data.rank}</p>
              <p>Prize: {claimResult.data.prizeAmount} SOL</p>
              <p>Player: {claimResult.data.username}</p>
              {claimResult.data.transactionSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${claimResult.data.transactionSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-xs"
                >
                  View Transaction
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
