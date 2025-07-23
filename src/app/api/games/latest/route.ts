import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) throw new Error("Missing token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    await prisma.gameSession.updateMany({
      where: {
        status: "WAITING",
        createdAt: { lt: tenMinutesAgo },
      },
      data: {
        status: "CANCELLED",
      },
    });

    const latest = await prisma.gameSession.findFirst({
      where: {
        status: "WAITING",
        createdAt: { gte: tenMinutesAgo },
        participants: {
          none: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      return NextResponse.json({ success: true, gameId: latest.id });
    }

    return NextResponse.json({
      success: false,
      message: "No valid game found",
    });
  } catch (error) {
    console.error("Latest game fetch error:", error);
    return NextResponse.json({ error: "Failed to find game" }, { status: 500 });
  }
}
