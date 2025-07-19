import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";
import prisma from "@/lib/prisma";

const PROGRAM_ID = new PublicKey(idl.address);
const TREASURY_PUBKEY = new PublicKey(
  "GkiKqSVfnU2y4TeUW7up2JS9Z8g1yjGYJ8x2QNf4K6Y"
);

const RPC_URL = process.env.HELIUS_RPC_KEY
  ? `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_RPC_KEY}`
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
    ) as unknown as anchor.Program<JinaiHere>;

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
        poolCount = 0;
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
        new anchor.BN(poolCount).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

    // 🛡️ Check if game with this poolId already exists
    const existing = await prisma.gameSession.findUnique({
      where: { poolId: poolPda.toBase58() },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Game already exists for this pool",
        poolAddress: poolPda.toBase58(),
        poolCount,
        gameId: existing.id,
      });
    }

    // Call createPool on-chain
    try {
      console.log("Calling createPool with:", {
        minDeposit,
        endTimestamp,
        prizeDistribution,
      });

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
      return NextResponse.json({ error: "createPool failed" }, { status: 500 });
    }

    // ✅ Create game record in DB
    const createdGame = await prisma.gameSession.create({
      data: {
        poolId: poolPda.toBase58(),
        poolIndex: poolCount,
        status: "WAITING",
        maxPlayers: 4,
        currentPlayers: 0,
        entryFee: minDeposit / 1e9,
        prizePool: 0,
        endTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
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
