# PaluwagaChain

PaluwagaChain is a full-stack Web3 dApp for rotating savings (paluwagan) on Stellar Soroban.
Members contribute USDC each round, and the contract automatically releases the full pooled amount
based on rotation order.

## Project Structure

```text
paluwaga-chain/
  contracts/
    paluwaga_chain/
      src/
        lib.rs
        test.rs
      Cargo.toml
  frontend/
    src/
      components/
      hooks/
      pages/
      services/
      store/
    package.json
```

## Environment Variables (Frontend)

Create `frontend/.env` based on `frontend/.env.example`:

```env
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_CONTRACT_ID=CDVBVFHHBKV2NKOLMM3BCHJQTEIFBXJZ2DMH7SMT22RI3W3GHZJOBM62
VITE_USDC_ISSUER=<testnet_usdc_issuer>
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

## Contract Build and Deployment

1. Build wasm:

```bash
cargo build --target wasm32-unknown-unknown --release
```

2. Deploy contract:

```bash
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/paluwaga_chain.wasm --source <SECRET_KEY> --network testnet
```

3. Initialize contract:

```bash
stellar contract invoke --id <CONTRACT_ID> --source <SECRET_KEY> --network testnet -- initialize --admin <ADMIN_ADDRESS> --token_address <USDC_CONTRACT> --contribution_amount 10000000 --rotation_interval_days 7
```

4. Start frontend:

```bash
npm install && npm run dev
```

## Sample CLI Calls for Contract Functions

Initialize:

```bash
stellar contract invoke --id <CONTRACT_ID> --source <ADMIN_SECRET> --network testnet -- initialize --admin GADMINADDRESS123 --token_address CUSDCADDRESS123 --contribution_amount 10000000 --rotation_interval_days 7
```

Join group:

```bash
stellar contract invoke --id <CONTRACT_ID> --source <MEMBER_SECRET> --network testnet -- join_group --member_address GMEMBERADDR123
```

Contribute:

```bash
stellar contract invoke --id <CONTRACT_ID> --source <MEMBER_SECRET> --network testnet -- contribute --member_address GMEMBERADDR123
```

Release:

```bash
stellar contract invoke --id <CONTRACT_ID> --source <ADMIN_SECRET> --network testnet -- release
```

Get group state:

```bash
stellar contract invoke --id <CONTRACT_ID> --source <ANY_SECRET> --network testnet -- get_group_state
```

Get member info:

```bash
stellar contract invoke --id <CONTRACT_ID> --source <ANY_SECRET> --network testnet -- get_member_info --address GMEMBERADDR123
```

## Frontend Features Included

- Wallet connection and signing via Freighter
- Testnet enforcement and network badge
- Dashboard, group creation, group detail, and profile pages
- Contribution action flow with transaction toast and explorer link
- Soroban service helpers for invoke/read/account balance
