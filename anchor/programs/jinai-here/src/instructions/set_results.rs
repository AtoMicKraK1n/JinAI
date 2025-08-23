use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct SetResults<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.pool_id.to_le_bytes().as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        seeds = [b"global-state"],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), player1.player.as_ref()],
        bump,
        constraint = player1.key() == pool.player_accounts[0] @ ErrorCode::InvalidPlayerAccount
    )]
    pub player1: Account<'info, Player>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), player2.player.as_ref()],
        bump,
        constraint = player2.key() == pool.player_accounts[1] @ ErrorCode::InvalidPlayerAccount
    )]
    pub player2: Account<'info, Player>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), player3.player.as_ref()],
        bump,
        constraint = player3.key() == pool.player_accounts[2] @ ErrorCode::InvalidPlayerAccount
    )]
    pub player3: Account<'info, Player>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), player4.player.as_ref()],
        bump,
        constraint = player4.key() == pool.player_accounts[3] @ ErrorCode::InvalidPlayerAccount
    )]
    pub player4: Account<'info, Player>,
}

pub fn set_results_handler(ctx: Context<SetResults>, player_ranks: [u8; 4]) -> Result<()> {
    require!(ctx.accounts.pool.status == PoolStatus::InProgress, ErrorCode::InvalidPoolStatus);

    // Validate ranks (must be 1-4 with no duplicates)
    let mut used_ranks = [false; 4];
    for rank in player_ranks.iter() {
        require!(*rank >= 1 && *rank <= 4, ErrorCode::InvalidRank);
        require!(!used_ranks[(*rank - 1) as usize], ErrorCode::DuplicateRank);
        used_ranks[(*rank - 1) as usize] = true;
    }

    // Set ranks for each player (borrow each mutably once)
    let player_accounts = [
        &mut ctx.accounts.player1,
        &mut ctx.accounts.player2,
        &mut ctx.accounts.player3,
        &mut ctx.accounts.player4,
    ];
    for i in 0..(ctx.accounts.pool.current_players as usize) {
        player_accounts[i].rank = player_ranks[i];
    }

    // Update pool status to completed
    ctx.accounts.pool.status = PoolStatus::Completed;

    Ok(())
}