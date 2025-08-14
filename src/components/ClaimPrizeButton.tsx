"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { BN, AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

interface ClaimPrizeButtonProps {
  gameId: string;
  poolIndex: number;
  prizePool?: number;
}

export default function ClaimPrizeButton({
  gameId,
  poolIndex,
  prizePool,
}: ClaimPrizeButtonProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleClaim = async () => {
    if (!publicKey || !signTransaction) {
      setStatus("❗ Connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Initializing claim process...");
      setTxSig(null);
      setDebugInfo(null);

      console.log("🚀 Starting claim process:", {
        gameId,
        poolIndex,
        userWallet: publicKey.toBase58(),
        prizePool,
      });

      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: async (txs: any[]) =>
          Promise.all(txs.map((tx) => signTransaction(tx))),
      };

      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
      });

      const program = new Program(idl as any, provider) as Program<JinaiHere>;

      // ✅ Generate PDAs with detailed logging
      const poolIdBuf = new BN(poolIndex).toArrayLike(Buffer, "le", 8);

      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), poolIdBuf],
        program.programId
      );

      const [playerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("player"), poolIdBuf, publicKey.toBuffer()],
        program.programId
      );

      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool-vault"), poolIdBuf],
        program.programId
      );

      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        program.programId
      );

      const pdaInfo = {
        poolPda: poolPda.toBase58(),
        playerPda: playerPda.toBase58(),
        vaultPda: vaultPda.toBase58(),
        globalStatePda: globalStatePda.toBase58(),
        poolIndex,
        programId: program.programId.toBase58(),
      };

      console.log("🔍 Generated PDAs:", pdaInfo);
      setDebugInfo(pdaInfo);

      setStatus("🔍 Checking your player account...");

      // ✅ Check if player account exists with detailed error handling
      let playerAccount;
      try {
        playerAccount = await program.account.player.fetchNullable(playerPda);
        console.log("📊 Player account data:", playerAccount);
      } catch (fetchError) {
        console.error("❌ Error fetching player account:", fetchError);
        setStatus(`❌ Error accessing player account: ${fetchError}`);
        setLoading(false);
        return;
      }

      if (!playerAccount) {
        console.warn("⚠️ Player account not found for:", playerPda.toBase58());

        if (process.env.NODE_ENV === "development") {
          setStatus(
            "⚠️ Dev Mode: Player account not found, attempting off-chain claim..."
          );

          const jwt = sessionStorage.getItem("jwt");
          const res = await fetch("/api/quiz/prize", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({ gameId }),
          });

          if (res.ok) {
            setStatus("✅ Dev-only: Prize marked as claimed (off-chain).");
          } else {
            const errorData = await res.text();
            setStatus(`⚠️ Dev-only claim failed: ${errorData}`);
          }

          setLoading(false);
          return;
        } else {
          setStatus(
            "❌ You haven't joined this game with this wallet, or the game hasn't been finalized yet."
          );
          setLoading(false);
          return;
        }
      }

      // ✅ Check if already claimed
      if (playerAccount.hasClaimed) {
        setStatus("ℹ️ You have already claimed your prize for this game!");
        setLoading(false);
        return;
      }

      // ✅ Verify pool account exists
      setStatus("🔍 Verifying pool account...");
      let poolAccount;
      try {
        poolAccount = await program.account.pool.fetch(poolPda);
        console.log("🏊 Pool account verified:", {
          isActive: poolAccount.isActive,
          hasDistributed: poolAccount.hasDistributed,
          totalPrize: poolAccount.totalPrize?.toString(),
        });
      } catch (poolError) {
        console.error("❌ Pool account error:", poolError);
        setStatus(`❌ Pool not found or invalid: ${poolError}`);
        setLoading(false);
        return;
      }

      // ✅ Check if rewards have been distributed
      if (!poolAccount.hasDistributed) {
        setStatus(
          "⏳ Rewards haven't been distributed yet. Please wait for the host to finalize results."
        );
        setLoading(false);
        return;
      }

      // ✅ Get vault balance for debugging
      try {
        const vaultBalance = await connection.getBalance(vaultPda);
        console.log(
          "💰 Vault balance:",
          vaultBalance / web3.LAMPORTS_PER_SOL,
          "SOL"
        );

        if (vaultBalance === 0) {
          setStatus(
            "❌ Prize vault is empty. Rewards may have already been claimed."
          );
          setLoading(false);
          return;
        }
      } catch (balanceError) {
        console.warn("⚠️ Could not check vault balance:", balanceError);
      }

      setStatus("💰 Claiming your prize on-chain...");

      // ✅ Build and send transaction with better error handling
      try {
        const signature = await program.methods
          .uPrizes()
          .accountsPartial({
            pool: poolPda,
            player: playerPda,
            playerAuthority: publicKey,
            poolVault: vaultPda,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc({
            commitment: "confirmed",
            skipPreflight: false,
          });

        console.log("✅ Transaction successful:", signature);
        setTxSig(signature);
        setStatus("✅ On-chain prize claimed successfully!");

        // ✅ Update database
        setStatus("📝 Updating database...");
        const jwt = sessionStorage.getItem("jwt");
        const res = await fetch("/api/quiz/prize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            gameId,
            transactionSignature: signature,
          }),
        });

        if (res.ok) {
          setStatus("🎉 Prize successfully claimed and recorded!");
        } else {
          const errorText = await res.text();
          console.warn("Database update failed:", errorText);
          setStatus(
            "✅ Claimed on-chain, but database update failed. Your prize is secure!"
          );
        }
      } catch (txError: any) {
        console.error("❌ Transaction failed:", txError);

        // ✅ Parse common Anchor errors
        let errorMessage = "Transaction failed";
        if (txError.message) {
          if (txError.message.includes("already claimed")) {
            errorMessage = "Prize already claimed";
          } else if (txError.message.includes("insufficient funds")) {
            errorMessage = "Insufficient SOL for transaction fees";
          } else if (txError.message.includes("account not found")) {
            errorMessage = "Game account not found on-chain";
          } else if (txError.message.includes("custom program error")) {
            errorMessage =
              "Smart contract error - check if rewards were distributed";
          } else {
            errorMessage = txError.message;
          }
        }

        setStatus(`❌ ${errorMessage}`);
      }
    } catch (e: any) {
      console.error("❌ Claim error:", e);
      setStatus(`❌ Unexpected error: ${e.message || "Please try again"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClaim}
        disabled={loading}
        className="neo-button bg-golden-400 text-black px-6 py-3 rounded-lg hover:bg-golden-500 transition-all duration-200 flex items-center justify-center min-w-[200px] font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Claiming...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            🎁 Claim Prize
            {prizePool && <span className="text-xs">({prizePool} SOL)</span>}
          </div>
        )}
      </button>

      {status && (
        <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 max-w-md">
          <p className="text-sm text-gray-300 text-center whitespace-pre-wrap">
            {status}
          </p>
        </div>
      )}

      {txSig && (
        <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-600/30">
          <div className="text-sm text-green-400 text-center">
            ✅ Transaction confirmed!{" "}
            <a
              href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-green-300 transition-colors"
            >
              View on Explorer
            </a>
          </div>
        </div>
      )}

      {debugInfo && process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-xs text-zinc-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-zinc-900 rounded text-xs overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
