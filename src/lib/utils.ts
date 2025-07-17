import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 🎯 Difficulty Badge Style Helper
export function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "hard":
      return "bg-red-500/20 border-red-500/50 text-red-400";
    case "medium":
      return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
    case "easy":
      return "bg-green-500/20 border-green-500/50 text-green-400";
    default:
      return "bg-gray-500/20 border-gray-500/50 text-gray-400";
  }
}
