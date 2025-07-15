use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct AppointPool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GlobalState::INIT_SPACE,
        seeds = [b"global-state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Explain why no checks are necessary for this field (e.g. "This account is only used for ... and does not require validation here")    
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

    pub fn appoint_pool_handler(ctx: Context<AppointPool>, fee_basis_points: u16) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    
    global_state.authority = ctx.accounts.authority.key();
    global_state.pool_count = 0;
    global_state.treasury = ctx.accounts.treasury.key();
    global_state.fee_basis_points = fee_basis_points;
    global_state.bump = ctx.bumps.global_state;
    
    Ok(())
}


