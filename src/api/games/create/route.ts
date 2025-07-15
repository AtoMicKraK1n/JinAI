import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import idl from "@/app/lib/IDL.json";
import { JinaiHere } from "@/app/lib/program";
import prisma from "@/app/lib/prisma";

const PROGRAM_ID = new PublicKey(idl.address);
const TREASURY_PUBKEY = new PublicKey(
  "GkiKqSVfnU2y4TeUW7up2JS9Z8g1yjGYJ8x2QNf4K6Y"
);

const RPC_URL = process.env.HELIUS_RPC_KEY
  ? `https://devnet.helius-rpc.com/?api-key=c434b5e0-f58e-4d87-84c1-b7bba03c939f`
  : "https://api.devnet.solana.com";

export async function POST(req: NextRequest) {
  try {
    const { entryFeeBps, minDeposit, endTime, prizeDistribution } =
      await req.json();

    const connection = new anchor.web3.Connection(RPC_URL, "confirmed");

    const secretKey = bs58.decode(process.env.IN_GAME_WALLET_SECRET!);
    const inGameKeypair = Keypair.fromSecretKey(secretKey);

    const wallet = {
      publicKey: inGameKeypair.publicKey,
      signAllTransactions: async (txs: anchor.web3.Transaction[]) => {
        return txs.map((tx) => {
          tx.sign(inGameKeypair);
          return tx;
        });
      },
      signTransaction: async (tx: anchor.web3.Transaction) => {
        tx.sign(inGameKeypair);
        return tx;
      },
    };

    const provider = new anchor.AnchorProvider(connection, wallet as any, {
      preflightCommitment: "confirmed",
    });

    const program = new anchor.Program(
      idl as anchor.Idl,
      provider
    ) as anchor.Program<JinaiHere>;

    const [globalStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global-state")],
      program.programId
    );

    let poolCount = 0;
    try {
      const globalStateAccount = await program.account.globalState.fetch(
        globalStatePda
      );
      poolCount = globalStateAccount.poolCount.toNumber();
    } catch (fetchErr) {
      console.log("🔄 Global state not found. Calling appointPool...");

      try {
        await program.methods
          .appointPool(entryFeeBps)
          .accountsPartial({
            globalState: globalStatePda,
            authority: inGameKeypair.publicKey,
            treasury: TREASURY_PUBKEY,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        poolCount = 0; // Appointing pool always starts at 0
      } catch (appointErr) {
        console.error("❌ appointPool failed:", appointErr);
        return NextResponse.json(
          { error: "appointPool failed" },
          { status: 500 }
        );
      }
    }

    const [poolPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        Buffer.from(
          Uint8Array.of(...new anchor.BN(poolCount).toArray("le", 8))
        ),
      ],
      program.programId
    );

    try {
      await program.methods
        .appointPool(entryFeeBps)
        .accountsPartial({
          globalState: globalStatePda,
          authority: inGameKeypair.publicKey,
          treasury: TREASURY_PUBKEY,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });
    } catch (err: any) {
      if (
        err.message.includes("already in use") ||
        err.message.includes("custom program error")
      ) {
        console.log(
          "✅ Global state already initialized, skipping appointPool"
        );
      } else {
        throw err;
      }
    }

    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

    try {
      console.log("Calling createPool with:");
      console.log("minDeposit:", minDeposit);
      console.log("endTimestamp:", endTimestamp);
      console.log("prizeDistribution:", prizeDistribution);

      await program.methods
        .createPool(
          new anchor.BN(minDeposit),
          new anchor.BN(endTimestamp),
          prizeDistribution
        )
        .accountsPartial({
          globalState: globalStatePda,
          pool: poolPda,
          creator: inGameKeypair.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc({ commitment: "confirmed" });
    } catch (err) {
      console.error("Create pool failed:", err);
    }

    const createdGame = await prisma.gameSession.create({
      data: {
        poolId: poolPda.toBase58(), // store PDA, not the number
        poolIndex: poolCount,
        status: "WAITING",
        maxPlayers: 4,
        currentPlayers: 0,
        entryFee: minDeposit / 1e9, // assuming lamports, store in SOL
        prizePool: 0,
        endTime: new Date(endTime), // ISO string or timestamp
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pool created and game stored",
      poolAddress: poolPda.toBase58(),
      poolCount,
      gameId: createdGame.id,
    });
  } catch (err: any) {
    console.error("❌ Error in creating pool:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
