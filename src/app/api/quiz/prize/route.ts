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

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request);
    const { gameId, transactionSignature } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    console.log("🎁 Processing prize claim:", {
      userId,
      gameId,
      transactionSignature: transactionSignature || "off-chain",
    });

    // ✅ Check if user participated in this game
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        gameId,
        userId,
      },
      include: {
        user: {
          select: { username: true, walletAddress: true },
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this game" },
        { status: 403 }
      );
    }

    // ✅ Check if already claimed (using existing hasClaimed field)
    if (participant.hasClaimed) {
      return NextResponse.json(
        {
          success: false,
          message: "Prize already claimed",
          alreadyClaimed: true,
        },
        { status: 400 }
      );
    }

    // ✅ Verify game is completed
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Game is not completed yet" },
        { status: 400 }
      );
    }

    // ✅ Check if user has a prize to claim (rank 1-4)
    if (
      !participant.finalRank ||
      participant.finalRank > 4 ||
      !participant.prizeWon ||
      participant.prizeWon <= 0
    ) {
      return NextResponse.json(
        { error: "No prize available for your rank" },
        { status: 400 }
      );
    }

    // ✅ Update participant record (using existing hasClaimed field)
    await prisma.gameParticipant.update({
      where: {
        gameId_userId: {
          gameId,
          userId,
        },
      },
      data: {
        hasClaimed: true, // Use the existing field
        // Note: You won't be able to store transaction hash or claim timestamp
        // without adding those fields to the schema
      },
    });

    console.log("✅ Prize claim recorded successfully:", {
      userId,
      gameId,
      rank: participant.finalRank,
      prizeAmount: participant.prizeWon,
      username: participant.user?.username,
    });

    return NextResponse.json({
      success: true,
      message: "Prize claim recorded successfully",
      data: {
        rank: participant.finalRank,
        prizeAmount: participant.prizeWon,
        transactionSignature,
        username: participant.user?.username,
      },
    });
  } catch (error) {
    console.error("❌ Prize claim error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process prize claim",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
