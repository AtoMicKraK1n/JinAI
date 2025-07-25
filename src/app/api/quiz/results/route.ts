import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";

const prisma = new PrismaClient();
const PROGRAM_ID = new PublicKey(idl.address);

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
            user: {
              select: { id: true, username: true, walletAddress: true },
            },
          },
        },
      },
    });

    if (!game)
      return NextResponse.json({ error: "Game not found" }, { status: 404 });

    const isHost = game.participants[0]?.userId === userId;
    if (!isHost) {
      return NextResponse.json(
        { error: "Only host can finalize results" },
        { status: 403 }
      );
    }

    if (game.status === "COMPLETED") {
      const results = await prisma.gameParticipant.findMany({
        where: { gameId },
        include: { user: { select: { username: true } } },
        orderBy: { finalRank: "asc" },
      });
      return NextResponse.json({
        success: true,
        message: "Already completed",
        results,
      });
    }

    const results = await Promise.all(
      game.participants.map(async (participant) => {
        const answers = await prisma.playerAnswer.findMany({
          where: { gameId, userId: participant.userId },
        });

        const totalScore = answers.reduce((sum, a) => sum + a.points, 0);
        const correctAnswers = answers.filter((a) => a.isCorrect).length;

        return {
          userId: participant.userId,
          username: participant.user.username,
          walletAddress: participant.user.walletAddress,
          totalScore,
          correctAnswers,
          totalAnswers: answers.length,
        };
      })
    );

    results.sort((a, b) => b.totalScore - a.totalScore);

    const prizeDistribution = { 1: 0.4, 2: 0.3, 3: 0.1, 4: 0.1 };
    const playerRanks: number[] = [];

    for (let i = 0; i < results.length; i++) {
      const rank = i + 1;
      const percentage =
        prizeDistribution[rank as keyof typeof prizeDistribution] || 0;
      const prizeAmount = game.prizePool * percentage;

      await prisma.gameParticipant.updateMany({
        where: { gameId, userId: results[i].userId },
        data: { finalRank: rank, prizeWon: prizeAmount },
      });

      playerRanks.push(rank);
    }

    await prisma.gameSession.update({
      where: { id: gameId },
      data: { status: "COMPLETED" },
    });

    // 🧠 On-chain logic
    const poolIndex = game.poolIndex;
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

    const [poolPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool-vault"),
        new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [globalStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global-state")],
      program.programId
    );

    const playerPDAs = await Promise.all(
      results.map((r) =>
        PublicKey.findProgramAddressSync(
          [
            Buffer.from("player"),
            new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8),
            new PublicKey(r.walletAddress).toBuffer(),
          ],
          program.programId
        )
      )
    );

    // ✅ set_results
    await program.methods
      .setResults(playerRanks as [number, number, number, number])
      .accountsPartial({
        pool: poolPda,
        globalState: globalStatePda,
        authority: inGameKeypair.publicKey,
        player1: playerPDAs[0][0],
        player2: playerPDAs[1][0],
        player3: playerPDAs[2][0],
        player4: playerPDAs[3][0],
      })
      .signers([inGameKeypair])
      .rpc({ commitment: "confirmed" });

    // ✅ t_rewards
    await program.methods
      .tRewards()
      .accountsPartial({
        pool: poolPda,
        poolVault: vaultPda,
        globalState: globalStatePda,
        authority: inGameKeypair.publicKey,
        treasury: new PublicKey(process.env.TREASURY!),
        systemProgram: SystemProgram.programId,
        player1: playerPDAs[0][0],
        player2: playerPDAs[1][0],
        player3: playerPDAs[2][0],
        player4: playerPDAs[3][0],
      })
      .signers([inGameKeypair])
      .rpc({ commitment: "confirmed" });

    const finalResults = await prisma.gameParticipant.findMany({
      where: { gameId },
      include: { user: { select: { username: true } } },
      orderBy: { finalRank: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "Game completed. Results finalized and rewards distributed.",
      results: finalResults,
    });
  } catch (error) {
    console.error("Results error:", error);
    return NextResponse.json(
      { error: "Failed to finalize results" },
      { status: 500 }
    );
  }
}
