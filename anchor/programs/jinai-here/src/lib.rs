#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

declare_id!("Hqs1UsDrx9s79o2Jm1z9MZxoVsAb9uAU7YMDgWKAwX7G");

pub mod state;
pub mod instructions;
pub mod errors;

use instructions::*;

#[program]
pub mod jinai_here {
    use super::*;

    pub fn appoint_pool(ctx: Context<AppointPool>, fee_basis_points: u16) -> Result<()> {
        appoint_pool_handler(ctx, fee_basis_points)
    }

    pub fn create_pool(
        ctx: Context<CreatePool>,
        min_deposit: u64,
        end_time: i64,
        prize_distribution: [u8; 4],
    ) -> Result<()> {
        create_pool_handler(ctx, min_deposit, end_time, prize_distribution)
    }

    pub fn join_pool(ctx: Context<JoinPool>, deposit_amount: u64) -> Result<()> {
        join_pool_handler(ctx, deposit_amount)
    }

    pub fn secure_pool(ctx: Context<SecurePool>) -> Result<()> {
        secure_pool_handler(ctx)
    }

    pub fn set_results(ctx: Context<SetResults>, player_ranks: [u8; 4]) -> Result<()> {
        set_results_handler(ctx, player_ranks)
    }

    pub fn t_rewards(ctx: Context<TRewards>) -> Result<()> {
        t_rewards_handler(ctx)
    }

    pub fn u_prizes(ctx: Context<UPrizes>) -> Result<()> {
        u_prizes_handler(ctx)
    }

    pub fn v_cancel(ctx: Context<VCancel>) -> Result<()> {
        v_cancel_handler(ctx)
    }
}