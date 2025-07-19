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

    const latest = await prisma.gameSession.findFirst({
      where: {
        status: "WAITING",
        participants: { none: { userId } }, // Make sure not already joined
      },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      return NextResponse.json({ success: true, gameId: latest.id });
    }

    return NextResponse.json({ success: false, message: "No game available" });
  } catch (error) {
    console.error("Latest game fetch error:", error);
    return NextResponse.json({ error: "Failed to find game" }, { status: 500 });
  }
}
