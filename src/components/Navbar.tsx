"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { IconTrophy, IconUsers, IconGift } from "@tabler/icons-react";
import { ConnectWallet } from "./ConnectWallet";
import Image from "next/image";

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="neo-card px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              onClick={() => router.push("/")}
            >
              <div className="p-1 rounded-lg glow-effect">
                <Image
                  src="/favicon.ico"
                  alt="JinAI Logo"
                  width={28}
                  height={28}
                  className="rounded-md"
                />
              </div>
              <h1 className="text-3xl font-bold futuristic-text text-jingold">
                Jin<span className="text-jingold-light">AI</span>
              </h1>
            </motion.div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center gap-6">
              {/* <motion.button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-jingold/20 text-jingold transition-all duration-300 ${
                  isActive("/leaderboard")
                    ? "bg-jingold/30 border-jingold/50"
                    : "bg-jingold/10 hover:bg-jingold/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/leaderboard")}
              >
                <IconTrophy size={18} />
                <span className="text-sm font-semibold">Leaderboard</span>
              </motion.button>

              <motion.button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-jingold/20 text-jingold transition-all duration-300 ${
                  isActive("/community")
                    ? "bg-jingold/30 border-jingold/50"
                    : "bg-jingold/10 hover:bg-jingold/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/community")}
              >
                <IconUsers size={18} />
                <span className="text-sm font-semibold">Community</span>
              </motion.button> */}

              <motion.button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-jingold/20 text-jingold transition-all duration-300 ${
                  isActive("/claim")
                    ? "bg-jingold/30 border-jingold/50"
                    : "bg-jingold/10 hover:bg-jingold/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/claim")}
              >
                <IconGift size={18} />
                <span className="text-sm font-semibold">Claim Prize</span>
              </motion.button>
            </div>

            {/* Wallet Connection */}
            <ConnectWallet />
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
