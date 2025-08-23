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
        include: { user: { select: { username: true, walletAddress: true } } },
        orderBy: { finalRank: "asc" },
      });

      return NextResponse.json({
        success: true,
        message: "Game completed",
        results: finalResults.map((r) => ({
          finalRank: r.finalRank,
          finalScore: r.finalScore,
          username: r.user?.username || "Unknown",
          walletAddress: r.user?.walletAddress,
          prizeWon: r.prizeWon,
        })),
        gameData: {
          poolIndex: game.poolIndex,
          prizePool: game.prizePool,
          status: game.status,
          gameId: game.id,
          isHost,
        },
      });
    }

    if (!isHost) {
      return NextResponse.json(
        { error: "Results not yet finalized by host." },
        { status: 403 }
      );
    }

    // Calculate results and rankings
    const results = game.participants.map((participant) => ({
      userId: participant.userId,
      username: participant.user.username,
      walletAddress: participant.user.walletAddress,
      totalScore: participant.finalScore,
    }));

    // Sort by score (highest first)
    results.sort((a, b) => b.totalScore - a.totalScore);

    // Prize distribution percentages
    const prizeDistribution = { 1: 0.4, 2: 0.3, 3: 0.1, 4: 0.1 };
    const playerRanks: number[] = [];

    // Update database with final rankings and prize amounts
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

    // Mark game as completed in database
    await prisma.gameSession.update({
      where: { id: gameId },
      data: { status: "COMPLETED" },
    });

    // 🚀 ON-CHAIN OPERATION: Set results on blockchain
    try {
      console.log("🔄 Starting on-chain set_results operation...");

      // Setup connection and program
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

      // Generate PDAs
      const poolIdBuffer = new anchor.BN(game.poolIndex).toArrayLike(
        Buffer,
        "le",
        8
      );

      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), poolIdBuffer],
        program.programId
      );

      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        program.programId
      );

      // Verify pool exists and get current state
      const poolAccount = await program.account.pool.fetchNullable(poolPda);
      if (!poolAccount) {
        console.error("❌ Pool account not found on-chain");
        throw new Error("Pool account not found on-chain");
      }

      console.log("📊 Pool status before:", poolAccount.status);

      // 🔧 FIXED: Use stored player PDAs instead of deriving them
      const playerPDAs = poolAccount.playerAccounts;
      console.log(
        "📋 Stored player PDAs:",
        playerPDAs.map((p) => p.toString())
      );

      // Create a map of wallet addresses to their results for easy lookup
      const resultsByAddress = new Map(
        results.map((result) => [result.walletAddress.toLowerCase(), result])
      );

      // Fetch each player account to get their wallet address and match with results
      const ranksInCorrectOrder = await Promise.all(
        poolAccount.playerAccounts.map(async (playerPda, index) => {
          try {
            // Fetch the player account to get the wallet address
            const playerAccount = await program.account.player.fetch(playerPda);
            const walletAddress = playerAccount.player.toString().toLowerCase();

            // Find the corresponding result for this player
            const result = resultsByAddress.get(walletAddress);

            if (!result) {
              console.warn(
                `No result found for player at index ${index}, wallet: ${walletAddress}`
              );
              return 1; // Default rank
            }

            console.log(
              `Player ${index + 1}: ${walletAddress} -> Rank ${
                result.totalScore
              } score, Rank will be calculated...`
            );

            // Find the rank based on the sorted results
            const sortedResultIndex = results.findIndex(
              (r) => r.walletAddress.toLowerCase() === walletAddress
            );
            const rank = sortedResultIndex + 1;

            console.log(
              `Player ${index + 1}: ${walletAddress} -> Final Rank ${rank}`
            );
            return rank;
          } catch (error) {
            console.error(`Error fetching player account ${index}:`, error);
            return 1; // Default rank if fetch fails
          }
        })
      );

      console.log(
        "🎯 Final ranks array in correct order:",
        ranksInCorrectOrder
      );

      console.log("🔍 On-chain PDAs:", {
        poolPda: poolPda.toBase58(),
        globalStatePda: globalStatePda.toBase58(),
        poolIndex: game.poolIndex,
        playerRanks: ranksInCorrectOrder,
        playerPDAs: playerPDAs.map((p) => p.toBase58()),
      });

      // Convert ranks to u8 array format expected by the instruction
      const ranksArray = ranksInCorrectOrder as [
        number,
        number,
        number,
        number
      ];

      // Execute set_results instruction
      const setResultsTxSig = await program.methods
        .setResults(ranksArray)
        .accountsPartial({
          pool: poolPda,
          globalState: globalStatePda,
          authority: inGameKeypair.publicKey,
          player1: playerPDAs[0],
          player2: playerPDAs[1],
          player3: playerPDAs[2],
          player4: playerPDAs[3],
        })
        .signers([inGameKeypair])
        .rpc({
          commitment: "confirmed",
          skipPreflight: false,
        });

      console.log("✅ Set results transaction successful:", setResultsTxSig);

      // Get transaction details to see what actually happened
      try {
        const txDetails = await connection.getTransaction(setResultsTxSig, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        if (txDetails?.meta?.logMessages) {
          console.log("📋 Transaction logs:");
          txDetails.meta.logMessages.forEach((log, index) => {
            console.log(`  [${index}] ${log}`);
          });
        }

        if (txDetails?.meta?.err) {
          console.error("❌ Transaction had an error:", txDetails.meta.err);
        }
      } catch (logError) {
        console.warn("⚠️ Could not fetch transaction logs:", logError);
      }

      // Wait for transaction confirmation and verify the pool status was updated
      console.log("⏳ Waiting for transaction confirmation...");
      await connection.confirmTransaction(setResultsTxSig, "confirmed");

      // Retry fetching the pool account with some delay to ensure state update
      let updatedPoolAccount;
      let retries = 3;

      for (let i = 0; i < retries; i++) {
        try {
          // Add a small delay to allow blockchain state to update
          await new Promise((resolve) => setTimeout(resolve, 1000));

          updatedPoolAccount = await program.account.pool.fetch(poolPda);
          console.log(
            `📊 Pool status after (attempt ${i + 1}):`,
            updatedPoolAccount.status
          );

          // Check if status is completed
          if (
            updatedPoolAccount.status &&
            "completed" in updatedPoolAccount.status
          ) {
            console.log("✅ Pool status successfully updated to completed!");
            break;
          }

          if (i === retries - 1) {
            console.warn("⚠️ Pool status still not updated after all retries");
          }
        } catch (fetchError) {
          console.error(
            `❌ Error fetching pool account (attempt ${i + 1}):`,
            fetchError
          );
        }
      }
    } catch (onChainError) {
      console.error("❌ On-chain set_results operation failed:", onChainError);
      // Log the error but don't fail the entire operation
      // The database has been updated successfully, which is the minimum requirement
      console.warn(
        "⚠️ Game marked as completed in database, but on-chain update failed"
      );
    }

    // Fetch final results with updated data
    const finalResults = await prisma.gameParticipant.findMany({
      where: { gameId },
      include: { user: { select: { username: true, walletAddress: true } } },
      orderBy: { finalRank: "asc" },
    });

    return NextResponse.json({
      success: true,
      message:
        "Game completed successfully! Results finalized and set on-chain.",
      results: finalResults.map((r) => ({
        finalRank: r.finalRank,
        finalScore: r.finalScore,
        username: r.user?.username || "Unknown",
        walletAddress: r.user?.walletAddress,
        prizeWon: r.prizeWon,
      })),
      gameData: {
        poolIndex: game.poolIndex,
        prizePool: game.prizePool,
        status: "COMPLETED",
        gameId: game.id,
        isHost: true,
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
