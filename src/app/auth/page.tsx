"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";

import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function AuthPage() {
  const { wallet, publicKey, signMessage } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!publicKey || !signMessage) {
      setError("Connect your wallet first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce = Math.random().toString(36).substring(2, 8);
      const message = `Sign in to JinAI\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      const signatureBase58 = bs58.encode(signature);

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          signature: signatureBase58,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        setError(data.error || "Authentication failed.");
        return;
      }

      sessionStorage.setItem("jwt", data.token);
      router.push("/host");
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to authenticate. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <ParticleBackground />
      <motion.div
        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="neo-card bg-black/80 border border-gray-700 p-10 rounded-xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-golden-400 mb-4">
            Sign In to JinAI
          </h1>
          <p className="text-gray-400 mb-6">
            Connect your Solana wallet and sign a message to authenticate.
          </p>

          <div className="flex justify-center mb-4">
            <WalletMultiButton />
          </div>

          <button
            disabled={!publicKey || !signMessage || loading}
            onClick={handleLogin}
            className="neo-button w-full bg-golden-400 text-black font-semibold py-2 px-4 rounded hover:bg-golden-500 transition"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="loader" />
              </div>
            ) : (
              "🔐 Sign In"
            )}
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-4 whitespace-pre-wrap">
              {error}
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
}
