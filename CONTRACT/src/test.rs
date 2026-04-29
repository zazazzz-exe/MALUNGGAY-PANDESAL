#![cfg(test)]

extern crate std;

use soroban_sdk::{testutils::Address as _, token, Address, Env};

use crate::{Error, Hearth, HearthClient};

fn setup() -> (
    Env,
    HearthClient<'static>,
    Address,
    token::Client<'static>,
    token::StellarAssetClient<'static>,
    Address,
    Address,
    Address,
) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let member1 = Address::generate(&env);
    let member2 = Address::generate(&env);
    let member3 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();

    let token_client = token::Client::new(&env, &token_address);
    let token_admin_client = token::StellarAssetClient::new(&env, &token_address);

    let contract_id = env.register_contract(None, Hearth);
    let client = HearthClient::new(&env, &contract_id);

    client.initialize(&admin, &token_address, &10_000_000i128, &7u32);

    token_admin_client.mint(&member1, &100_000_000i128);
    token_admin_client.mint(&member2, &100_000_000i128);
    token_admin_client.mint(&member3, &100_000_000i128);

    (
        env,
        client,
        admin,
        token_client,
        token_admin_client,
        member1,
        member2,
        member3,
    )
}

#[test]
fn test_happy_path_release_and_rotation_advance() {
    let (_env, client, _admin, token_client, _token_admin, member1, member2, member3) = setup();

    client.join_group(&member1);
    client.join_group(&member2);
    client.join_group(&member3);

    client.contribute(&member1);
    client.contribute(&member2);
    client.contribute(&member3);

    let state = client.get_group_state();
    assert_eq!(state.round, 2);
    assert_eq!(state.rotation_index, 1);
    assert_eq!(state.next_recipient, member2);

    let member1_balance = token_client.balance(&member1);
    assert_eq!(member1_balance, 120_000_000i128);
}

#[test]
fn test_duplicate_contribution_returns_already_paid() {
    let (_env, client, _admin, _token_client, _token_admin, member1, member2, _member3) = setup();

    client.join_group(&member1);
    client.join_group(&member2);

    client.contribute(&member1);
    let result = client.try_contribute(&member1);

    assert_eq!(result, Err(Ok(Error::AlreadyPaid)));
}

#[test]
fn test_unauthorized_release_before_all_paid_returns_not_all_paid() {
    let (_env, client, _admin, _token_client, _token_admin, member1, member2, _member3) = setup();

    client.join_group(&member1);
    client.join_group(&member2);

    client.contribute(&member1);

    let result = client.try_release();
    assert_eq!(result, Err(Ok(Error::NotAllPaid)));
}

#[test]
fn test_state_verification_after_full_round() {
    let (_env, client, _admin, _token_client, _token_admin, member1, member2, member3) = setup();

    client.join_group(&member1);
    client.join_group(&member2);
    client.join_group(&member3);

    client.contribute(&member1);
    client.contribute(&member2);
    client.contribute(&member3);

    let state = client.get_group_state();
    assert_eq!(state.rotation_index, 1);
    assert_eq!(state.round, 2);
    assert_eq!(state.pool_balance, 0);

    let paid1 = state.paid_status.get(member1).unwrap_or(true);
    let paid2 = state.paid_status.get(member2).unwrap_or(true);
    let paid3 = state.paid_status.get(member3).unwrap_or(true);

    assert!(!paid1);
    assert!(!paid2);
    assert!(!paid3);
}

#[test]
fn test_group_full_after_twenty_members() {
    let (env, client, _admin, _token_client, token_admin, _member1, _member2, _member3) = setup();

    let mut members: std::vec::Vec<Address> = std::vec::Vec::new();
    for _ in 0..21 {
        let member = Address::generate(&env);
        token_admin.mint(&member, &100_000_000i128);
        members.push(member);
    }

    for member in members.iter().take(20) {
        client.join_group(member);
    }

    let result = client.try_join_group(&members[20]);
    assert_eq!(result, Err(Ok(Error::GroupFull)));
}
