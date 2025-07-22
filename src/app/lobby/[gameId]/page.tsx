"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import StartLobby from "@/components/StartLobby";
import socket from "@/lib/socket";
import Navbar from "@/components/Navbar";

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useToast } from "@/components/ui/use-toast";

import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";
import * as anchor from "@coral-xyz/anchor";

export default function LobbyPage() {
  const { gameId } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [joined, setJoined] = useState(false);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { toast } = useToast();

  useEffect(() => {
    if (!gameId || !publicKey || !signTransaction || joined) return;

    setJoined(true);

    const token = localStorage.getItem("jwt");
    if (!token) return;

    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    const joinGame = async () => {
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

        const { blockhash } = await connection.getLatestBlockhash("finalized");
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;

        const signedTx = await signTransaction(tx);
        const txid = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txid, "confirmed");

        console.log("✅ joinPool success:", txid);

        socket.emit("join-game", { gameId, token });
      } catch (err: any) {
        console.error("Join error:", err);
        toast({
          variant: "destructive",
          title: "Error joining game",
          description:
            err.message || "Something went wrong while joining the game.",
        });
      }
    };

    joinGame();

    socket.on("existing-players", (playersList) => {
      console.log("📋 Existing players received:", playersList);
      setPlayers(
        playersList.map((p) => ({
          userId: p.userId,
          username: p.username || `anon_${p.userId.slice(0, 4)}`,
        }))
      );
    });

    socket.on("player-joined", (data) => {
      console.log("📥 player-joined:", data);
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
    });

    socket.on("start-game", () => {
      router.push(`/game/${gameId}`);
    });

    return () => {
      socket.off("player-joined");
      socket.off("existing-players");
      socket.off("start-game");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [gameId, publicKey, signTransaction]);

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
        <StartLobby players={players} />
      </motion.div>
    </>
  );
}
