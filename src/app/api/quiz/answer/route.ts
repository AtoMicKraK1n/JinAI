import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { calculateAndDistributePrizes } from "@/app/lib/prize";

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

    if (!gameId || !questionId || !selectedAnswer) {
      return NextResponse.json(
        { error: "Game ID, question ID, and selected answer are required" },
        { status: 400 }
      );
    }

    // Check participation
    const participant = await prisma.gameParticipant.findFirst({
      where: { gameId, userId },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a participant in this game" },
        { status: 403 }
      );
    }

    // Prevent duplicate answers
    const existingAnswer = await prisma.playerAnswer.findFirst({
      where: { gameId, userId, questionId },
    });

    if (existingAnswer) {
      return NextResponse.json(
        { error: "You have already answered this question" },
        { status: 400 }
      );
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Points logic
    let points = 0;
    if (isCorrect) {
      const basePoints = 100;
      const speedBonus = Math.max(0, 50 - Math.floor(responseTime / 1000));
      points = basePoints + speedBonus;
    }

    // Save answer
    await prisma.playerAnswer.create({
      data: {
        gameId,
        userId,
        questionId,
        selectedAnswer,
        isCorrect,
        responseTime,
        points,
      },
    });

    // Update game status from STARTING to IN_PROGRESS
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (game && game.status === "STARTING") {
      await prisma.gameSession.update({
        where: { id: gameId },
        data: { status: "IN_PROGRESS" },
      });
    }

    // ✅ AUTO-COMPLETE GAME IF ALL ANSWERS SUBMITTED
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

        // 🏆 Distribute prizes
        await calculateAndDistributePrizes(gameId);
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        isCorrect,
        points,
        correctAnswer: question.correctAnswer,
        responseTime,
      },
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
