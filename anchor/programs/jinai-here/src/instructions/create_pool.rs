use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(min_deposit: u64, end_time: i64, prize_distribution: [u8; 4])]
pub struct CreatePool<'info> {
    #[account(
        mut,
        seeds = [b"global-state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        payer = creator,
        space = Pool::INIT_SPACE,
        seeds = [b"pool", global_state.pool_count.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_pool_handler(
    ctx: Context<CreatePool>,
    min_deposit: u64,
    end_time: i64,
    prize_distribution: [u8; 4],
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let global_state = &mut ctx.accounts.global_state;

    let total_distribution: u8 = prize_distribution.iter().sum();
    require!(total_distribution == 90, ErrorCode::InvalidPrizeDistribution);

    pool.pool_id = global_state.pool_count;
    pool.creator = ctx.accounts.creator.key();
    pool.total_amount = 0;
    pool.status = PoolStatus::Open;
    pool.min_deposit = min_deposit;
    pool.current_players = 0;
    pool.max_players = 4;
    pool.end_time = end_time;
    pool.prize_distribution = prize_distribution;
    pool.fee_amount = 0;
    pool.bump = ctx.bumps.pool;

    pool.player_accounts = [Pubkey::default(); 4];

    global_state.pool_count += 1;

    Ok(())
}