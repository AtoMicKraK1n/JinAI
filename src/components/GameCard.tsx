import { motion } from "framer-motion";
import {
  IconDeviceGamepad2,
  IconLock,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";

interface Game {
  id: number;
  title: string;
  description: string;
  image: string;
  isAvailable?: boolean;
  difficulty?: "Easy" | "Medium" | "Hard";
  players?: number;
  rating?: number;
}

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export const GameCard = ({ game, onClick }: GameCardProps) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400";
      case "Medium":
        return "text-yellow-400";
      case "Hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <motion.div
      className="neo-card group relative overflow-hidden cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Background Image with Overlay */}
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Availability Badge */}
        <div className="absolute top-4 right-4">
          {game.isAvailable ? (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
              <IconDeviceGamepad2 size={14} className="text-green-400" />
              <span className="text-xs text-green-400 font-semibold">
                Available
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-500/30">
              <IconLock size={14} className="text-red-400" />
              <span className="text-xs text-red-400 font-semibold">Soon</span>
            </div>
          )}
        </div>

        {/* Rating */}
        {game.rating && (
          <div className="absolute top-4 left-4 flex items-center gap-1 px-2 py-1 bg-jingold/20 backdrop-blur-sm rounded-full border border-jingold/30">
            <IconStar size={14} className="text-jingold fill-current" />
            <span className="text-xs text-jingold font-semibold">
              {game.rating}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2 futuristic-text text-jingold group-hover:text-jingold-light transition-colors">
            {game.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {game.description}
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-4">
            {game.difficulty && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Difficulty:</span>
                <span
                  className={`text-xs font-semibold ${getDifficultyColor(
                    game.difficulty
                  )}`}
                >
                  {game.difficulty}
                </span>
              </div>
            )}

            {game.players && (
              <div className="flex items-center gap-1">
                <IconUsers size={14} className="text-gray-400" />
                <span className="text-xs text-gray-400">
                  {game.players}+ players
                </span>
              </div>
            )}
          </div>

          {/* Play Button */}
          <motion.button
            className="neo-button text-sm px-4 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {game.isAvailable ? "Play Now" : "Coming Soon"}
          </motion.button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-jingold/5 via-transparent to-jingold/5 rounded-2xl" />
      </div>
    </motion.div>
  );
};
