import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) throw new Error("No token provided");
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  return decoded;
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    const userId = decoded.userId;
    const walletAddress = decoded.walletAddress;

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

    // Check if participant already exists (redundancy for safety)
    const alreadyJoined = game.participants.some((p) => p.userId === userId);
    if (!alreadyJoined) {
      try {
        await prisma.gameParticipant.create({ data: { gameId, userId } });
      } catch (e: any) {
        if (e.code === "P2002") {
          console.warn("User already joined, skipping duplicate insert.");
        } else {
          throw e;
        }
      }
    }

    // Update game stats
    const updatedGame = await prisma.gameSession.update({
      where: { id: gameId },
      data: {
        currentPlayers: alreadyJoined
          ? game.currentPlayers
          : game.currentPlayers + 1,
        prizePool: alreadyJoined
          ? game.prizePool
          : game.prizePool + game.entryFee,
        status:
          !alreadyJoined && game.currentPlayers + 1 === game.maxPlayers
            ? "STARTING"
            : "WAITING",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        updatedGame.status === "STARTING"
          ? "Game is starting! Get ready..."
          : alreadyJoined
          ? "You already joined this game"
          : "Successfully joined the game",
      game: {
        id: updatedGame.id,
        poolIndex: updatedGame.poolIndex,
        status: updatedGame.status,
        entryFee: updatedGame.entryFee,
        currentPlayers: updatedGame.currentPlayers,
        maxPlayers: updatedGame.maxPlayers,
        prizePool: updatedGame.prizePool,
      },
    });
  } catch (err) {
    console.error("Game join error:", err);
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }
}
