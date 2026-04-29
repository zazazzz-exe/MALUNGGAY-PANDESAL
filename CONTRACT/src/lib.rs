#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Map, Symbol, Vec,
};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Members,
    RotationIndex,
    Round,
    PaidStatus,
    TokenAddress,
    ContributionAmount,
    RotationIntervalDays,
    StartTimestamp,
    TotalContributed,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct GroupState {
    pub members: Vec<Address>,
    pub rotation_index: u32,
    pub round: u32,
    pub paid_status: Map<Address, bool>,
    pub pool_balance: i128,
    pub next_recipient: Address,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct MemberInfo {
    pub is_member: bool,
    pub has_paid_this_round: bool,
    pub turn_number: u32,
    pub total_contributed: i128,
}

#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[contracterror]
pub enum Error {
    GroupFull = 1,
    AlreadyMember = 2,
    GameStarted = 3,
    AlreadyPaid = 4,
    NotMember = 5,
    WrongRound = 6,
    NotAllPaid = 7,
    Unauthorized = 8,
    NotInitialized = 9,
    InvalidInput = 10,
}

#[contract]
pub struct Hearth;

#[contractimpl]
impl Hearth {
    // Kindles a new Hearth: admin, token, contribution amount, and Season length.
    pub fn initialize(
        env: Env,
        admin: Address,
        token_address: Address,
        contribution_amount: i128,
        rotation_interval_days: u32,
    ) -> Result<(), Error> {
        if contribution_amount <= 0 || rotation_interval_days == 0 {
            return Err(Error::InvalidInput);
        }

        if env.storage().persistent().has(&DataKey::Admin) {
            return Err(Error::GameStarted);
        }

        admin.require_auth();

        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::TokenAddress, &token_address);
        env.storage()
            .persistent()
            .set(&DataKey::ContributionAmount, &contribution_amount);
        env.storage()
            .persistent()
            .set(&DataKey::RotationIntervalDays, &rotation_interval_days);
        env.storage()
            .persistent()
            .set(&DataKey::Members, &Vec::<Address>::new(&env));
        env.storage().persistent().set(&DataKey::RotationIndex, &0u32);
        env.storage().persistent().set(&DataKey::Round, &1u32);
        env.storage().persistent().set(&DataKey::StartTimestamp, &0u64);
        env.storage()
            .persistent()
            .set(&DataKey::PaidStatus, &Map::<Address, bool>::new(&env));
        env.storage()
            .persistent()
            .set(&DataKey::TotalContributed, &Map::<Address, i128>::new(&env));

        env.events().publish(
            (Symbol::new(&env, "initialized"),),
            (admin, token_address, contribution_amount, rotation_interval_days),
        );

        Ok(())
    }

    // Adds a new Keeper to the Season rotation if the Hearth has not started and capacity allows.
    pub fn join_group(env: Env, member_address: Address) -> Result<(), Error> {
        Self::assert_initialized(&env)?;

        let start_timestamp: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::StartTimestamp)
            .unwrap();
        if start_timestamp > 0 {
            return Err(Error::GameStarted);
        }

        let token_address: Address = env.storage().persistent().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);

        member_address.require_auth();

        // Lightweight trustline readiness check by reading token balance for the member.
        let _ = token_client.balance(&member_address);

        let mut members: Vec<Address> = env.storage().persistent().get(&DataKey::Members).unwrap();
        if members.len() >= 20 {
            return Err(Error::GroupFull);
        }

        if members.contains(&member_address) {
            return Err(Error::AlreadyMember);
        }

        members.push_back(member_address.clone());
        env.storage().persistent().set(&DataKey::Members, &members);

        let mut paid_status: Map<Address, bool> =
            env.storage().persistent().get(&DataKey::PaidStatus).unwrap();
        paid_status.set(member_address.clone(), false);
        env.storage().persistent().set(&DataKey::PaidStatus, &paid_status);

        let mut totals: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::TotalContributed)
            .unwrap();
        totals.set(member_address.clone(), 0);
        env.storage().persistent().set(&DataKey::TotalContributed, &totals);

        env.events()
            .publish((Symbol::new(&env, "member_joined"),), member_address);

        Ok(())
    }

    // Pulls one tending from the Keeper and automatically sends warmth when everyone has tended.
    pub fn contribute(env: Env, member_address: Address) -> Result<(), Error> {
        Self::assert_initialized(&env)?;

        member_address.require_auth();

        let members: Vec<Address> = env.storage().persistent().get(&DataKey::Members).unwrap();
        if !members.contains(&member_address) {
            return Err(Error::NotMember);
        }

        let interval_days: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::RotationIntervalDays)
            .unwrap();
        let round: u32 = env.storage().persistent().get(&DataKey::Round).unwrap();
        let now = env.ledger().timestamp();

        let mut start_timestamp: u64 = env
            .storage()
            .persistent()
            .get(&DataKey::StartTimestamp)
            .unwrap();
        if start_timestamp == 0 {
            start_timestamp = now;
            env.storage()
                .persistent()
                .set(&DataKey::StartTimestamp, &start_timestamp);
        }

        let round_start =
            start_timestamp + (round.saturating_sub(1) as u64) * (interval_days as u64) * 86400;
        if now < round_start {
            return Err(Error::WrongRound);
        }

        let mut paid_status: Map<Address, bool> =
            env.storage().persistent().get(&DataKey::PaidStatus).unwrap();
        if paid_status.get(member_address.clone()).unwrap_or(false) {
            return Err(Error::AlreadyPaid);
        }

        let token_address: Address = env.storage().persistent().get(&DataKey::TokenAddress).unwrap();
        let contribution_amount: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::ContributionAmount)
            .unwrap();

        let token_client = token::Client::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        token_client.transfer(&member_address, &contract_address, &contribution_amount);

        paid_status.set(member_address.clone(), true);
        env.storage().persistent().set(&DataKey::PaidStatus, &paid_status);

        let mut totals: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::TotalContributed)
            .unwrap();
        let prev = totals.get(member_address.clone()).unwrap_or(0);
        totals.set(member_address.clone(), prev + contribution_amount);
        env.storage().persistent().set(&DataKey::TotalContributed, &totals);

        env.events().publish(
            (Symbol::new(&env, "contributed"),),
            (member_address.clone(), contribution_amount),
        );

        if Self::all_paid(&members, &paid_status) {
            Self::release_internal(&env, false)?;
        }

        Ok(())
    }

    // Sends the full Hearth balance as warmth to the current Kin and advances the Season.
    pub fn release(env: Env) -> Result<(), Error> {
        Self::assert_initialized(&env)?;
        Self::release_internal(&env, true)
    }

    // Returns the complete Hearth-level state required by the frontend.
    pub fn get_group_state(env: Env) -> Result<GroupState, Error> {
        Self::assert_initialized(&env)?;

        let members: Vec<Address> = env.storage().persistent().get(&DataKey::Members).unwrap();
        let rotation_index: u32 = env.storage().persistent().get(&DataKey::RotationIndex).unwrap();
        let round: u32 = env.storage().persistent().get(&DataKey::Round).unwrap();
        let paid_status: Map<Address, bool> = env.storage().persistent().get(&DataKey::PaidStatus).unwrap();
        let token_address: Address = env.storage().persistent().get(&DataKey::TokenAddress).unwrap();

        if members.len() == 0 {
            return Err(Error::InvalidInput);
        }

        let token_client = token::Client::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        let pool_balance = token_client.balance(&contract_address);

        let next_recipient = members.get(rotation_index).unwrap();

        Ok(GroupState {
            members,
            rotation_index,
            round,
            paid_status,
            pool_balance,
            next_recipient,
        })
    }

    // Returns a single Keeper's participation and tending metrics.
    pub fn get_member_info(env: Env, address: Address) -> Result<MemberInfo, Error> {
        Self::assert_initialized(&env)?;

        let members: Vec<Address> = env.storage().persistent().get(&DataKey::Members).unwrap();
        let paid_status: Map<Address, bool> = env.storage().persistent().get(&DataKey::PaidStatus).unwrap();
        let totals: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&DataKey::TotalContributed)
            .unwrap();

        let is_member = members.contains(&address);

        let mut turn_number = 0u32;
        if is_member {
            let mut idx: u32 = 0;
            while idx < members.len() {
                if members.get(idx).unwrap() == address {
                    turn_number = idx + 1;
                    break;
                }
                idx += 1;
            }
        }

        Ok(MemberInfo {
            is_member,
            has_paid_this_round: paid_status.get(address.clone()).unwrap_or(false),
            turn_number,
            total_contributed: totals.get(address).unwrap_or(0),
        })
    }
}

impl Hearth {
    fn assert_initialized(env: &Env) -> Result<(), Error> {
        if !env.storage().persistent().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        Ok(())
    }

    fn all_paid(members: &Vec<Address>, paid_status: &Map<Address, bool>) -> bool {
        let mut idx: u32 = 0;
        while idx < members.len() {
            let member = members.get(idx).unwrap();
            if !paid_status.get(member).unwrap_or(false) {
                return false;
            }
            idx += 1;
        }
        true
    }

    fn release_internal(env: &Env, enforce_admin: bool) -> Result<(), Error> {
        let members: Vec<Address> = env.storage().persistent().get(&DataKey::Members).unwrap();
        if members.len() == 0 {
            return Err(Error::InvalidInput);
        }

        let paid_status: Map<Address, bool> = env.storage().persistent().get(&DataKey::PaidStatus).unwrap();
        if !Self::all_paid(&members, &paid_status) {
            return Err(Error::NotAllPaid);
        }

        if enforce_admin {
            let admin: Address = env.storage().persistent().get(&DataKey::Admin).unwrap();
            admin.require_auth();
        }

        let rotation_index: u32 = env.storage().persistent().get(&DataKey::RotationIndex).unwrap();
        let recipient = members.get(rotation_index).unwrap();

        let token_address: Address = env.storage().persistent().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(env, &token_address);

        let contract_address = env.current_contract_address();
        let pool_balance = token_client.balance(&contract_address);
        token_client.transfer(&contract_address, &recipient, &pool_balance);

        let mut reset_paid = Map::<Address, bool>::new(env);
        let mut idx: u32 = 0;
        while idx < members.len() {
            let m = members.get(idx).unwrap();
            reset_paid.set(m, false);
            idx += 1;
        }
        env.storage().persistent().set(&DataKey::PaidStatus, &reset_paid);

        let next_rotation = if rotation_index + 1 >= members.len() {
            0
        } else {
            rotation_index + 1
        };
        env.storage().persistent().set(&DataKey::RotationIndex, &next_rotation);

        let round: u32 = env.storage().persistent().get(&DataKey::Round).unwrap();
        env.storage().persistent().set(&DataKey::Round, &(round + 1));

        env.events()
            .publish((Symbol::new(env, "released"),), (recipient, pool_balance));

        Ok(())
    }
}

#[cfg(test)]
mod test;
