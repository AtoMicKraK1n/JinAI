use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Pool is already full")]
    PoolFull,
    
    #[msg("Pool is not open for new players")]
    PoolNotOpen,
    
    #[msg("Pool has not been completed yet")]
    PoolNotCompleted,
    
    #[msg("Pool has already ended")]
    PoolClosed,
    
    #[msg("Invalid pool status for this operation")]
    InvalidPoolStatus,
    
    #[msg("Deposit amount is less than the minimum required")]
    InsufficientDeposit,
    
    #[msg("Player has already claimed their prize")]
    AlreadyClaimed,
    
    #[msg("Player has no prize to claim")]
    NoPrize,
    
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Invalid player account")]
    InvalidPlayerAccount,
    
    #[msg("Prize distribution must add up to 90%")]
    InvalidPrizeDistribution,
    
    #[msg("Rank must be between 1 and 4")]
    InvalidRank,
    
    #[msg("Each player must have a unique rank")]
    DuplicateRank,
    
    #[msg("Invalid treasury account")]
    InvalidTreasury,
    
    #[msg("No fees available to withdraw")]
    NoFees,
    
    #[msg("Player has already joined this pool")]
    PlayerAlreadyJoined,
    
    #[msg("Maximum number of players reached")]
    MaxPlayersReached,
    
    #[msg("Pool has not accumulated any funds")]
    NoFundsInPool,
    
    #[msg("Cannot set results for a pool with no players")]
    NoPlayersInPool,
    
    #[msg("Provided player account does not match pool record")]
    PlayerMismatch,
    
    #[msg("Calculation error during prize distribution")]
    CalculationError,
    
    #[msg("Program authority does not match global state authority")]
    InvalidAuthority,
    
    #[msg("End time must be in the future")]
    InvalidEndTime,
    
    #[msg("Cannot find a player with the specified account")]
    PlayerNotFound,
    
    #[msg("Insufficient funds in pool vault")]
    InsufficientVaultFunds,
}