import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { PublicKey, Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message } = await request.json();

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "Wallet address, signature, and message are required" },
        { status: 400 }
      );
    }

    try {
      const publicKeyBytes = new PublicKey(walletAddress).toBytes();
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);

      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }

      const messageData = parseAuthMessage(message);
      if (!validateAuthMessage(messageData)) {
        return NextResponse.json(
          { error: "Invalid or expired message" },
          { status: 401 }
        );
      }
    } catch (verificationError) {
      console.error("Signature verification error:", verificationError);
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress,
          username: `Player_${walletAddress.slice(-6)}`,
        },
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        totalGamesPlayed: user.totalGamesPlayed,
        totalWins: user.totalWins,
        totalEarnings: user.totalEarnings,
      },
      token,
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        totalGamesPlayed: user.totalGamesPlayed,
        totalWins: user.totalWins,
        totalEarnings: user.totalEarnings,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// Helper function to parse the authentication message
function parseAuthMessage(message: string): any {
  try {
    // Example message format: "Sign in to MyApp\nTimestamp: 1234567890\nNonce: abc123"
    const lines = message.split("\n");
    const result: any = {};

    lines.forEach((line) => {
      if (line.includes("Timestamp:")) {
        result.timestamp = parseInt(line.split("Timestamp:")[1].trim());
      }
      if (line.includes("Nonce:")) {
        result.nonce = line.split("Nonce:")[1].trim();
      }
    });

    return result;
  } catch (error) {
    return {};
  }
}

// Helper function to validate the authentication message
function validateAuthMessage(messageData: any): boolean {
  // Check if timestamp is within acceptable range (e.g., 5 minutes)
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (messageData.timestamp) {
    const messageTime = messageData.timestamp * 1000; // Convert to milliseconds
    if (Math.abs(now - messageTime) > fiveMinutes) {
      return false; // Message is too old or from the future
    }
  }

  // Additional validations can be added here
  // e.g., nonce validation, domain validation, etc.

  return true;
}
