"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { GameCard } from "@/components/GameCard";
import ComingSoon from "@/app/ComingSoon/page";

import ParticleBackground from "@/components/ParticleBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { IconTrophy, IconUsers, IconStar } from "@tabler/icons-react";

const games = [
  {
    id: 1,
    title: "GTA V",
    description:
      "Train your knowledge of Los Santos and prove you're the ultimate GTA expert.",
    image: "/gtavr.jpg",
    isAvailable: true,
    // difficulty: "Medium" as const,
    // players: 1500,
    // rating: 4.8,
  },
  {
    id: 2,
    title: "God of War",
    description:
      "Train your expertise in Norse mythology and Kratos' epic journey.",
    image: "/gowr.jpg",
    isAvailable: false,
    // difficulty: "Hard" as const,
    // players: 800,
    // rating: 4.9,
  },
  {
    id: 3,
    title: "Need for Speed",
    description:
      "Race through questions about cars, tracks, and legendary moments.",
    image: "/nfsr.jpg",
    isAvailable: false,
    // difficulty: "Easy" as const,
    // players: 600,
    // rating: 4.6,
  },
  {
    id: 4,
    title: "Ghost of Tsushima",
    description:
      "Prove your mastery of samurai lore and feudal Japanese history.",
    image: "/gotr.jpg",
    isAvailable: false,
    // difficulty: "Medium" as const,
    // players: 450,
    // rating: 4.7,
  },
  {
    id: 5,
    title: "Call of Duty",
    description: "Train your tactical knowledge and CoD series expertise.",
    image: "/codr.jpg",
    isAvailable: false,
    // difficulty: "Hard" as const,
    // players: 2000,
    // rating: 4.5,
  },
  {
    id: 6,
    title: "Minecraft",
    description: "Train your crafting knowledge and survival skills.",
    image: "/minecraftr.jpg",
    isAvailable: false,
    // difficulty: "Easy" as const,
    // players: 3000,
    // rating: 4.9,
  },
];

const Index = () => {
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("");
  const router = useRouter();

  const handleGameSelect = (gameId: number) => {
    const game = games.find((g) => g.id === gameId);
    if (game) {
      if (game.isAvailable) {
        setSelectedGame(gameId);
        router.push(`/game/${gameId}`);
      } else {
        setComingSoonTitle(game.title);
        setShowComingSoon(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-jinblack text-white relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Navigation */}
      <Navbar />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Games Section */}
        <section className="py-20 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold futuristic-text text-jingold mb-4">
                Choose Your AI
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Select from our collection of popular games AI and train
                yourself to become a gaming expert. Each game offers unique
                EXPERIENCE
              </p>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="neo-card p-2">
                <div className="flex gap-2">
                  {["All Games", "Available", "Coming Soon"].map(
                    (tab, index) => (
                      <motion.button
                        key={tab}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          index === 0
                            ? "bg-jingold text-jinblack"
                            : "text-jingold hover:bg-jingold/10"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tab}
                      </motion.button>
                    )
                  )}
                </div>
              </div>
            </motion.div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <GameCard
                    game={game}
                    onClick={() => handleGameSelect(game.id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="neo-card p-8 md:p-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-jingold/20 rounded-full">
                    <IconTrophy size={32} className="text-jingold" />
                  </div>
                  <h3 className="text-2xl font-bold futuristic-text text-jingold">
                    Compete
                  </h3>
                  <p className="text-gray-300">
                    Challenge players worldwide and climb the leaderboards to
                    prove your gaming expertise
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-jingold/20 rounded-full">
                    <IconUsers size={32} className="text-jingold" />
                  </div>
                  <h3 className="text-2xl font-bold futuristic-text text-jingold">
                    Connect
                  </h3>
                  <p className="text-gray-300">
                    Join a community of passionate gamers and share your
                    achievements with friends
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-jingold/20 rounded-full">
                    <IconStar size={32} className="text-jingold" />
                  </div>
                  <h3 className="text-2xl font-bold futuristic-text text-jingold">
                    Earn
                  </h3>
                  <p className="text-gray-300">
                    Get rewarded for your knowledge with tokens, badges, and
                    exclusive gaming content
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <ComingSoon
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        gameTitle={comingSoonTitle}
      />
    </div>
  );
};

export default Index;
