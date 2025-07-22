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

    // Verify user is in this game
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        gameId,
        userId,
      },
    });

    console.log("User ID:", userId);
    console.log("Game ID:", gameId);
    console.log("Checking participation...");

    if (!participant) {
      console.log("Not a participant:", { userId, gameId });
      return NextResponse.json(
        { error: "You are not a participant in this game" },
        { status: 403 }
      );
    }

    const gameQuestions = await prisma.gameQuestion.findMany({
      where: { gameId },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            difficulty: true,
            category: true,
          },
        },
      },
      orderBy: {
        orderIndex: "asc",
      },
    });

    console.log("Fetched gameQuestions:", gameQuestions);

    return NextResponse.json({
      success: true,
      questions: gameQuestions.map((gq) => ({
        id: gq.question.id,
        question: gq.question.question,
        options: {
          A: gq.question.optionA,
          B: gq.question.optionB,
          C: gq.question.optionC,
          D: gq.question.optionD,
        },
        difficulty: gq.question.difficulty,
        category: gq.question.category,
        timeLimit: gq.timeLimit,
        orderIndex: gq.orderIndex,
      })),
    });
  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json(
      { error: "Failed to get questions" },
      { status: 500 }
    );
  }
}
