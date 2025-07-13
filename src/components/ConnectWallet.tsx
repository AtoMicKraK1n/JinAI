"use client";
import { motion } from "framer-motion";
import { WalletButton } from "@/components/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { IconWallet, IconLogout } from "@tabler/icons-react";

export const ConnectWallet = () => {
  const { connected, disconnect, publicKey } = useWallet();

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected successfully");
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      toast.error("Failed to disconnect wallet");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-3">
      {connected && publicKey ? (
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Wallet Address Display */}
          <div className="neo-card px-4 py-2">
            <div className="flex items-center gap-2">
              <IconWallet size={16} className="text-jingold" />
              <span className="text-sm font-mono text-jingold">
                {formatAddress(publicKey.toBase58())}
              </span>
            </div>
          </div>

          {/* Disconnect Button */}
          <motion.button
            className="p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-300"
            onClick={handleDisconnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Disconnect Wallet"
          >
            <IconLogout size={16} />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <WalletButton />
        </motion.div>
      )}
    </div>
  );
};

export default ConnectWallet;
