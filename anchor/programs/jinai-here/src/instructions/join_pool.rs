use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct JoinPool<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.pool_id.to_le_bytes().as_ref()],
        bump = pool.bump,
        constraint = pool.current_players < pool.max_players @ ErrorCode::PoolFull
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        init,
        payer = player_authority,
        space = 8 + Player::INIT_SPACE,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), player_authority.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,
    
    #[account(mut)]
    pub player_authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"pool-vault", pool.pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool_vault: SystemAccount<'info>,
    
    pub system_program: Program<'info, System>,
}


    pub fn join_pool_handler(ctx: Context<JoinPool>, deposit_amount: u64) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let player = &mut ctx.accounts.player;
    
    require!(pool.status == PoolStatus::Open, ErrorCode::PoolNotOpen);
    
    require!(pool.current_players < pool.max_players, ErrorCode::PoolFull);
    
    require!(deposit_amount >= pool.min_deposit, ErrorCode::InsufficientDeposit);
    
    let clock = Clock::get()?;
    require!(clock.unix_timestamp < pool.end_time, ErrorCode::PoolClosed);
    
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player_authority.to_account_info(),
                to: ctx.accounts.pool_vault.to_account_info(),
            }
        ),
        deposit_amount
    )?;
    
    // Initialize player data
    player.player = ctx.accounts.player_authority.key();
    player.pool_id = pool.pool_id;
    player.deposit_amount = deposit_amount;
    player.has_claimed = false;
    player.rank = 0;
    player.prize_amount = 0;
    player.bump = ctx.bumps.player;

    let player_index = pool.current_players as usize;
    
    pool.player_accounts[player_index] = ctx.accounts.player.key();
    
    pool.current_players += 1;
    pool.total_amount += deposit_amount;
    
    if pool.current_players == pool.max_players {
        pool.status = PoolStatus::InProgress;
    }
    
    Ok(())
}




