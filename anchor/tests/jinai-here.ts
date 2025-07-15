import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { JinaiHere } from "../target/types/jinai_here";

describe("jinai-here", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.JinaiHere as Program<JinaiHere>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.appointPool.rpc();
    console.log("Your transaction signature", tx);
  });
});
