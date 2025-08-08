import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { calculateAndDistributePrizes } from "@/lib/prize";

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
    const {
      gameId,
      questionId,
      selectedAnswer,
      responseTime = 0,
    } = await request.json();

    if (
      !gameId ||
      !questionId ||
      selectedAnswer === undefined ||
      typeof selectedAnswer !== "number" ||
      selectedAnswer < 0 ||
      selectedAnswer > 3
    ) {
      return NextResponse.json(
        {
          error:
            "Game ID, question ID, and valid selected answer index (0-3) are required",
        },
        { status: 400 }
      );
    }

    const participant = await prisma.gameParticipant.findFirst({
      where: { gameId, userId },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this game" },
        { status: 403 }
      );
    }

    console.log("🔍 Attempting answer", { gameId, userId, questionId });

    const existingAnswer = await prisma.playerAnswer.findFirst({
      where: { gameId, userId, questionId },
    });

    if (existingAnswer) {
      return NextResponse.json(
        { error: "You have already answered this question" },
        { status: 400 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const answerMap = ["A", "B", "C", "D"];
    const selectedLetter = answerMap[selectedAnswer];

    console.log("🧪 DEBUG - Answer Comparison", {
      userId,
      questionId,
      selectedAnswer,
      selectedLetter,
      correctAnswer: question.correctAnswer,
    });

    const isCorrect = selectedLetter === question.correctAnswer;
    console.log("✅ Answer is correct?", isCorrect);

    let points = 0;
    if (isCorrect) {
      const basePoints = 100;
      const speedBonus = Math.max(0, 50 - Math.floor(responseTime / 1000));
      points = basePoints + speedBonus;
    }

    await prisma.playerAnswer.create({
      data: {
        gameId,
        userId,
        questionId,
        selectedAnswer: selectedLetter,
        isCorrect,
        responseTime,
        points,
      },
    });

    // 🔢 Update gameParticipant.finalScore
    const totalScore = await prisma.playerAnswer.aggregate({
      where: { gameId, userId },
      _sum: { points: true },
    });

    await prisma.gameParticipant.updateMany({
      where: { gameId, userId },
      data: {
        finalScore: totalScore._sum.points || 0,
      },
    });

    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (game && game.status === "STARTING") {
      await prisma.gameSession.update({
        where: { id: gameId },
        data: { status: "IN_PROGRESS" },
      });
    }

    if (game && game.status !== "COMPLETED") {
      const totalQuestions = await prisma.question.count();
      const participants = await prisma.gameParticipant.findMany({
        where: { gameId },
      });

      const totalExpectedAnswers = totalQuestions * participants.length;

      const totalAnswersSoFar = await prisma.playerAnswer.count({
        where: { gameId },
      });

      if (totalAnswersSoFar >= totalExpectedAnswers) {
        await prisma.gameSession.update({
          where: { id: gameId },
          data: { status: "COMPLETED" },
        });

        console.log(`✅ Game ${gameId} marked as COMPLETED.`);
        await calculateAndDistributePrizes(gameId);
      }
    }

    // Convert correct answer letter to numeric index for frontend compatibility
    const correctAnswerIndex = answerMap.indexOf(question.correctAnswer);

    return NextResponse.json({
      success: true,
      result: {
        isCorrect,
        points,
        correctAnswer: correctAnswerIndex, // ✅ numeric index
        responseTime,
      },
    });
  } catch (error) {
    console.error("❌ Submit answer error:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
