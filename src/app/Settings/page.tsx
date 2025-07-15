import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  IconSettings,
  IconUser,
  IconBell,
  IconPalette,
  IconVolume,
  IconShield,
  IconLanguage,
  IconKey,
  IconTrash,
  IconSun,
  IconMoon,
  IconToggleLeft,
  IconToggleRight,
  IconEdit,
} from "@tabler/icons-react";
import ParticleBackground from "../../components/ParticleBackground";
import Navbar from "../../components/Navbar";

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState("profile");

  // Settings state
  const [profile, setProfile] = useState({
    username: "QuizMaster2024",
    email: "user@example.com",
    bio: "Competitive gamer and trivia enthusiast",
    avatar: "🏆",
  });

  const [notifications, setNotifications] = useState({
    gameInvites: true,
    achievements: true,
    leaderboardUpdates: false,
    weeklyReport: true,
    communityPosts: true,
    friendRequests: true,
  });

  const [appearance, setAppearance] = useState({
    theme: "dark",
    accentColor: "golden",
    animationsEnabled: true,
    particleBackground: true,
    soundEffects: true,
  });

  const [audio, setAudio] = useState({
    masterVolume: 75,
    musicVolume: 60,
    sfxVolume: 80,
    voiceVolume: 70,
    muteWhenInactive: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showOnlineStatus: true,
    allowFriendRequests: true,
    showGameHistory: true,
    dataCollection: false,
  });

  const sections: SettingsSection[] = [
    { id: "profile", name: "Profile", icon: <IconUser size={20} /> },
    {
      id: "notifications",
      name: "Notifications",
      icon: <IconBell size={20} />,
    },
    { id: "appearance", name: "Appearance", icon: <IconPalette size={20} /> },
    { id: "audio", name: "Audio", icon: <IconVolume size={20} /> },
    {
      id: "privacy",
      name: "Privacy & Security",
      icon: <IconShield size={20} />,
    },
  ];

  const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
  }> = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`p-1 rounded-full transition-colors ${
        enabled ? "text-golden-400" : "text-gray-500"
      }`}
    >
      {enabled ? <IconToggleRight size={24} /> : <IconToggleLeft size={24} />}
    </button>
  );

  const VolumeSlider: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
  }> = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-300">{label}</span>
        <span className="text-golden-400 font-semibold">{value}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );

  const renderProfileSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-golden-400 mb-6">
        Profile Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Username</label>
            <div className="relative">
              <input
                type="text"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-golden-400 focus:outline-none"
              />
              <IconEdit
                className="absolute right-3 top-3 text-gray-400"
                size={20}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-golden-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Avatar</label>
            <div className="flex items-center gap-4">
              <div className="text-4xl bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                {profile.avatar}
              </div>
              <button className="neo-button bg-gradient-to-r from-golden-500 to-golden-600 text-black px-4 py-2 rounded-lg">
                Change Avatar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-golden-400 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button className="neo-button bg-gradient-to-r from-golden-500 to-golden-600 text-black px-6 py-3 rounded-lg font-semibold">
          Save Changes
        </button>
        <button className="neo-button bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-3 rounded-lg">
          Reset
        </button>
      </div>
    </motion.div>
  );

  const renderNotificationsSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-golden-400 mb-6">
        Notification Preferences
      </h2>

      <div className="space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
          >
            <div>
              <h3 className="text-white font-medium capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </h3>
              <p className="text-gray-400 text-sm">
                {key === "gameInvites" &&
                  "Receive notifications when friends invite you to games"}
                {key === "achievements" &&
                  "Get notified when you unlock new achievements"}
                {key === "leaderboardUpdates" &&
                  "Updates when your leaderboard position changes"}
                {key === "weeklyReport" &&
                  "Weekly summary of your gaming performance"}
                {key === "communityPosts" &&
                  "Notifications from community posts and discussions"}
                {key === "friendRequests" &&
                  "Alerts when someone sends you a friend request"}
              </p>
            </div>
            <ToggleSwitch
              enabled={value}
              onChange={(enabled) =>
                setNotifications({ ...notifications, [key]: enabled })
              }
            />
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderAppearanceSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-golden-400 mb-6">
        Appearance & Display
      </h2>

      <div className="space-y-6">
        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <h3 className="text-white font-medium mb-4">Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAppearance({ ...appearance, theme: "dark" })}
              className={`p-4 rounded-lg border-2 transition-all ${
                appearance.theme === "dark"
                  ? "border-golden-400 bg-gray-900"
                  : "border-gray-700 bg-gray-800/50"
              }`}
            >
              <IconMoon className="mx-auto mb-2 text-blue-400" size={24} />
              <span className="text-white">Dark</span>
            </button>
            <button
              onClick={() => setAppearance({ ...appearance, theme: "light" })}
              className={`p-4 rounded-lg border-2 transition-all ${
                appearance.theme === "light"
                  ? "border-golden-400 bg-gray-900"
                  : "border-gray-700 bg-gray-800/50"
              }`}
            >
              <IconSun className="mx-auto mb-2 text-yellow-400" size={24} />
              <span className="text-white">Light</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(appearance)
            .filter(([key]) => key !== "theme" && key !== "accentColor")
            .map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div>
                  <h3 className="text-white font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {key === "animationsEnabled" &&
                      "Enable smooth animations and transitions"}
                    {key === "particleBackground" &&
                      "Show animated particle background effects"}
                    {key === "soundEffects" &&
                      "Play sound effects for interactions"}
                  </p>
                </div>
                <ToggleSwitch
                  enabled={value as boolean}
                  onChange={(enabled) =>
                    setAppearance({ ...appearance, [key]: enabled })
                  }
                />
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  );

  const renderAudioSection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-golden-400 mb-6">
        Audio Settings
      </h2>

      <div className="space-y-6">
        <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <h3 className="text-white font-medium mb-4">Volume Controls</h3>
          <div className="space-y-4">
            <VolumeSlider
              value={audio.masterVolume}
              onChange={(value) => setAudio({ ...audio, masterVolume: value })}
              label="Master Volume"
            />
            <VolumeSlider
              value={audio.musicVolume}
              onChange={(value) => setAudio({ ...audio, musicVolume: value })}
              label="Background Music"
            />
            <VolumeSlider
              value={audio.sfxVolume}
              onChange={(value) => setAudio({ ...audio, sfxVolume: value })}
              label="Sound Effects"
            />
            <VolumeSlider
              value={audio.voiceVolume}
              onChange={(value) => setAudio({ ...audio, voiceVolume: value })}
              label="Voice & Narration"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <div>
            <h3 className="text-white font-medium">Mute When Inactive</h3>
            <p className="text-gray-400 text-sm">
              Automatically mute audio when window is not focused
            </p>
          </div>
          <ToggleSwitch
            enabled={audio.muteWhenInactive}
            onChange={(enabled) =>
              setAudio({ ...audio, muteWhenInactive: enabled })
            }
          />
        </div>
      </div>
    </motion.div>
  );

  const renderPrivacySection = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-golden-400 mb-6">
        Privacy & Security
      </h2>

      <div className="space-y-6">
        <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
          <h3 className="text-white font-medium mb-4">Profile Visibility</h3>
          <div className="space-y-2">
            {["public", "friends", "private"].map((visibility) => (
              <label
                key={visibility}
                className="flex items-center gap-3 p-2 hover:bg-gray-700/30 rounded cursor-pointer"
              >
                <input
                  type="radio"
                  name="visibility"
                  value={visibility}
                  checked={privacy.profileVisibility === visibility}
                  onChange={(e) =>
                    setPrivacy({
                      ...privacy,
                      profileVisibility: e.target.value,
                    })
                  }
                  className="text-golden-400 focus:ring-golden-400"
                />
                <span className="text-white capitalize">{visibility}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(privacy)
            .filter(([key]) => key !== "profileVisibility")
            .map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50"
              >
                <div>
                  <h3 className="text-white font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {key === "showOnlineStatus" &&
                      "Let others see when you're online"}
                    {key === "allowFriendRequests" &&
                      "Allow other players to send friend requests"}
                    {key === "showGameHistory" &&
                      "Display your game history on your profile"}
                    {key === "dataCollection" &&
                      "Allow analytics data collection for improvement"}
                  </p>
                </div>
                <ToggleSwitch
                  enabled={value as boolean}
                  onChange={(enabled) =>
                    setPrivacy({ ...privacy, [key]: enabled })
                  }
                />
              </div>
            ))}
        </div>

        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
          <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
          <p className="text-gray-400 text-sm mb-4">
            Irreversible actions that will permanently affect your account
          </p>
          <div className="space-y-3">
            <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
              <IconKey size={18} />
              Change Password
            </button>
            <button className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
              <IconTrash size={18} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSection();
      case "notifications":
        return renderNotificationsSection();
      case "appearance":
        return renderAppearanceSection();
      case "audio":
        return renderAudioSection();
      case "privacy":
        return renderPrivacySection();
      default:
        return renderProfileSection();
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
            <IconSettings className="text-golden-400" size={40} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-golden-400 to-golden-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Customize your gaming experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="neo-card bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-700/50 p-4 sticky top-32">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      activeSection === section.id
                        ? "bg-golden-500 text-black font-semibold"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    {section.icon}
                    <span className="text-sm">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="neo-card bg-gradient-to-br from-gray-900/30 to-black/30 border-gray-700/50 p-8">
              {renderActiveSection()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
