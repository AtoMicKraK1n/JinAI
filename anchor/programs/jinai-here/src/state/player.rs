use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub player: Pubkey,
    pub pool_id: u64,
    pub deposit_amount: u64,
    pub has_claimed: bool,
    pub rank: u8,
    pub prize_amount: u64,
    pub bump: u8,
}
