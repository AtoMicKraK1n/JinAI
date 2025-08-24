"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ParticleBackground from "@/components/ParticleBackground";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import NeoCard from "@/components/NeoCard"; // ⬅️ import NeoCard

export default function HostStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const checkOrCreateGame = async () => {
      const token = sessionStorage.getItem("jwt");
      if (!token) {
        alert("Please log in first.");
        router.push("/auth");
        return;
      }

      try {
        const res = await fetch("/api/games/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data?.gameId) {
          router.push(`/lobby/${data.gameId}`);
        } else {
          const createRes = await fetch("/api/games/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              entryFeeBps: 10000,
              minDeposit: 1 * 1e9, // 1 SOL
              endTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
              prizeDistribution: [40, 30, 10, 10],
            }),
          });

          const createData = await createRes.json();
          if (createData.success) {
            router.push(`/lobby/${createData.gameId}`);
          } else {
            console.error(createData);
            alert("❌ Failed to create game");
          }
        }
      } catch (err) {
        console.error("Game setup failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkOrCreateGame();
  }, [router]);

  return (
    <>
      <Navbar />
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 min-h-screen px-6 pt-32"
      >
        <div className="flex justify-center items-center h-[70vh]">
          <NeoCard className="w-full max-w-md text-center p-10">
            <h1 className="text-3xl font-semibold text-yellow-400 mb-4 font-sans antialiased">
              {loading ? "Checking for existing game..." : "Redirecting..."}
            </h1>
            <p className="text-gray-400">
              Please wait while we prepare your quiz session.
            </p>
          </NeoCard>
        </div>
      </motion.div>
    </>
  );
}
