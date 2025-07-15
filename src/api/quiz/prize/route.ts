import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import idl from "@/app/lib/IDL.json";
import { JinaiHere } from "@/app/lib/program";

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
    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    // Fetch game and participant
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game)
      return NextResponse.json({ error: "Game not found" }, { status: 404 });

    const participant = await prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!participant)
      return NextResponse.json({ error: "User not in game" }, { status: 403 });

    if (participant.hasClaimed) {
      return NextResponse.json({ message: "Already claimed" }, { status: 200 });
    }

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
    ) as anchor.Program<JinaiHere>;

    const poolIndex = game.poolIndex;
    const userWallet = new PublicKey(participant.user.walletAddress);

    const [poolPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [playerPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("player"),
        new anchor.BN(poolIndex).toArrayLike(Buffer, "le", 8),
        userWallet.toBuffer(),
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

    // Call u_prizes instruction
    await program.methods
      .uPrizes()
      .accountsPartial({
        pool: poolPda,
        player: playerPda,
        playerAuthority: userWallet,
        poolVault: poolVaultPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([inGameKeypair])
      .rpc({ commitment: "confirmed" });

    // ✅ Update DB
    await prisma.gameParticipant.update({
      where: {
        gameId_userId: {
          gameId,
          userId,
        },
      },
      data: {
        hasClaimed: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Prize claimed successfully",
    });
  } catch (error) {
    console.error("Claim prize error:", error);
    return NextResponse.json(
      { error: "Failed to claim prize" },
      { status: 500 }
    );
  }
}
