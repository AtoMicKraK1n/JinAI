use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct TRewards<'info> {
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
        seeds = [b"pool-vault", pool.pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool_vault: SystemAccount<'info>,

    #[account(
        mut,
        constraint = treasury.key() == global_state.treasury @ ErrorCode::InvalidTreasury
    )]
    pub treasury: SystemAccount<'info>,

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

    pub system_program: Program<'info, System>,
}

pub fn t_rewards_handler(ctx: Context<TRewards>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    // require!(pool.status == PoolStatus::InProgress, ErrorCode::InvalidPoolStatus);

    // Calculate fee amount (10% of total)
    let fee_amount = pool.total_amount / 10;
    pool.fee_amount = fee_amount;

    // Calculate prize amounts for each rank
    let total_prize_pool = pool.total_amount - fee_amount;
    let mut prize_amounts = [0u64; 4];
    for i in 0..4 {
        prize_amounts[i] = (total_prize_pool as u128 * pool.prize_distribution[i] as u128 / 90) as u64;
    }

    // Assign prize amounts to players based on their rank
    let mut player_accounts = [
    &mut ctx.accounts.player1,
    &mut ctx.accounts.player2,
    &mut ctx.accounts.player3,
    &mut ctx.accounts.player4,
    ];
    for i in 0..(pool.current_players as usize) {
        let player = &mut player_accounts[i];
        let rank = player.rank as usize;
        if rank > 0 && rank <= 4 {
            player.prize_amount = prize_amounts[rank - 1];
        }
    }

    // Transfer fee to treasury
    if fee_amount > 0 {
        let pool_id_bytes = pool.pool_id.to_le_bytes();
        let seeds = &[
            b"pool-vault",
            pool_id_bytes.as_ref(),
            &[ctx.bumps.pool_vault],
        ];
    let signer = &[&seeds[..]];

        system_program::transfer(
        CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.pool_vault.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        },
        signer,
    ),
    fee_amount,
)?;
    }

    pool.status = PoolStatus::Completed;

    Ok(())
}