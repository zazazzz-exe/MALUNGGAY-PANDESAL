#![cfg(test)]

use soroban_sdk::{testutils::Address as _, Address, Env};

use malunggay_pandesal::{MalunggayPandesal, MalunggayPandesalClient};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MalunggayPandesal);
    let client = MalunggayPandesalClient::new(&env, &contract_id);

    let owner = Address::generate(&env);

    client.initialize(&owner);

    assert_eq!(client.get_owner(), owner);
    assert_eq!(client.get_total(), 0);
}

#[test]
fn test_contribute() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MalunggayPandesal);
    let client = MalunggayPandesalClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&owner);

    client.contribute(&user, &100);

    assert_eq!(client.get_total(), 100);
    assert_eq!(client.get_contribution(&user), 100);
}

#[test]
fn test_bake() {
    let env = Env::default();
    let contract_id = env.register_contract(None, MalunggayPandesal);
    let client = MalunggayPandesalClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&owner);

    client.contribute(&user, &200);

    client.bake(&50);

    assert_eq!(client.get_total(), 150);
}
