import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
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

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
      include: { participants: true },
    });

    if (!game)
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (game.status !== "WAITING")
      return NextResponse.json(
        { error: "Game is not accepting new players" },
        { status: 400 }
      );
    if (game.currentPlayers >= game.maxPlayers)
      return NextResponse.json({ error: "Game is full" }, { status: 400 });

    const existingParticipant = game.participants.find(
      (p) => p.userId === userId
    );
    if (existingParticipant) {
      return NextResponse.json(
        { error: "You are already in this game" },
        { status: 400 }
      );
    }

    // ✅ On-chain interaction starts here

    const RPC_URL = process.env.HELIUS_RPC_KEY
      ? `https://devnet.helius-rpc.com/?api-key=c434b5e0-f58e-4d87-84c1-b7bba03c939f`
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

    const poolIndex = game.poolIndex; // stored from previous createPool
    const LAMPORTS_PER_SOL = 1_000_000_000;

    const depositAmount = new anchor.BN(game.entryFee * LAMPORTS_PER_SOL); // entryFee is 1.0

    const [poolPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [poolVaultPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool-vault"),
        new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    // TODO: Replace this with actual mapping of userId -> Solana wallet (if implemented)
    const playerPubkey = inGameKeypair.publicKey;

    const [playerPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("player"),
        new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8),
        playerPubkey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .joinPool(depositAmount)
      .accountsPartial({
        pool: poolPda,
        player: playerPda,
        playerAuthority: playerPubkey,
        poolVault: poolVaultPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([inGameKeypair])
      .rpc({ commitment: "confirmed" });

    // ✅ Back to DB update

    await prisma.gameParticipant.create({ data: { gameId, userId } });

    const newPlayerCount = game.currentPlayers + 1;
    const updatedGame = await prisma.gameSession.update({
      where: { id: gameId },
      data: {
        currentPlayers: newPlayerCount,
        prizePool: game.prizePool + game.entryFee,
        status: newPlayerCount === game.maxPlayers ? "STARTING" : "WAITING",
      },
    });

    if (newPlayerCount === game.maxPlayers) {
      await prepareGameQuestions(gameId);
    }

    return NextResponse.json({
      success: true,
      message:
        newPlayerCount === game.maxPlayers
          ? "Game is starting! Get ready..."
          : "Successfully joined the game",
      game: {
        id: updatedGame.id,
        poolId: updatedGame.poolId,
        status: updatedGame.status,
        currentPlayers: updatedGame.currentPlayers,
        maxPlayers: updatedGame.maxPlayers,
        prizePool: updatedGame.prizePool,
      },
    });
  } catch (error) {
    console.error("Game join error:", error);
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }
}

async function prepareGameQuestions(gameId: string) {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    const gameQuestions = questions.map((q, i) => ({
      gameId,
      questionId: q.id,
      orderIndex: i + 1,
      timeLimit: 30,
    }));

    await prisma.gameQuestion.createMany({ data: gameQuestions });

    setTimeout(async () => {
      await prisma.gameSession.update({
        where: { id: gameId },
        data: {
          status: "IN_PROGRESS",
          startTime: new Date(),
        },
      });
    }, 5000);
  } catch (error) {
    console.error("Error preparing game questions:", error);
  }
}
