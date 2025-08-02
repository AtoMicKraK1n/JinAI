const { Server } = require("socket.io");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

global.io = io;

setupSocketServer(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`✅ WebSocket server running on port ${PORT}`);
});

function setupSocketServer(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Player connected: ${socket.id}`);

    socket.on("join-game", async ({ gameId, token }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const participant = await prisma.gameParticipant.findFirst({
          where: { gameId, userId },
          include: { user: true },
        });

        if (!participant) {
          socket.emit("error", { message: "❌ Not a valid participant" });
          return;
        }

        socket.join(gameId);
        socket.data.userId = userId;
        socket.data.gameId = gameId;

        const username =
          participant.user.username || `Player_${userId.slice(-4)}`;

        console.log(`🎮 ${username} joined game ${gameId}`);
        console.log("✅ join-game triggered with:", gameId, userId);
        console.log("📤 Emitting player-joined:", { userId, username });

        const allParticipants = await prisma.gameParticipant.findMany({
          where: { gameId },
          include: { user: true },
        });

        const existingPlayers = allParticipants.map((p) => ({
          userId: p.userId,
          username: p.user.username || `Player_${p.userId.slice(-4)}`,
        }));

        // 🔁 1. Send existing players to the current socket first
        socket.emit("existing-players", existingPlayers);

        // 📢 2. Then tell others about this new player
        socket.to(gameId).emit("player-joined", {
          userId,
          username,
        });

        if (existingPlayers.length === 4) {
          console.log("🚀 4 players joined, sending start-game event");
          io.to(gameId).emit("start-game");
        }
      } catch (err) {
        console.error("❌ Token verification failed:", err);
        socket.emit("error", { message: "Invalid token" });
      }
    });

    socket.on("score-update", (data) => {
      if (!data.gameId) return;
      io.to(data.gameId).emit("score-update", data);
    });

    socket.on("send-countdown", ({ gameId, seconds = 10 }) => {
      let timeLeft = seconds;
      const interval = setInterval(() => {
        io.to(gameId).emit("countdown", { seconds: timeLeft });
        timeLeft--;
        if (timeLeft < 0) clearInterval(interval);
      }, 1000);
    });

    socket.on("send-question", async ({ gameId, questionId }) => {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (question) {
        io.to(gameId).emit("new-question", {
          id: question.id,
          text: question.question,
          options: {
            A: question.optionA,
            B: question.optionB,
            C: question.optionC,
            D: question.optionD,
          },
        });
      }
    });

    socket.on("game-over", ({ gameId, winner }) => {
      io.to(gameId).emit("game-over", {
        message: "🛑 Game Over",
        winner,
      });
    });

    socket.on("player-joined", ({ gameId, playerId, username }) => {
      const safeName = username || `Player_${playerId.slice(-4)}`;
      io.to(gameId).emit("player-joined", {
        userId: playerId,
        username: safeName,
      });
    });

    socket.on("timer-update", ({ roomId, timeLeft }) => {
      io.to(roomId).emit("timer-update", { roomId, timeLeft });
    });

    socket.on("timer-expired", ({ roomId }) => {
      io.to(roomId).emit("timer-expired", { roomId });
    });

    // ✅ NEW: next-question handler
    socket.on("next-question", (index) => {
      const gameId = socket.data.gameId;
      if (!gameId) {
        console.warn("❌ No gameId found on socket, can't emit next-question");
        return;
      }

      console.log(
        `➡️ Host triggered next-question ${index} for game ${gameId}`
      );
      io.to(gameId).emit("next-question", index);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Player disconnected: ${socket.id}`);
      if (socket.data?.gameId && socket.data?.userId) {
        io.to(socket.data.gameId).emit("player-left", {
          userId: socket.data.userId,
        });
      }
    });
  });
}
