import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";

const prisma = new PrismaClient();

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  return decoded.userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true, walletAddress: true } },
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const isHost = game.participants[0]?.userId === userId;

    // ✅ Return game data for completed games
    if (game.status === "COMPLETED") {
      const finalResults = await prisma.gameParticipant.findMany({
        where: { gameId },
        include: { user: { select: { username: true } } },
        orderBy: { finalRank: "asc" },
      });

      return NextResponse.json({
        success: true,
        message: "Already completed",
        results: finalResults.map((r) => ({
          finalRank: r.finalRank,
          finalScore: r.finalScore,
          username: r.user?.username || "Unknown",
        })),
        // ✅ Include game data for claim functionality
        gameData: {
          poolIndex: game.poolIndex,
          prizePool: game.prizePool,
          status: game.status,
          gameId: game.id,
        },
      });
    }

    if (!isHost) {
      return NextResponse.json(
        { error: "Results not yet finalized by host." },
        { status: 403 }
      );
    }

    const results = game.participants.map((participant) => ({
      userId: participant.userId,
      username: participant.user.username,
      walletAddress: participant.user.walletAddress,
      totalScore: participant.finalScore,
    }));

    results.sort((a, b) => b.totalScore - a.totalScore);

    const poolIndex = game.poolIndex;
    const prizeDistribution = { 1: 0.4, 2: 0.3, 3: 0.1, 4: 0.1 };
    const playerRanks: number[] = [];

    for (let i = 0; i < results.length; i++) {
      const rank = i + 1;
      const percentage =
        prizeDistribution[rank as keyof typeof prizeDistribution] || 0;
      const prizeAmount = game.prizePool * percentage;

      await prisma.gameParticipant.updateMany({
        where: { gameId, userId: results[i].userId },
        data: {
          finalRank: rank,
          prizeWon: prizeAmount,
          finalScore: results[i].totalScore,
        },
      });

      playerRanks.push(rank);
    }

    await prisma.gameSession.update({
      where: { id: gameId },
      data: { status: "COMPLETED" },
    });

    // On-chain interaction
    const RPC_URL = process.env.HELIUS_RPC_KEY
      ? `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_RPC_KEY}`
      : "https://api.devnet.solana.com";

    const connection = new anchor.web3.Connection(RPC_URL, "confirmed");
    const secretKey = bs58.decode(process.env.IN_GAME_WALLET_SECRET!);
    const inGameKeypair = Keypair.fromSecretKey(secretKey);

    const wallet = {
      publicKey: inGameKeypair.publicKey,
      signTransaction: async (tx: anchor.web3.Transaction) => {
        tx.sign(inGameKeypair);
        return tx;
      },
      signAllTransactions: async (txs: anchor.web3.Transaction[]) => {
        return txs.map((tx) => {
          tx.sign(inGameKeypair);
          return tx;
        });
      },
    };

    const provider = new anchor.AnchorProvider(connection, wallet as any, {
      preflightCommitment: "confirmed",
    });

    const program = new anchor.Program(
      idl as anchor.Idl,
      provider
    ) as unknown as anchor.Program<JinaiHere>;

    const poolIdBuffer = new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8);
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), poolIdBuffer],
      program.programId
    );
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool-vault"), poolIdBuffer],
      program.programId
    );
    const [globalStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global-state")],
      program.programId
    );

    console.log("🔍 On-chain PDAs:", {
      poolPda: poolPda.toBase58(),
      vaultPda: vaultPda.toBase58(),
      globalStatePda: globalStatePda.toBase58(),
      poolIndex,
    });

    try {
      const rawPoolAccount = await program.account.pool.fetch(poolPda);
      console.log("✅ Pool account fetched successfully");

      const playerPDAsOnChain = rawPoolAccount.playerAccounts.map(
        (p: PublicKey) => p.toBase58()
      );

      const playerPDAsLocal = results.map((r) =>
        PublicKey.findProgramAddressSync(
          [
            Buffer.from("player"),
            poolIdBuffer,
            new PublicKey(r.walletAddress).toBuffer(),
          ],
          program.programId
        )[0].toBase58()
      );

      const reorderedResults = playerPDAsOnChain.map((onChainPda) => {
        const idx = playerPDAsLocal.findIndex(
          (localPda) => localPda === onChainPda
        );
        return results[idx];
      });

      const finalPlayerPDAs = reorderedResults.map(
        (r) =>
          PublicKey.findProgramAddressSync(
            [
              Buffer.from("player"),
              poolIdBuffer,
              new PublicKey(r.walletAddress).toBuffer(),
            ],
            program.programId
          )[0]
      );

      console.log("🎯 Setting results on-chain...");
      // On-chain: set_results
      const txSig = await program.methods
        .setResults(playerRanks as [number, number, number, number])
        .accountsPartial({
          pool: poolPda,
          globalState: globalStatePda,
          authority: inGameKeypair.publicKey,
          player1: finalPlayerPDAs[0],
          player2: finalPlayerPDAs[1],
          player3: finalPlayerPDAs[2],
          player4: finalPlayerPDAs[3],
        })
        .signers([inGameKeypair])
        .rpc({ commitment: "confirmed" });

      console.log("✅ Set results transaction:", txSig);

      console.log("💰 Distributing rewards on-chain...");
      // On-chain: t_rewards
      const rewardTxSig = await program.methods
        .tRewards()
        .accountsPartial({
          pool: poolPda,
          globalState: globalStatePda,
          authority: inGameKeypair.publicKey,
          poolVault: vaultPda,
          treasury: new PublicKey(
            "GkiKqSVfnU2y4TeUW7up2JS9Z8g1yjGYJ8x2QNf4K6Y"
          ),
          player1: finalPlayerPDAs[0],
          player2: finalPlayerPDAs[1],
          player3: finalPlayerPDAs[2],
          player4: finalPlayerPDAs[3],
          systemProgram: SystemProgram.programId,
        })
        .signers([inGameKeypair])
        .rpc({ commitment: "confirmed" });

      console.log("✅ Reward distribution transaction:", rewardTxSig);
    } catch (onChainError) {
      console.error("❌ On-chain operation failed:", onChainError);
      // Don't fail the entire operation if on-chain fails
    }

    const finalResults = await prisma.gameParticipant.findMany({
      where: { gameId },
      include: { user: { select: { username: true } } },
      orderBy: { finalRank: "asc" },
    });

    return NextResponse.json({
      success: true,
      message:
        "Game completed. Results finalized, rewards distributed, and prizes claimed.",
      results: finalResults.map((r) => ({
        finalRank: r.finalRank,
        finalScore: r.finalScore,
        username: r.user.username,
      })),
      // ✅ Include game data for claim functionality
      gameData: {
        poolIndex: game.poolIndex,
        prizePool: game.prizePool,
        status: "COMPLETED",
        gameId: game.id,
      },
    });
  } catch (error) {
    console.error("❌ Results error:", error);
    return NextResponse.json(
      {
        error: "Failed to finalize results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
