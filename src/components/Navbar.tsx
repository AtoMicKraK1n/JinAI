import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IconBolt,
  IconTrophy,
  IconUsers,
  IconSettings,
} from "@tabler/icons-react";
import { ConnectWallet } from "./ConnectWallet";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
              onClick={() => navigate("/")}
            >
              <div className="p-2 bg-gradient-to-br from-jingold to-jingold-dark rounded-lg glow-effect">
                <IconBolt size={24} className="text-jinblack" />
              </div>
              <h1 className="text-3xl font-bold futuristic-text text-jingold">
                Jin<span className="text-jingold-light">AI</span>
              </h1>
            </motion.div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center gap-6">
              <motion.button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-jingold/20 text-jingold transition-all duration-300 ${
                  isActive("/leaderboard")
                    ? "bg-jingold/30 border-jingold/50"
                    : "bg-jingold/10 hover:bg-jingold/20"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/leaderboard")}
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
                onClick={() => navigate("/community")}
              >
                <IconUsers size={18} />
                <span className="text-sm font-semibold">Community</span>
              </motion.button>

              <motion.button
                className={`p-2 rounded-lg border border-jingold/20 text-jingold transition-all duration-300 ${
                  isActive("/settings")
                    ? "bg-jingold/30 border-jingold/50"
                    : "bg-jingold/10 hover:bg-jingold/20"
                }`}
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/settings")}
              >
                <IconSettings size={18} />
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
