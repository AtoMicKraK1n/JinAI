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
    const { gameId, questionCount = 10 } = await request.json();

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    // Verify user is the game creator or participant
    const participant = await prisma.gameParticipant.findFirst({
      where: {
        gameId,
        userId,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this game" },
        { status: 403 }
      );
    }

    // Check if questions are already seeded for this game
    const existingQuestions = await prisma.gameQuestion.findMany({
      where: { gameId },
    });

    if (existingQuestions.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Questions already seeded for this game",
        questionsCount: existingQuestions.length,
      });
    }

    // Get random questions from different difficulties
    const easyQuestions = await prisma.question.findMany({
      where: {
        difficulty: "EASY",
        isActive: true,
      },
      take: Math.ceil(questionCount * 0.4), // 40% easy
      orderBy: { createdAt: "desc" },
    });

    const mediumQuestions = await prisma.question.findMany({
      where: {
        difficulty: "MEDIUM",
        isActive: true,
      },
      take: Math.ceil(questionCount * 0.4), // 40% medium
      orderBy: { createdAt: "desc" },
    });

    const hardQuestions = await prisma.question.findMany({
      where: {
        difficulty: "HARD",
        isActive: true,
      },
      take: Math.ceil(questionCount * 0.2), // 20% hard
      orderBy: { createdAt: "desc" },
    });

    // Combine and shuffle questions
    const selectedQuestions = [
      ...easyQuestions,
      ...mediumQuestions,
      ...hardQuestions,
    ].slice(0, questionCount);

    if (selectedQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions available in database" },
        { status: 400 }
      );
    }

    // Shuffle the questions array
    for (let i = selectedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedQuestions[i], selectedQuestions[j]] = [
        selectedQuestions[j],
        selectedQuestions[i],
      ];
    }

    // Create GameQuestion records
    const gameQuestions = await Promise.all(
      selectedQuestions.map(async (question, index) => {
        return await prisma.gameQuestion.create({
          data: {
            gameId,
            questionId: question.id,
            orderIndex: index + 1,
            timeLimit: getTimeLimitByDifficulty(question.difficulty),
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: "Questions seeded successfully",
      questionsSeeded: gameQuestions.length,
      breakdown: {
        easy: easyQuestions.length,
        medium: mediumQuestions.length,
        hard: hardQuestions.length,
        total: selectedQuestions.length,
      },
    });
  } catch (error) {
    console.error("Seed questions error:", error);
    return NextResponse.json(
      { error: "Failed to seed questions" },
      { status: 500 }
    );
  }
}

// Helper function to set time limits based on difficulty
function getTimeLimitByDifficulty(difficulty: string): number {
  switch (difficulty) {
    case "EASY":
      return 20; // 20 seconds
    case "MEDIUM":
      return 30; // 30 seconds
    case "HARD":
      return 45; // 45 seconds
    default:
      return 30;
  }
}

// Optional: GET method to check seeded questions for a game
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    const gameQuestions = await prisma.gameQuestion.findMany({
      where: { gameId },
      include: {
        question: {
          select: {
            id: true,
            question: true,
            difficulty: true,
            category: true,
          },
        },
      },
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({
      success: true,
      gameId,
      questionsCount: gameQuestions.length,
      questions: gameQuestions.map((gq) => ({
        orderIndex: gq.orderIndex,
        questionId: gq.question.id,
        difficulty: gq.question.difficulty,
        category: gq.question.category,
        timeLimit: gq.timeLimit,
        questionPreview: gq.question.question.substring(0, 50) + "...",
      })),
    });
  } catch (error) {
    console.error("Get seeded questions error:", error);
    return NextResponse.json(
      { error: "Failed to get seeded questions" },
      { status: 500 }
    );
  }
}
