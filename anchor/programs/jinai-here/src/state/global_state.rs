use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalState {

    pub authority: Pubkey,
    pub pool_count: u64,
    pub treasury: Pubkey,
    pub fee_basis_points: u16,
    pub bump: u8,
}

