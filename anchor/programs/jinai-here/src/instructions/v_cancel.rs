use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct VCancel<'info> {
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

    #[account(
        mut,
        seeds = [b"pool-vault", pool.pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub pool_vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), pool.player_accounts[0].as_ref()],
        bump,
        constraint = player1.key() == pool.player_accounts[0] @ ErrorCode::InvalidPlayerAccount
    )]
    pub player1: Account<'info, Player>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), pool.player_accounts[1].as_ref()],
        bump,
        constraint = player2.key() == pool.player_accounts[1] @ ErrorCode::InvalidPlayerAccount
    )]
    pub player2: Account<'info, Player>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), pool.player_accounts[2].as_ref()],
        bump,
        constraint = player3.key() == pool.player_accounts[2] @ ErrorCode::InvalidPlayerAccount
    )]
    pub player3: Account<'info, Player>,

    #[account(
        mut,
        seeds = [b"player", pool.pool_id.to_le_bytes().as_ref(), pool.player_accounts[3].as_ref()],
        bump,
        constraint = player4.key() == pool.player_accounts[3] @ ErrorCode::InvalidPlayerAccount
    )]
    pub player4: Account<'info, Player>,

    pub system_program: Program<'info, System>,
}

pub fn v_cancel_handler(ctx: Context<VCancel>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    require!(pool.status == PoolStatus::Open, ErrorCode::InvalidPoolStatus);

    require!(
        ctx.accounts.signer.key() == pool.creator ||
        ctx.accounts.signer.key() == ctx.accounts.global_state.authority,
        ErrorCode::Unauthorized
    );

    pool.status = PoolStatus::Cancelled;

    if pool.current_players > 0 {
        let mut player_accounts = [
            &mut ctx.accounts.player1,
            &mut ctx.accounts.player2,
            &mut ctx.accounts.player3,
            &mut ctx.accounts.player4,
        ];
        let pool_id_bytes = pool.pool_id.to_le_bytes();

        for i in 0..(pool.current_players as usize) {
            let player = &mut player_accounts[i];
            let refund_amount = player.deposit_amount;

            if refund_amount > 0 {
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
                            to: player.to_account_info(),
                        },
                        signer,
                    ),
                    refund_amount,
                )?;

                player.has_claimed = true;
            }
        }
    }

    Ok(())
}