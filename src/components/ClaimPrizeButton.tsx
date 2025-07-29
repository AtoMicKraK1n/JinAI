"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { BN, AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";
import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

export default function ClaimPrizeButton({
  gameId,
  poolIndex,
}: {
  gameId: string;
  poolIndex: number;
}) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    if (!publicKey || !signTransaction) {
      setStatus("❗ Connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("⏳ Claiming prize on-chain...");
      setTxSig(null);

      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: async (txs) =>
          txs.map((tx) => signTransaction(tx)),
      };

      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
      });

      const program = new Program(idl as any, provider) as Program<JinaiHere>;

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

      const playerAccount = await program.account.player.fetchNullable(
        playerPda
      );

      if (!playerAccount) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "⚠️ Skipping on-chain claim in dev mode due to missing player account."
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
            setStatus("⚠️ Dev-only claim marked, but DB update failed.");
          }

          setLoading(false);
          return;
        } else {
          setStatus("❌ You haven't joined this game with this wallet.");
          setLoading(false);
          return;
        }
      }

      // ✅ On-chain claim
      const signature = await program.methods
        .uPrizes()
        .accountsPartial({
          pool: poolPda,
          player: playerPda,
          playerAuthority: publicKey,
          poolVault: vaultPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });

      setTxSig(signature);
      setStatus("✅ On-chain prize claimed!");

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
        setStatus("🎉 Prize successfully claimed and recorded!");
      } else {
        setStatus("⚠️ Claimed on-chain, but database update failed.");
      }
    } catch (e) {
      console.error("Claim error:", e);
      setStatus("❌ Error while claiming prize. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClaim}
        disabled={loading}
        className="neo-button bg-golden-400 text-black px-4 py-2 rounded hover:bg-golden-500 transition flex items-center justify-center min-w-[180px]"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="loader border-t-2 border-black rounded-full w-4 h-4 animate-spin" />
            Claiming...
          </div>
        ) : (
          "🎁 Claim Prize"
        )}
      </button>

      {status && (
        <p className="text-sm mt-3 text-gray-300 text-center whitespace-pre-wrap">
          {status}
        </p>
      )}

      {txSig && (
        <div className="mt-4 text-sm text-green-400 text-center">
          ✅ Transaction confirmed!{" "}
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-300 ml-1"
          >
            View on Solana Explorer
          </a>
        </div>
      )}
    </div>
  );
}
