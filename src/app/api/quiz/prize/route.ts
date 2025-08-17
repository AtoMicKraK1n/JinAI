import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import * as anchor from "@coral-xyz/anchor";
import idl from "@/lib/IDL.json";
import { JinaiHere } from "@/lib/program";
import BN from "bn.js";

const prisma = new PrismaClient();

// ---------- Helper to verify signature ----------
function verifyWalletSignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(publicKey).toBytes();
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
  } catch (error) {
    console.error("❌ Signature verification error:", error);
    return false;
  }
}

// ---------- PDA Helpers ----------
const PROGRAM_ID = new PublicKey(
  "83DvmTiVdv9GpLydRbc4emFKaFXacmBxEZkVWZVYV12b"
);

function getPoolPDA(poolIndex: number) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("pool"),
      new BN(poolIndex).toArrayLike(Buffer, "le", 8), // u64 little-endian
    ],
    PROGRAM_ID
  )[0];
}

function getPlayerPDA(poolIndex: number, playerAuthority: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("player"),
      new BN(poolIndex).toArrayLike(Buffer, "le", 8), // ✅ Fixed: Little-endian u64
      playerAuthority.toBuffer(),
    ],
    PROGRAM_ID
  )[0];
}

function getPoolVaultPDA(poolIndex: number) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("pool-vault"),
      new BN(poolIndex).toArrayLike(Buffer, "le", 8), // ✅ Fixed: Little-endian u64
    ],
    PROGRAM_ID
  )[0];
}

// ---------- API POST ----------
export async function POST(request: NextRequest) {
  try {
    const { gameId, walletAddress, signature, message } = await request.json();

    if (!gameId || !walletAddress || !signature || !message) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["gameId", "walletAddress", "signature", "message"],
        },
        { status: 400 }
      );
    }

    // 1. Verify signature
    if (!verifyWalletSignature(message, signature, walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet signature" },
        { status: 401 }
      );
    }

    // 2. Check message age
    const messageAge = Date.now() - parseInt(message.split("at ")[1] || "0");
    if (messageAge > 5 * 60 * 1000) {
      return NextResponse.json({ error: "Signature expired" }, { status: 401 });
    }

    // 3. Validate participant
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        gameId,
        user: { walletAddress },
      },
      include: { user: { select: { username: true, walletAddress: true } } },
    });

    if (!participant)
      return NextResponse.json(
        { error: "No participation found" },
        { status: 403 }
      );
    if (participant.hasClaimed)
      return NextResponse.json(
        { error: "Prize already claimed" },
        { status: 400 }
      );
    if (
      !participant.finalRank ||
      participant.finalRank > 4 ||
      !participant.prizeWon
    ) {
      return NextResponse.json(
        { error: "No prize available" },
        { status: 400 }
      );
    }

    // 4. Validate game status
    const game = await prisma.gameSession.findUnique({ where: { id: gameId } });
    if (!game)
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    if (game.status !== "COMPLETED")
      return NextResponse.json(
        { error: "Game not completed" },
        { status: 400 }
      );

    // 5. Prepare in-game wallet
    const secretKey = bs58.decode(process.env.IN_GAME_WALLET_SECRET!);
    const inGameKeypair = Keypair.fromSecretKey(secretKey);

    const RPC_URL = process.env.HELIUS_RPC_KEY
      ? `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_RPC_KEY}`
      : "https://api.devnet.solana.com";
    const connection = new anchor.web3.Connection(RPC_URL, "confirmed");

    const wallet = {
      publicKey: inGameKeypair.publicKey,
      signTransaction: async (tx: anchor.web3.Transaction) => {
        tx.sign(inGameKeypair);
        return tx;
      },
      signAllTransactions: async (txs: anchor.web3.Transaction[]) => {
        txs.forEach((tx) => tx.sign(inGameKeypair));
        return txs;
      },
    };

    const provider = new anchor.AnchorProvider(connection, wallet as any, {
      preflightCommitment: "confirmed",
    });
    const program = new anchor.Program(
      idl as anchor.Idl,
      provider
    ) as unknown as anchor.Program<JinaiHere>;

    // 6. ✅ Fixed: Use poolIndex for PDA generation, not poolId
    console.log("🔍 Game data debug:");
    console.log("game.poolId (address):", game.poolId);
    console.log("game.poolIndex (numeric):", game.poolIndex);

    // Use poolIndex for PDA generation (numeric), not poolId (address)
    const poolIndex = game.poolIndex;

    if (isNaN(poolIndex)) {
      console.error("❌ Invalid poolIndex from database");
      return NextResponse.json(
        {
          error: "Invalid pool index",
          details: "poolIndex from database is not a valid number",
          gameData: {
            poolId: game.poolId,
            poolIndex: game.poolIndex,
          },
        },
        { status: 400 }
      );
    }

    const walletPublicKey = new PublicKey(walletAddress);

    const poolPDA = getPoolPDA(poolIndex);
    const playerPDA = getPlayerPDA(poolIndex, walletPublicKey);
    const poolVaultPDA = getPoolVaultPDA(poolIndex);

    // Debug logging
    console.log("🔍 PDA Generation Debug:");
    console.log("Pool Index (numeric):", poolIndex);
    console.log("Pool ID (address):", game.poolId);
    console.log("Pool PDA:", poolPDA.toBase58());
    console.log("Player PDA:", playerPDA.toBase58());
    console.log("Pool Vault PDA:", poolVaultPDA.toBase58());
    console.log("Wallet Address:", walletAddress);

    // Check if player account exists before attempting transaction
    const playerAccountInfo = await connection.getAccountInfo(playerPDA);
    if (!playerAccountInfo) {
      console.error("❌ Player account does not exist!");
      console.log("Expected Player PDA:", playerPDA.toBase58());
      return NextResponse.json(
        {
          error: "Player account not found",
          details: `Player PDA ${playerPDA.toBase58()} does not exist. Make sure you joined the pool correctly.`,
          playerPDA: playerPDA.toBase58(),
          poolId: poolIndex,
        },
        { status: 404 }
      );
    }

    console.log(
      "✅ Player account exists with data length:",
      playerAccountInfo.data.length
    );

    // Build and send on-chain transaction
    const instruction = await program.methods
      .uPrizes()
      .accountsPartial({
        pool: poolPDA,
        player: playerPDA,
        playerAuthority: walletPublicKey,
        poolVault: poolVaultPDA,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = inGameKeypair.publicKey;

    transaction.sign(inGameKeypair);

    console.log("🚀 Sending transaction...");
    const txSig = await connection.sendRawTransaction(transaction.serialize());
    console.log("✅ Transaction sent:", txSig);

    await connection.confirmTransaction(txSig, "confirmed");
    console.log("✅ Transaction confirmed");

    // 7. Update DB
    await prisma.gameParticipant.update({
      where: { gameId_userId: { gameId, userId: participant.userId } },
      data: { hasClaimed: true },
    });

    return NextResponse.json({
      success: true,
      message: "Prize claimed successfully",
      data: {
        rank: participant.finalRank,
        prizeAmount: participant.prizeWon,
        transactionSignature: txSig,
        username: participant.user?.username,
        walletAddress,
        playerPDA: playerPDA.toBase58(), // For debugging
      },
    });
  } catch (error: any) {
    console.error("❌ Prize claim error:", error);

    // Enhanced error logging
    if (error.logs) {
      console.error("Transaction logs:", error.logs);
    }

    return NextResponse.json(
      {
        error: "Failed to process prize claim",
        details: error instanceof Error ? error.message : "Unknown error",
        logs: error.logs || null,
      },
      { status: 500 }
    );
  }
}
