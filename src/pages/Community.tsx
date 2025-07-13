import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  IconUsers,
  IconMessage,
  IconHeart,
  IconShare,
  IconBookmark,
  IconDots,
  IconTrophy,
  IconFlame,
  IconCalendar,
  IconEye,
} from "@tabler/icons-react";
import ParticleBackground from "../components/ParticleBackground";
import Navbar from "../components/Navbar";

interface Post {
  id: string;
  author: {
    username: string;
    avatar: string;
    level: number;
    badge?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  type: "text" | "achievement" | "game_result";
  gameData?: {
    name: string;
    score: number;
    accuracy: number;
  };
}

const Community: React.FC = () => {
  const [filter, setFilter] = useState<
    "all" | "following" | "achievements" | "discussions"
  >("all");

  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        username: "QuizMaster2024",
        avatar: "🏆",
        level: 42,
        badge: "Champion",
      },
      content:
        "Just hit a 25-game winning streak! The AI trivia questions are getting more challenging but that makes it even more fun. Who else is up for the challenge? 🔥",
      timestamp: "2 hours ago",
      likes: 47,
      comments: 12,
      shares: 8,
      isLiked: false,
      isBookmarked: true,
      type: "achievement",
    },
    {
      id: "2",
      author: {
        username: "BrainStorm_AI",
        avatar: "🧠",
        level: 38,
        badge: "Genius",
      },
      content:
        "Pro tip for new players: Focus on accuracy over speed in the beginning. Building good fundamentals will help you climb the ranks faster! What strategies have worked for you?",
      timestamp: "4 hours ago",
      likes: 89,
      comments: 23,
      shares: 15,
      isLiked: true,
      isBookmarked: false,
      type: "text",
    },
    {
      id: "3",
      author: {
        username: "PuzzleSolver",
        avatar: "🧩",
        level: 29,
      },
      content:
        "Finally broke into the top 10! This community has been so supportive. Thanks everyone for the tips and motivation! 💪",
      timestamp: "6 hours ago",
      likes: 156,
      comments: 34,
      shares: 12,
      isLiked: true,
      isBookmarked: false,
      type: "achievement",
      gameData: {
        name: "Logic Puzzles",
        score: 11890,
        accuracy: 89.4,
      },
    },
  ]);

  const communityStats = {
    totalMembers: 12847,
    activeToday: 3254,
    postsToday: 127,
    topStreak: 47,
  };

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleBookmark = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "achievement":
        return <IconTrophy className="text-golden-400" size={16} />;
      case "game_result":
        return <IconFlame className="text-orange-400" size={16} />;
      default:
        return <IconMessage className="text-blue-400" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      <div className="relative z-10 container mx-auto px-6 py-8 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <IconUsers className="text-golden-400" size={40} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-golden-400 to-golden-600 bg-clip-text text-transparent">
              Community
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Connect, share, and compete with fellow gamers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="neo-card bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-700/50 p-6 sticky top-32">
              <h2 className="text-xl font-bold text-golden-400 mb-4">
                Community Stats
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconUsers className="text-blue-400" size={20} />
                    <span className="text-gray-300">Total Members</span>
                  </div>
                  <span className="text-white font-semibold">
                    {communityStats.totalMembers.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconEye className="text-green-400" size={20} />
                    <span className="text-gray-300">Active Today</span>
                  </div>
                  <span className="text-green-400 font-semibold">
                    {communityStats.activeToday.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconMessage className="text-purple-400" size={20} />
                    <span className="text-gray-300">Posts Today</span>
                  </div>
                  <span className="text-purple-400 font-semibold">
                    {communityStats.postsToday}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconFlame className="text-orange-400" size={20} />
                    <span className="text-gray-300">Top Streak</span>
                  </div>
                  <span className="text-orange-400 font-semibold">
                    {communityStats.topStreak}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <h3 className="text-golden-400 font-semibold mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full neo-button bg-gradient-to-r from-golden-500 to-golden-600 text-black py-2 rounded-lg font-semibold">
                    Create Post
                  </button>
                  <button className="w-full neo-button bg-gradient-to-r from-gray-700 to-gray-800 text-white py-2 rounded-lg">
                    Find Friends
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            {/* Filter Tabs */}
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50 mb-6">
              {(
                ["all", "following", "achievements", "discussions"] as const
              ).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 capitalize ${
                    filter === filterType
                      ? "bg-golden-500 text-black font-semibold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="neo-card bg-gradient-to-br from-gray-900/30 to-black/30 border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{post.author.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {post.author.username}
                          </h3>
                          {post.author.badge && (
                            <span className="px-2 py-1 bg-golden-500/20 text-golden-400 text-xs rounded-full border border-golden-400/30">
                              {post.author.badge}
                            </span>
                          )}
                          {getPostTypeIcon(post.type)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>Level {post.author.level}</span>
                          <span>•</span>
                          <span>{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <IconDots size={20} />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-200 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Game Result Card */}
                    {post.gameData && (
                      <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-golden-400 font-semibold">
                              {post.gameData.name}
                            </h4>
                            <p className="text-gray-400 text-sm">Game Result</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold text-lg">
                              {post.gameData.score.toLocaleString()}
                            </p>
                            <p className="text-green-400 text-sm">
                              {post.gameData.accuracy}% accuracy
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.isLiked
                            ? "text-red-400"
                            : "text-gray-400 hover:text-red-400"
                        }`}
                      >
                        <IconHeart
                          size={18}
                          fill={post.isLiked ? "currentColor" : "none"}
                        />
                        <span>{post.likes}</span>
                      </button>

                      <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                        <IconMessage size={18} />
                        <span>{post.comments}</span>
                      </button>

                      <button className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors">
                        <IconShare size={18} />
                        <span>{post.shares}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`transition-colors ${
                        post.isBookmarked
                          ? "text-golden-400"
                          : "text-gray-400 hover:text-golden-400"
                      }`}
                    >
                      <IconBookmark
                        size={18}
                        fill={post.isBookmarked ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Community;
