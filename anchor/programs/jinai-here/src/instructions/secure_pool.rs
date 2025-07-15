use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct SecurePool<'info> {
    #[account(
        mut,
        seeds = [b"pool", pool.pool_id.to_le_bytes().as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        seeds = [b"global-state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub signer: Signer<'info>,
}


pub fn secure_pool_handler(ctx: Context<SecurePool>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    require!(pool.status == PoolStatus::InProgress, ErrorCode::InvalidPoolStatus);

    require!(
        ctx.accounts.signer.key() == pool.creator ||
        ctx.accounts.signer.key() == ctx.accounts.global_state.authority,
        ErrorCode::Unauthorized
    );

    pool.status = PoolStatus::InProgress;

    Ok(())
}