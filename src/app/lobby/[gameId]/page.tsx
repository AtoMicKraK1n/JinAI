"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import StartLobby from "@/components/StartLobby";
import socket from "@/lib/socket";
import Navbar from "@/components/Navbar";

import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useToast } from "@/components/ui/use-toast";

import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";
import * as anchor from "@coral-xyz/anchor";

export default function LobbyPage() {
  const { gameId } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  // 'joined' is now only set after server confirmation via the 'existing-players' event
  const [joined, setJoined] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);

  // Use a ref to ensure the join action is only attempted once
  const joinAttempted = useRef(false);

  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();

  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("jwt") : null;

  // Refactored joinGame function:
  // - It no longer sets component state directly.
  // - Its only job is to perform the transaction and emit the 'join-game' event.
  const joinGame = async () => {
    console.log("🔥 joinGame called");
    try {
      const res = await fetch("/api/games/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast({
          variant: "destructive",
          title: "Join failed",
          description: data.error,
        });
        return;
      }

      const provider = new anchor.AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction,
          signAllTransactions: async (txs) =>
            Promise.all(txs.map(signTransaction)),
        },
        { preflightCommitment: "confirmed" }
      );

      const program = new anchor.Program(
        idl as anchor.Idl,
        provider
      ) as unknown as anchor.Program<JinaiHere>;

      const poolIndex = new anchor.BN(data.game.poolIndex);
      const LAMPORTS_PER_SOL = 1_000_000_000;
      const depositAmount = new anchor.BN(
        data.game.entryFee * LAMPORTS_PER_SOL
      );

      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), poolIndex.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool-vault"), poolIndex.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const [playerPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("player"),
          poolIndex.toArrayLike(Buffer, "le", 8),
          publicKey.toBuffer(),
        ],
        program.programId
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("finalized");

      const tx = await program.methods
        .joinPool(depositAmount)
        .accountsPartial({
          pool: poolPda,
          player: playerPda,
          playerAuthority: publicKey,
          poolVault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signedTx = await signTransaction(tx);
      const txid = await connection.sendRawTransaction(signedTx.serialize());

      const confirmation = await connection.confirmTransaction(
        {
          signature: txid,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error(
          "Transaction failed: " + JSON.stringify(confirmation.value.err)
        );
      }

      console.log("✅ Solana transaction successful:", txid);
      console.log("📤 Emitting join-game event...");

      // Emit the event and log the server's acknowledgement
      socket.emit("join-game", { gameId, token }, (response: any) => {
        if (response?.status === "ok") {
          console.log("✅ Server acknowledged join-game:", response);
        } else {
          console.error("❌ Server had an issue with join-game", response);
        }
      });
    } catch (err: any) {
      const errMsg = err?.message || "";
      if (errMsg.includes("This transaction has already been processed")) {
        console.warn(
          "Transaction already processed, assuming success and emitting join-game."
        );
        socket.emit("join-game", { gameId, token }, (response: any) => {
          console.log("✅ Server acknowledged join-game (retry):", response);
        });
        return;
      }

      console.error("❌ Fatal Join Error:", err);
      toast({
        variant: "destructive",
        title: "Error joining game",
        description: errMsg || "Something went wrong while joining the game.",
      });
    }
  };

  const handleJoinConfirm = () => {
    console.log("🟢 Confirmation button clicked");
    setShowConfirmation(false);
  };

  // HOOK 1: Handles the ONE-TIME action of joining the game.
  useEffect(() => {
    // These conditions must be met to attempt joining.
    if (
      showConfirmation ||
      !publicKey ||
      !token ||
      !gameId ||
      joinAttempted.current
    ) {
      return;
    }

    // Mark that we are attempting to join to prevent this hook from running again.
    console.log("🚀 Conditions met, attempting to join game...");
    joinAttempted.current = true;

    // Ensure the socket is connected before we call joinGame.
    if (socket.connected) {
      joinGame();
    } else {
      console.log("⏳ Socket not connected, connecting first...");
      socket.connect();
      socket.once("connect", () => {
        console.log("✅ Socket connected, now calling joinGame().");
        joinGame();
      });
    }
  }, [showConfirmation, publicKey, token, gameId]); // Dependencies that trigger the join action.

  // HOOK 2: Handles all PERSISTENT socket event listeners.
  useEffect(() => {
    const handleExistingPlayers = (playersList: any[]) => {
      console.log("📋 'existing-players' event received:", playersList);
      setPlayers(
        playersList.map((p) => ({
          userId: p.userId,
          username: p.username || `anon_${p.userId.slice(0, 4)}`,
        }))
      );
      // This is the true confirmation that we have joined.
      setJoined(true);
    };

    const handlePlayerJoined = (data: any) => {
      console.log("📥 'player-joined' event received:", data);
      if (!data?.userId) return;
      setPlayers((prev) => {
        if (prev.some((p) => p.userId === data.userId)) return prev; // Avoid duplicates
        return [
          ...prev,
          {
            userId: data.userId,
            username: data.username || `anon_${data.userId.slice(0, 4)}`,
          },
        ];
      });
    };

    const handleStartGame = () => {
      console.log("🚀 'start-game' event received, redirecting...");
      router.push(`/game/${gameId}`);
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
      toast({
        variant: "destructive",
        title: "Disconnected",
        description: "You have been disconnected from the server.",
      });
    };

    // Attach all event listeners
    socket.on("existing-players", handleExistingPlayers);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("start-game", handleStartGame);
    socket.on("disconnect", handleDisconnect);

    // This cleanup function will only run when the component unmounts
    return () => {
      console.log("🧹 Cleaning up lobby listeners...");
      socket.off("existing-players", handleExistingPlayers);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("start-game", handleStartGame);
      socket.off("disconnect", handleDisconnect);
    };
  }, [gameId, router, toast]); // Minimal dependencies for listeners.

  return (
    <>
      <Navbar />
      <ParticleBackground />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 min-h-screen px-6 pt-32"
      >
        {showConfirmation ? (
          <div className="flex justify-center items-center h-[70vh]">
            <div className="bg-black/60 backdrop-blur-md border border-yellow-500 rounded-xl p-10 w-full max-w-md text-center shadow-lg">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                💸 You will be charged 1.000 SOL and network fee to join this
                pool (ofc devnet)
              </h2>
              <button
                onClick={handleJoinConfirm}
                className="neo-button bg-yellow-400 text-black font-semibold px-8 py-3 rounded-lg hover:bg-yellow-300 transition"
              >
                Confirm & Join Game
              </button>
            </div>
          </div>
        ) : (
          <StartLobby players={players} />
        )}
      </motion.div>
    </>
  );
}
