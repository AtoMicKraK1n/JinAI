use anchor_lang::prelude::*;

#[account]
pub struct Pool {

    pub pool_id: u64,
    pub creator: Pubkey,
    pub total_amount: u64,
    pub status: PoolStatus,
    pub min_deposit: u64,
    pub current_players: u8,
    pub max_players: u8,
    pub end_time: i64,
    pub prize_distribution: [u8; 4],
    pub fee_amount: u64,
    pub bump: u8,
    pub player_accounts: [Pubkey; 4],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PoolStatus {
    Open,  
    InProgress,  
    Completed,  
    Cancelled,  
}

impl Space for Pool {
    const INIT_SPACE: usize = 8 + 8 + 32 + 8 + 1 + 8 + 1 + 1 + 8 + 4 + 8 + 1 + (32 * 4);   
}