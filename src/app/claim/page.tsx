"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import ClaimPrizeButton from "@/components/ClaimPrizeButton";
import { motion } from "framer-motion";

export default function ClaimPage() {
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
        <div className="neo-card bg-black/80 border border-gray-700 p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-golden-400 mb-4">
            Claim Your Prize
          </h1>
          <p className="text-gray-400 mb-6">
            If you're one of the winners, click below to claim your Solana
            prize.
          </p>

          <ClaimPrizeButton gameId={""} poolIndex={0} />
        </div>
      </motion.div>
    </>
  );
}
