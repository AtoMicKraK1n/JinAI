"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ParticleBackground from "@/components/ParticleBackground";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function HostStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOrCreateGame = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) {
        alert("Please log in first.");
        router.push("/auth");
        return;
      }

      try {
        // ✅ Try to fetch latest WAITING game
        const res = await fetch("/api/games/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data?.gameId) {
          //Join existing WAITING game
          router.push(`/lobby/${data.gameId}`);
        } else {
          //Create new game if no joinable one
          const createRes = await fetch("/api/games/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              entryFeeBps: 500,
              minDeposit: 1 * 1e9, // 1 SOL
              endTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
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
        className="relative z-10 min-h-screen flex items-center justify-center"
      >
        <div className="bg-black/60 p-10 rounded-lg border border-gray-700 shadow-lg text-center">
          <h1 className="text-4xl font-bold text-golden-400 mb-6">
            {loading ? "Checking for existing game..." : "Redirecting..."}
          </h1>
        </div>
      </motion.div>
    </>
  );
}
