import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const walletAddress = searchParams.get("walletAddress");

    if (!gameId || !walletAddress) {
      return NextResponse.json(
        { error: "Missing gameId or walletAddress" },
        { status: 400 }
      );
    }

    // Find participant
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        gameId,
        user: {
          walletAddress: walletAddress,
        },
      },
      include: {
        user: {
          select: { username: true, walletAddress: true },
        },
      },
    });

    if (!participant) {
      return NextResponse.json({
        canClaim: false,
        reason: "No participation found for this wallet in this game",
      });
    }

    // Check if already claimed
    if (participant.hasClaimed) {
      return NextResponse.json({
        canClaim: false,
        reason: "Prize already claimed",
      });
    }

    // Check game status
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({
        canClaim: false,
        reason: "Game not found",
      });
    }

    if (game.status !== "COMPLETED") {
      return NextResponse.json({
        canClaim: false,
        reason: "Game is not completed yet",
      });
    }

    // Check prize eligibility
    if (
      !participant.finalRank ||
      participant.finalRank > 4 ||
      !participant.prizeWon ||
      participant.prizeWon <= 0
    ) {
      return NextResponse.json({
        canClaim: false,
        reason: `No prize available for rank ${participant.finalRank}`,
      });
    }

    return NextResponse.json({
      canClaim: true,
      data: {
        rank: participant.finalRank,
        prizeAmount: participant.prizeWon,
        username: participant.user?.username,
        walletAddress: participant.user?.walletAddress,
      },
    });
  } catch (error) {
    console.error("❌ Eligibility check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check eligibility",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
