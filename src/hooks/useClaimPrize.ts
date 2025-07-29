"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useState } from "react";
import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";

export const useClaimPrize = (poolIndex: number) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimPrize = async () => {
    if (!publicKey || !signTransaction) {
      setError("Wallet not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const PROGRAM_ID = new PublicKey(idl.address);
      const provider = new anchor.AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction,
          signAllTransactions,
        } as any,
        { commitment: "confirmed" }
      );

      const program = new anchor.Program(
        idl as anchor.Idl,
        provider
      ) as unknown as anchor.Program<JinaiHere>;

      const poolBuffer = new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8);

      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), poolBuffer],
        PROGRAM_ID
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool-vault"), poolBuffer],
        PROGRAM_ID
      );

      const [playerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), poolBuffer, publicKey.toBuffer()],
        PROGRAM_ID
      );

      const txSig = await program.methods
        .uPrizes()
        .accountsPartial({
          pool: poolPda,
          player: playerPda,
          playerAuthority: publicKey,
          poolVault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setClaimed(true);
      console.log("✅ Prize claimed:", txSig);
    } catch (err: any) {
      console.error("❌ Claim failed", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { claimPrize, loading, claimed, error };
};
