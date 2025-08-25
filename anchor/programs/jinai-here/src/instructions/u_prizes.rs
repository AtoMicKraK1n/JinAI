use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct UPrizes<'info> {
    #[account(
        seeds = [b"pool", pool.pool_id.to_le_bytes().as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), player_authority.key().as_ref()],
        bump = player.bump,
        constraint = player.player == player_authority.key() @ ErrorCode::Unauthorized
    )]
    pub player: Account<'info, Player>,

    #[account(mut)]
    /// CHECK: used AccountInfo because Signer was not allowing other players to claim their prizes
    pub player_authority: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"pool-vault", pool.pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool_vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn u_prizes_handler(ctx: Context<UPrizes>) -> Result<()> {
    let player = &mut ctx.accounts.player;
    let pool = &ctx.accounts.pool;

    // require!(pool.status == PoolStatus::Completed, ErrorCode::PoolNotCompleted);
    require!(player.prize_amount > 0, ErrorCode::NoPrize);
    require!(!player.has_claimed, ErrorCode::AlreadyClaimed);

    let prize_amount = player.prize_amount;
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
                to: ctx.accounts.player_authority.to_account_info(),
            },
            signer,
        ),
        prize_amount,
    )?;

    player.has_claimed = true;

    Ok(())
}