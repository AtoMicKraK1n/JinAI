import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("wallet");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Missing wallet address" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!user) {
    return NextResponse.json({ games: [] });
  }

  const participations = await prisma.gameParticipant.findMany({
    where: {
      userId: user.id,
      prizeWon: { gt: 0 },
      hasClaimed: false,
    },
    include: { game: true },
  });

  const games = participations.map((p) => ({
    id: p.gameId,
    poolIndex: p.game.poolIndex,
    prizeWon: p.prizeWon,
  }));

  return NextResponse.json({ games });
}
