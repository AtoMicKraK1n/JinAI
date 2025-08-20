import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

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
    }

    // Mark game as completed
    await prisma.gameSession.update({
      where: { id: gameId },
      data: { status: "COMPLETED" },
    });

    // Fetch final results with updated data
    const finalResults = await prisma.gameParticipant.findMany({
      where: { gameId },
      include: { user: { select: { username: true, walletAddress: true } } },
      orderBy: { finalRank: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "Game completed successfully! Results finalized.",
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
