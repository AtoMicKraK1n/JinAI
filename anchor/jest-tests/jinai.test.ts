import { describe, it, beforeAll, expect } from "@jest/globals";
import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { Program } from "@coral-xyz/anchor";
import { JinaiHere } from "../target/types/jinai_here";
import { BN } from "bn.js";

describe("JinAI pool creation", () => {
  let context: any;
  let client: any;
  let provider: BankrunProvider;
  let program: Program<JinaiHere>;
  let payer: Keypair;
  let playerKeypair: Keypair;
  let playerKeypairs: Keypair[];
  let treasury: Keypair;

  beforeAll(async () => {
    const IDL = require("../target/idl/jinai_here.json");
    const PROGRAM_ID = new PublicKey(IDL.address);

    context = await startAnchor("./", [], []);
    provider = new BankrunProvider(context);
    client = context.banksClient;
    anchor.setProvider(provider);

    payer = context.payer;
    playerKeypair = Keypair.generate();
    playerKeypairs = Array.from({ length: 4 }, () => Keypair.generate());
    treasury = Keypair.generate();

    // Fund playerKeypair from payer
    const tx = new anchor.web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: playerKeypair.publicKey,
        lamports: 2 * LAMPORTS_PER_SOL, // or any amount you need
      })
    );
    await provider.sendAndConfirm(tx, [payer]);

    program = new anchor.Program<JinaiHere>(IDL, provider);
  });

  it("should initialize global state correctly", async () => {
    try {
      const feeBasisPoints = 250;

      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        program.programId
      );

      const tx = await program.methods
        .appointPool(feeBasisPoints)
        .accountsPartial({
          globalState: globalStatePda,
          authority: payer.publicKey,
          treasury: treasury.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      console.log("Appoint pool transaction signature:", tx);

      const globalStateAccount = await program.account.globalState.fetch(
        globalStatePda
      );

      expect(globalStateAccount.authority.toString()).toBe(
        payer.publicKey.toString()
      );
      expect(globalStateAccount.poolCount.toString()).toBe("0");
      expect(globalStateAccount.treasury.toString()).toBe(
        treasury.publicKey.toString()
      );
      expect(globalStateAccount.feeBasisPoints).toBe(feeBasisPoints);
      expect(globalStateAccount.bump).toBeGreaterThan(0);

      console.log("Global state initialized successfully:", {
        authority: globalStateAccount.authority.toString(),
        poolCount: globalStateAccount.poolCount,
        treasury: globalStateAccount.treasury.toString(),
        feeBasisPoints: globalStateAccount.feeBasisPoints,
        bump: globalStateAccount.bump,
      });
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });

  it("should create a pool correctly", async () => {
    try {
      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        program.programId
      );
      // Fetch the current global state to get the pool count for PDA derivation
      const globalStateAccount = await program.account.globalState.fetch(
        globalStatePda
      );

      const poolCount = Number(globalStateAccount.poolCount);
      const [poolPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool"),
          Buffer.from(Uint8Array.of(...new BN(poolCount).toArray("le", 8))),
        ],
        program.programId
      );

      const minDeposit = new anchor.BN(1000);
      const endTime = new anchor.BN(Date.now() / 1000 + 3600); // 1 hour from now
      const prizeDistribution = [30, 30, 20, 10];

      const tx = await program.methods
        .createPool(minDeposit, endTime, prizeDistribution)
        .accountsPartial({
          globalState: globalStatePda,
          pool: poolPda,
          creator: payer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      console.log("Create pool transaction signature:", tx);

      const poolAccount = await program.account.pool.fetch(poolPda);
      const globalStateAfter = await program.account.globalState.fetch(
        globalStatePda
      );

      expect(poolAccount.poolId.toString()).toBe(poolCount.toString());
      expect(poolAccount.creator.toString()).toBe(payer.publicKey.toString());
      expect(Number(poolAccount.totalAmount)).toBe(0);
      expect(poolAccount.status).toEqual({ open: {} }); // Assuming PoolStatus::Open = 0
      expect(Number(poolAccount.minDeposit)).toBe(Number(minDeposit));
      expect(Number(poolAccount.currentPlayers)).toBe(0);
      expect(Number(poolAccount.maxPlayers)).toBe(4);
      expect(Number(poolAccount.endTime)).toBe(Number(endTime));
      expect(poolAccount.prizeDistribution).toEqual(prizeDistribution);
      expect(Number(poolAccount.feeAmount)).toBe(0);
      expect(poolAccount.playerAccounts.length).toBe(4);

      console.log("Pool created successfully:", {
        poolId: poolAccount.poolId,
        creator: poolAccount.creator.toString(),
        minDeposit: poolAccount.minDeposit.toNumber(),
        endTime: poolAccount.endTime.toNumber(),
        prizeDistribution: poolAccount.prizeDistribution,
        updatedPoolCount: globalStateAfter.poolCount,
      });
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });

  it("should successfully allow 4 players to join a pool", async () => {
    try {
      const poolId = "0";
      const depositAmount = new BN(1 * LAMPORTS_PER_SOL); // 1 SOL in lamports

      // Derive pool PDA
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), new BN(poolId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      // Derive pool vault PDA
      const [poolVaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-vault"),
          new BN(poolId).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      // Get initial pool state
      const poolAccountBefore = await program.account.pool.fetch(poolPda);
      const initialPlayerCount = poolAccountBefore.currentPlayers;
      const initialTotalAmount = poolAccountBefore.totalAmount;

      console.log("Initial pool state:");
      console.log(
        `Players: ${initialPlayerCount}/${poolAccountBefore.maxPlayers}`
      );
      console.log(`Total amount: ${initialTotalAmount.toString()} lamports`);

      // Fund all player accounts
      console.log("Funding player accounts...");
      for (let i = 0; i < 4; i++) {
        const fundTx = new anchor.web3.Transaction().add(
          SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: playerKeypairs[i].publicKey,
            lamports: 2 * LAMPORTS_PER_SOL,
          })
        );
        await provider.sendAndConfirm(fundTx, [payer]);
        console.log(
          `✅ Funded player ${i + 1}: ${playerKeypairs[i].publicKey.toString()}`
        );
      }

      // Have each player join the pool
      const playerPdas = [];

      for (let i = 0; i < 4; i++) {
        console.log(`\n--- Player ${i + 1} joining pool ---`);

        // Derive player PDA
        const [playerPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("player"),
            new BN(poolId).toArrayLike(Buffer, "le", 8),
            playerKeypairs[i].publicKey.toBuffer(),
          ],
          program.programId
        );
        playerPdas.push(playerPda);

        // Get pool state before this player joins
        const poolAccountBeforeJoin = await program.account.pool.fetch(poolPda);
        const playersBeforeJoin = poolAccountBeforeJoin.currentPlayers;
        const totalAmountBeforeJoin = poolAccountBeforeJoin.totalAmount;

        // Execute join_pool instruction
        const tx = await program.methods
          .joinPool(depositAmount)
          .accountsPartial({
            pool: poolPda,
            player: playerPda,
            playerAuthority: playerKeypairs[i].publicKey,
            poolVault: poolVaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([playerKeypairs[i]])
          .rpc();

        console.log(`Player ${i + 1} join transaction signature:`, tx);

        // Verify pool state updates after this player joins
        const poolAccountAfterJoin = await program.account.pool.fetch(poolPda);
        expect(Number(poolAccountAfterJoin.currentPlayers)).toBe(
          Number(playersBeforeJoin) + 1
        );
        expect(poolAccountAfterJoin.totalAmount.toString()).toBe(
          totalAmountBeforeJoin.add(depositAmount).toString()
        );
        expect(
          poolAccountAfterJoin.playerAccounts[
            Number(playersBeforeJoin)
          ].toString()
        ).toBe(playerPda.toString());

        // Verify player account creation and initialization
        const playerAccount = await program.account.player.fetch(playerPda);
        expect(playerAccount.player.toString()).toBe(
          playerKeypairs[i].publicKey.toString()
        );
        expect(playerAccount.poolId.toString()).toBe(poolId.toString());
        expect(playerAccount.depositAmount.toString()).toBe(
          depositAmount.toString()
        );
        expect(playerAccount.hasClaimed).toBe(false);
        expect(playerAccount.rank).toBe(0);
        expect(playerAccount.prizeAmount.toString()).toBe("0");

        console.log(`✅ Player ${i + 1} successfully joined pool`);
        console.log(
          `Pool players: ${poolAccountAfterJoin.currentPlayers}/${poolAccountAfterJoin.maxPlayers}`
        );
        console.log(
          `Total pool amount: ${poolAccountAfterJoin.totalAmount.toString()} lamports (${
            Number(poolAccountAfterJoin.totalAmount) / 1_000_000_000
          } SOL)`
        );
      }

      // Final verification - check that all 4 players joined successfully
      const finalPoolAccount = await program.account.pool.fetch(poolPda);
      const expectedPlayerCount = Number(initialPlayerCount) + 4;

      expect(Number(finalPoolAccount.currentPlayers)).toBe(expectedPlayerCount);
      expect(finalPoolAccount.totalAmount.toString()).toBe(
        initialTotalAmount.add(depositAmount.mul(new BN(4))).toString()
      );

      // If pool is now full, check status change
      if (
        Number(finalPoolAccount.currentPlayers) ===
        Number(finalPoolAccount.maxPlayers)
      ) {
        expect(finalPoolAccount.status).toStrictEqual({ inProgress: {} });
        console.log("🎉 Pool is now full and status changed to 'inProgress'");
      }

      // Verify all player accounts exist and are correctly initialized
      console.log("\n--- Verifying all player accounts ---");
      for (let i = 0; i < 4; i++) {
        const playerAccount = await program.account.player.fetch(playerPdas[i]);
        expect(playerAccount.player.toString()).toBe(
          playerKeypairs[i].publicKey.toString()
        );
        expect(playerAccount.poolId.toString()).toBe(poolId.toString());
        expect(playerAccount.depositAmount.toString()).toBe(
          depositAmount.toString()
        );
        console.log(`✅ Player ${i + 1} account verified`);
      }

      console.log("\n🎉 All 4 players successfully joined the pool!");
      console.log(`Final pool state:`);
      console.log(
        `Players: ${finalPoolAccount.currentPlayers}/${finalPoolAccount.maxPlayers}`
      );
      console.log(
        `Total amount: ${finalPoolAccount.totalAmount.toString()} lamports (${
          Number(finalPoolAccount.totalAmount) / 1_000_000_000
        } SOL)`
      );
      console.log(finalPoolAccount);
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });

  it("should set pool status to InProgress if called by creator or authority", async () => {
    try {
      const poolId = "0";
      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), new BN(poolId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const finalPoolAccount = await program.account.pool.fetch(poolPda);
      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        program.programId
      );

      const tx = await program.methods
        .securePool()
        .accountsPartial({
          pool: poolPda,
          globalState: globalStatePda,
          signer: payer.publicKey,
        })
        .signers([payer])
        .rpc();

      console.log(
        "should set pool status to InProgress if reached max players",
        tx
      );
      console.log(finalPoolAccount);
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });

  it("should set results for a pool", async () => {
    try {
      // Setup test data
      const poolId = 0;
      const playerRanks = [3, 1, 2, 4]; // Player ranks (1st, 2nd, 3rd, 4th)

      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), new BN(poolId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        program.programId
      );

      const poolAccount = await program.account.pool.fetch(poolPda);
      const playerAccounts = poolAccount.playerAccounts;

      if (playerAccounts.length < 4) {
        throw new Error(
          `Expected 4 players, but only found ${playerAccounts.length}`
        );
      }

      const validPlayerAccounts = playerAccounts
        .filter(
          (account) => account.toString() !== PublicKey.default.toString()
        )
        .slice(0, 4);

      if (validPlayerAccounts.length < 4) {
        throw new Error(
          `Expected 4 valid player accounts, but only found ${validPlayerAccounts.length}`
        );
      }

      console.log(
        "Player accounts from pool:",
        validPlayerAccounts.map((p) => p.toString())
      );

      // for extra debugging, manually derive player PDAs
      const manualPlayerPdas = [];
      for (let i = 0; i < 4; i++) {
        const [playerPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("player"),
            new BN(poolId).toArrayLike(Buffer, "le", 8),
            playerKeypairs[i].publicKey.toBuffer(),
          ],
          program.programId
        );
        manualPlayerPdas.push(playerPda);
      }

      console.log(
        "Manually derived player PDAs:",
        manualPlayerPdas.map((p) => p.toString())
      );

      console.log("Comparing player accounts:");
      for (let i = 0; i < 4; i++) {
        console.log(`Player ${i + 1}:`);
        console.log(`  From pool: ${validPlayerAccounts[i]?.toString()}`);
        console.log(`  Manual:    ${manualPlayerPdas[i].toString()}`);
        console.log(
          `  Match:     ${
            validPlayerAccounts[i]?.toString() ===
            manualPlayerPdas[i].toString()
          }`
        );
      }

      // Debug PDA derivation
      console.log("Program ID:", program.programId.toString());
      console.log("Pool ID as BN:", new BN(poolId).toString());
      console.log(
        "Pool ID as Buffer:",
        new BN(poolId).toArrayLike(Buffer, "le", 8)
      );

      // Check if player accounts match what's expected
      for (let i = 0; i < 4; i++) {
        const [expectedPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("player"),
            new BN(poolId).toArrayLike(Buffer, "le", 8),
            playerKeypairs[i].publicKey.toBuffer(),
          ],
          program.programId
        );
        console.log(`Expected PDA ${i}: ${expectedPda.toString()}`);
        console.log(`Actual PDA ${i}: ${validPlayerAccounts[i].toString()}`);
      }

      // Execute the set_results instruction using the player accounts from the pool
      const tx = await program.methods
        .setResults(playerRanks)
        .accountsPartial({
          pool: poolPda,
          globalState: globalStatePda,
          authority: payer.publicKey,
          player1: validPlayerAccounts[0],
          player2: validPlayerAccounts[1],
          player3: validPlayerAccounts[2],
          player4: validPlayerAccounts[3],
        })
        .signers([payer])
        .rpc();

      console.log("Set results transaction signature:", tx);

      // Verify the results
      const updatedPool = await program.account.pool.fetch(poolPda);
      console.log("Pool status after setting results:", updatedPool.status);

      // Verify individual player updates
      for (let i = 0; i < 4; i++) {
        try {
          const playerAccount = await program.account.player.fetch(
            validPlayerAccounts[i]
          );
          console.log(
            `Player ${i + 1} rank: ${
              playerAccount.rank
            }, prize: ${playerAccount.prizeAmount.toString()}`
          );
        } catch (error) {
          console.error(`Failed to fetch player ${i + 1} account:`, error);
        }
      }
    } catch (error) {
      console.error("Test failed with error:", error);
      console.error("Error details:", error.message);
      if (error.logs) {
        console.error("Program logs:", error.logs);
      }
      throw error;
    }
  });

  it("should distribute rewards to players", async () => {
    try {
      const poolId = 0;

      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), new BN(poolId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [globalStatePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global-state")],
        program.programId
      );

      const [poolVaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-vault"),
          new BN(poolId).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const [treasuryPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("treasury")],
        program.programId
      );

      const poolAccount = await program.account.pool.fetch(poolPda);
      const playerAccounts = poolAccount.playerAccounts;
      const globalStateAccount = await program.account.globalState.fetch(
        globalStatePda
      );

      if (playerAccounts.length < 4) {
        throw new Error(
          `Expected 4 players, but only found ${playerAccounts.length}`
        );
      }

      const validPlayerAccounts = playerAccounts
        .filter(
          (account) => account.toString() !== PublicKey.default.toString()
        )
        .slice(0, 4);

      if (validPlayerAccounts.length < 4) {
        throw new Error(
          `Expected 4 valid player accounts, but only found ${validPlayerAccounts.length}`
        );
      }

      console.log(
        `\nTotal pool amount: ${
          Number(poolAccount.totalAmount) / LAMPORTS_PER_SOL
        } SOL`
      );
      console.log(
        `Prize distribution: [${poolAccount.prizeDistribution.join(", ")}]%`
      );

      const tx = await program.methods
        .tRewards()
        .accountsPartial({
          pool: poolPda,
          globalState: globalStatePda,
          authority: payer.publicKey,
          poolVault: poolVaultPda,
          treasury: treasury.publicKey,
          player1: validPlayerAccounts[0],
          player2: validPlayerAccounts[1],
          player3: validPlayerAccounts[2],
          player4: validPlayerAccounts[3],
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      console.log("Distribute rewards transaction signature:", tx);

      console.log("\n=== REWARD RESULTS ===");
      for (let i = 0; i < validPlayerAccounts.length; i++) {
        const playerAccount = await program.account.player.fetch(
          validPlayerAccounts[i]
        );
        const position = playerAccount.rank;
        const prizeSOL = Number(playerAccount.prizeAmount) / LAMPORTS_PER_SOL;

        console.log(`Player ${i + 1}: Position ${position} → ${prizeSOL} SOL`);
      }

      const balance = await client.getBalance(treasury.publicKey);
      const afterPrizeDistTreasury = Number(balance) / LAMPORTS_PER_SOL;

      console.log(
        "The treasury balance after prize distribution:",
        afterPrizeDistTreasury + " SOL"
      );
    } catch (error) {
      console.error("Test failed with error:", error);
      throw error;
    }
  });

  it("should successfully claim prize when pool is completed", async () => {
    try {
      const poolId = 0;

      const [poolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), new BN(poolId).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      const [poolVaultPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("pool-vault"),
          new BN(poolId).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const poolAccount = await program.account.pool.fetch(poolPda);
      const playerAccounts = poolAccount.playerAccounts;

      const validPlayerAccounts = playerAccounts
        .filter(
          (account) => account.toString() !== PublicKey.default.toString()
        )
        .slice(0, 4);

      if (validPlayerAccounts.length < 4) {
        throw new Error(
          `Expected 4 valid player accounts, but only found ${validPlayerAccounts.length}`
        );
      }

      console.log("Pool status before claiming:", poolAccount.status);
      console.log("Testing prize claiming for players...");

      // Test claiming prizes for each player
      for (let i = 0; i < validPlayerAccounts.length; i++) {
        const playerPda = validPlayerAccounts[i];

        const playerAccountBefore = await program.account.player.fetch(
          playerPda
        );

        if (playerAccountBefore.prizeAmount.toNumber() === 0) {
          console.log(`Player ${i + 1} has no prize to claim, skipping...`);
          continue;
        }

        if (playerAccountBefore.hasClaimed) {
          console.log(`Player ${i + 1} has already claimed prize, skipping...`);
          continue;
        }

        console.log(`\n--- Player ${i + 1} claiming prize ---`);
        console.log(
          `Player authority: ${playerKeypairs[i].publicKey.toString()}`
        );
        console.log(
          `Prize amount: ${
            playerAccountBefore.prizeAmount.toNumber() / LAMPORTS_PER_SOL
          } SOL`
        );
        console.log(`Rank: ${playerAccountBefore.rank}`);

        // Get initial balances
        const initialPlayerBalance = Number(
          await client.getBalance(playerKeypairs[i].publicKey)
        );
        const initialVaultBalance = Number(
          await client.getBalance(poolVaultPda)
        );

        console.log(
          `Initial player balance: ${
            Number(initialPlayerBalance) / LAMPORTS_PER_SOL
          } SOL`
        );
        console.log(
          `Initial vault balance: ${
            Number(initialVaultBalance) / LAMPORTS_PER_SOL
          } SOL`
        );

        const tx = await program.methods
          .uPrizes()
          .accountsPartial({
            pool: poolPda,
            player: playerPda,
            playerAuthority: playerKeypairs[i].publicKey,
            poolVault: poolVaultPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([playerKeypairs[i]])
          .rpc();

        console.log(`Player ${i + 1} claim transaction signature:`, tx);

        // Get final balances
        const finalPlayerBalance = Number(
          await client.getBalance(playerKeypairs[i].publicKey)
        );
        const finalVaultBalance = Number(await client.getBalance(poolVaultPda));

        console.log(
          `Final player balance: ${
            Number(finalPlayerBalance) / LAMPORTS_PER_SOL
          } SOL`
        );
        console.log(
          `Final vault balance: ${
            Number(finalVaultBalance) / LAMPORTS_PER_SOL
          } SOL`
        );

        // Verify the balance changes
        const expectedPlayerIncrease =
          playerAccountBefore.prizeAmount.toNumber();
        const actualPlayerIncrease = finalPlayerBalance - initialPlayerBalance;
        const actualVaultDecrease = initialVaultBalance - finalVaultBalance;

        expect(actualPlayerIncrease).toBeGreaterThan(
          expectedPlayerIncrease - 10000
        );
        expect(actualVaultDecrease).toBe(expectedPlayerIncrease);

        console.log(
          `✅ Balance change verified: +${
            actualPlayerIncrease / LAMPORTS_PER_SOL
          } SOL to player`
        );

        // Verify player account was updated
        const playerAccountAfter = await program.account.player.fetch(
          playerPda
        );
        expect(playerAccountAfter.hasClaimed).toBe(true);
        expect(playerAccountAfter.prizeAmount.toString()).toBe(
          playerAccountBefore.prizeAmount.toString()
        );
        expect(playerAccountAfter.rank).toBe(playerAccountBefore.rank);

        console.log(`✅ Player ${i + 1} successfully claimed prize`);
        console.log(
          `Prize claimed: ${
            playerAccountBefore.prizeAmount.toNumber() / LAMPORTS_PER_SOL
          } SOL`
        );
      }

      console.log("\n🎉 Prize claiming test completed successfully!");

      // Final verification - check all players have claimed status set correctly
      console.log("\n--- Final verification of all player accounts ---");
      for (let i = 0; i < validPlayerAccounts.length; i++) {
        const playerAccount = await program.account.player.fetch(
          validPlayerAccounts[i]
        );

        if (playerAccount.prizeAmount.toNumber() > 0) {
          expect(playerAccount.hasClaimed).toBe(true);
          console.log(
            `✅ Player ${i + 1} (Rank ${playerAccount.rank}): Claimed ${
              playerAccount.prizeAmount.toNumber() / LAMPORTS_PER_SOL
            } SOL`
          );
        } else {
          console.log(
            `✅ Player ${i + 1} (Rank ${playerAccount.rank}): No prize to claim`
          );
        }
      }
    } catch (error) {
      console.error("Prize claiming test failed with error:", error);
      console.error("Error details:", error.message);
      if (error.logs) {
        console.error("Program logs:", error.logs);
      }
      throw error;
    }
  });
});
