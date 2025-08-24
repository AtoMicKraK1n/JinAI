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
import NeoCard from "@/components/NeoCard"; // ⬅️ Import NeoCard

export default function LobbyPage() {
  const { gameId } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [joined, setJoined] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);

  const joinAttempted = useRef(false);

  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();

  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("jwt") : null;

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
        console.warn("Transaction already processed, assuming success.");
        socket.emit("join-game", { gameId, token });
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

  useEffect(() => {
    if (
      showConfirmation ||
      !publicKey ||
      !token ||
      !gameId ||
      joinAttempted.current
    ) {
      return;
    }

    console.log("🚀 Attempting to join game...");
    joinAttempted.current = true;

    if (socket.connected) {
      joinGame();
    } else {
      socket.connect();
      socket.once("connect", () => joinGame());
    }
  }, [showConfirmation, publicKey, token, gameId]);

  useEffect(() => {
    const handleExistingPlayers = (playersList: any[]) => {
      setPlayers(
        playersList.map((p) => ({
          userId: p.userId,
          username: p.username || `anon_${p.userId.slice(0, 4)}`,
        }))
      );
      setJoined(true);
    };

    const handlePlayerJoined = (data: any) => {
      if (!data?.userId) return;
      setPlayers((prev) => {
        if (prev.some((p) => p.userId === data.userId)) return prev;
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
      router.push(`/game/${gameId}`);
    };

    const handleDisconnect = () => {
      toast({
        variant: "destructive",
        title: "Disconnected",
        description: "You have been disconnected from the server.",
      });
    };

    socket.on("existing-players", handleExistingPlayers);
    socket.on("player-joined", handlePlayerJoined);
    socket.on("start-game", handleStartGame);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("existing-players", handleExistingPlayers);
      socket.off("player-joined", handlePlayerJoined);
      socket.off("start-game", handleStartGame);
      socket.off("disconnect", handleDisconnect);
    };
  }, [gameId, router, toast]);

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
            <NeoCard className="w-full max-w-md text-center p-10">
              <h2 className="text-2xl font-bold text-yellow-400 mb-6">
                💸 You will be charged 1 SOL + network fee to join this pool
              </h2>
              <button
                onClick={handleJoinConfirm}
                className="neo-button bg-yellow-400 text-black font-semibold px-8 py-3 rounded-lg hover:bg-yellow-300 transition"
              >
                Confirm & Join Game
              </button>
            </NeoCard>
          </div>
        ) : (
          <StartLobby players={players} />
        )}
      </motion.div>
    </>
  );
}
