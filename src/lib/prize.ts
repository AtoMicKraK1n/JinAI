import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function calculateAndDistributePrizes(gameId: string) {
  try {
    const game = await prisma.gameSession.findUnique({
      where: { id: gameId },
    });

    if (!game) return;

    // Get all participants
    const participants = await prisma.gameParticipant.findMany({
      where: { gameId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
      },
    });

    // Get all answers for the game
    const allAnswers = await prisma.playerAnswer.findMany({
      where: { gameId },
    });

    // Aggregate score and stats
    const results = participants.map((p) => {
      const answers = allAnswers.filter((a) => a.userId === p.userId);
      const totalScore = answers.reduce((sum, a) => sum + a.points, 0);
      const correctAnswers = answers.filter((a) => a.isCorrect).length;

      return {
        userId: p.userId,
        username: p.user.username,
        walletAddress: p.user.walletAddress,
        totalScore,
        correctAnswers,
        totalAnswers: answers.length,
      };
    });

    // Sort by score (desc)
    results.sort((a, b) => b.totalScore - a.totalScore);

    // Prize distribution config
    const prizeDistribution = {
      1: 0.6,
      2: 0.25,
      3: 0.1,
      4: 0.05,
    };

    // Update participants with rank and prize
    for (let i = 0; i < results.length; i++) {
      const rank = i + 1;
      const prizePercentage =
        prizeDistribution[rank as keyof typeof prizeDistribution] || 0;
      const prizeAmount = game.prizePool * prizePercentage;

      await prisma.gameParticipant.updateMany({
        where: {
          gameId,
          userId: results[i].userId,
        },
        data: {
          finalRank: rank,
          prizeWon: prizeAmount,
        },
      });
    }

    console.log(`🏁 Prizes distributed for game ${gameId}`);
  } catch (error) {
    console.error("❌ Error in prize distribution:", error);
  }
}
