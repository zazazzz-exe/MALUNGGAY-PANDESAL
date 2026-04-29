# Hearth — App

> **Keep the fire going, from anywhere.**

Hearth is a steady, on-chain way to support the people who matter — built on Stellar, secured by Soroban. This subproject contains the React frontend, the optional Express backend for shared Hearth metadata, and references to the Rust contract at `../contract/`.

## Project Structure

```text
hearth/
  frontend/
    src/
      components/
      hooks/
      pages/
      services/
      store/
    public/Hearth_LogoPure.png
    package.json
  backend/
    server.js
    data/
      groups.json
    package.json
../contract/                    # Soroban Rust contract (crate: "hearth")
  src/
    lib.rs                      # struct Hearth + impl
    test.rs
  Cargo.toml
```

## Environment Variables (Frontend)

Create `frontend/.env` based on `frontend/.env.example`:

```env
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_CONTRACT_ID=CDVBVFHHBKV2NKOLMM3BCHJQTEIFBXJZ2DMH7SMT22RI3W3GHZJOBM62
VITE_USDC_ISSUER=<testnet_usdc_issuer>
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_GROUPS_API_BASE_URL=http://localhost:4000
```

`VITE_GROUPS_API_BASE_URL` enables the shared-Hearth backend so kindled Hearths appear for all users.

## Shared Hearths Backend

Start the backend before the frontend:

```bash
cd backend
npm install
npm run dev
```

Endpoints (paths kept stable for back-compat with the deployed contract&rsquo;s API surface):

- `GET /groups`
- `POST /groups`
- `POST /groups/:id/join`

## Contract Build and Deployment

Run from the **repo root&rsquo;s** `contract/` directory.

1. Build wasm:

```bash
cd ../contract
cargo build --target wasm32-unknown-unknown --release
```

2. Deploy contract:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/hearth.wasm \
  --source <SECRET_KEY> --network testnet
```

3. Initialize the Hearth (public function names unchanged for compatibility):

```bash
stellar contract invoke --id <CONTRACT_ID> --source <SECRET_KEY> --network testnet \
  -- initialize \
  --admin <ADMIN_ADDRESS> \
  --token_address <USDC_CONTRACT> \
  --contribution_amount 10000000 \
  --rotation_interval_days 7
```

4. Start the frontend:

```bash
cd ../hearth/frontend
npm install && npm run dev
```

## Sample CLI Calls

The deployed contract still uses its original public function names (`join_group`, `contribute`, `release`, `get_group_state`, `get_member_info`). In Hearth&rsquo;s vocabulary those map to **Join the Hearth**, **Tend**, **Send Warmth**, **Get Hearth State**, and **Get Keeper Info**.

```bash
# Join the Hearth (Keeper joins)
stellar contract invoke --id <CONTRACT_ID> --source <KEEPER_SECRET> --network testnet \
  -- join_group --member_address <KEEPER_ADDR>

# Tend (contribute USDC for this Season)
stellar contract invoke --id <CONTRACT_ID> --source <KEEPER_SECRET> --network testnet \
  -- contribute --member_address <KEEPER_ADDR>

# Send Warmth (admin manually triggers; auto-fires when all Keepers have tended)
stellar contract invoke --id <CONTRACT_ID> --source <ADMIN_SECRET> --network testnet \
  -- release

# Read Hearth state
stellar contract invoke --id <CONTRACT_ID> --source <ANY_SECRET> --network testnet \
  -- get_group_state

# Read a single Keeper&rsquo;s metrics
stellar contract invoke --id <CONTRACT_ID> --source <ANY_SECRET> --network testnet \
  -- get_member_info --address <KEEPER_ADDR>
```

## Frontend Features

- Wallet connection and signing via Freighter
- Testnet enforcement and network badge
- Your Hearths, Kindle a Hearth, Hearth Detail, and Profile pages
- Tending action flow with transaction toast and explorer link
- Soroban service helpers for invoke / read / account balance
