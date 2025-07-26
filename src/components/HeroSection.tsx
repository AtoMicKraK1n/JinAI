"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  IconSparkles,
  IconBrain,
  IconDeviceGamepad2,
  IconTrendingUp,
  IconBolt,
} from "@tabler/icons-react";

const HeroSection: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const features = [
    {
      icon: IconBrain,
      title: "AI-Powered",
      description: "Learn from AI",
    },
    {
      icon: IconDeviceGamepad2,
      title: "Gaming Focus",
      description: "Popular game quizzes",
    },
    {
      icon: IconTrendingUp,
      title: "Competitive",
      description: "Leaderboards & rewards",
    },
  ];

  const handleStartQuiz = () => {
    setLoading(true);
    router.push("/auth");
  };

  return (
    <section className="min-h-screen relative flex items-center justify-center pt-32 pb-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jingold/20 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-jingold-light/15 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-jingold/10 border border-jingold/20 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <IconSparkles size={20} className="text-jingold" />
              <span className="text-jingold font-semibold text-sm">
                Gaming Quizzes (Where you can earn)
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold futuristic-text mb-6">
              <span className="text-white">THE ULTIMATE</span>
              <br />
              <span className="text-jingold glow-effect">GAMING</span>
              <br />
              <span className="bg-gradient-to-r from-jingold-light via-jingold to-jingold-dark bg-clip-text text-transparent">
                EXPERIENCE
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Challenge your gaming knowledge with quizzes. Compete with players
            worldwide and earn rewards for your expertise.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={handleStartQuiz}
              disabled={loading}
              className="neo-button bg-gradient-to-r from-jingold to-jingold-dark text-jinblack text-lg px-8 py-4 font-bold flex items-center justify-center gap-2 relative"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? (
                <div className="loader"></div>
              ) : (
                <>
                  <IconBolt size={24} />
                  <span className="text-lg">Start Quiz</span>
                </>
              )}
            </motion.button>

            <motion.button
              className="neo-button text-lg px-8 py-4"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Playing Now
            </motion.button>

            <motion.button
              className="px-8 py-4 border border-jingold/30 rounded-lg text-jingold hover:bg-jingold/10 transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">Watch Demo</span>
              <div className="w-0 h-0 border-l-[8px] border-l-jingold border-y-[6px] border-y-transparent" />
            </motion.button>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="neo-card p-6 text-center group"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-jingold/20 rounded-lg mb-4 group-hover:bg-jingold/30 transition-colors">
                  <feature.icon size={24} className="text-jingold" />
                </div>
                <h3 className="text-lg font-bold text-jingold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {[] /* stats skipped for now */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
