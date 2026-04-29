# Hearth

> **Keep the fire going, from anywhere.**

<p align="center">
   <img src="./hearth/frontend/public/Hearth_LogoPure.png" alt="Hearth logo" width="220" />
</p>

![HEARTH](https://img.shields.io/badge/HEARTH-E8743C?style=for-the-badge&labelColor=3A2418&color=E8743C)
![STELLAR](https://img.shields.io/badge/%E2%9C%94%20STELLAR-5B3D2D?style=for-the-badge&labelColor=5B3D2D&color=5B3D2D)
![TESTNET](https://img.shields.io/badge/TESTNET-FFC97A?style=for-the-badge&labelColor=3A2418&color=FFC97A)
![SOROBAN](https://img.shields.io/badge/SOROBAN-3A2418?style=for-the-badge&labelColor=3A2418&color=3A2418)
![NON-CUSTODIAL](https://img.shields.io/badge/NON--CUSTODIAL-B85525?style=for-the-badge&labelColor=B85525&color=B85525)

**Stellar Testnet** · **Soroban** · **Vite** · **React** · **Freighter**

**Hearth** is a steady, on-chain way to support the people who matter — your kids, your parents, anyone who depends on you. Set it once. They&rsquo;re taken care of.

A Hearth is a circle of trust. Keepers tend the Hearth each Season, and warmth flows on schedule to the Kin who needs it. The Soroban smart contract holds the funds, runs the rotation, and releases the warmth — so trust lives in the code, not in any one person.

---

## Why Hearth

Sending support across distance is fragile. Reminders get missed. Money sits in a sibling&rsquo;s account "for safekeeping." A relative forgets whose turn it is. The intent is warm; the mechanics are stressful.

Hearth keeps the warmth, removes the stress. You decide who, how much, and how often. The contract does the rest, on Stellar&rsquo;s low-fee, fast-settlement rails. Anyone in the family can verify what happened.

**What you get**

- **Quiet predictability** — once a Hearth is kindled, warmth flows on schedule.
- **Wallet-native** — Freighter signs everything; private keys never leave the browser.
- **Verifiable** — every Tending and every Warmth payout is on Stellar.

## Concept vocabulary

| Brand word | Means |
| --- | --- |
| **Hearth** | A pool of support; a circle of Keepers. |
| **Keeper** | Someone who tends the Hearth (funds it). |
| **Kin** | Whoever the warmth is flowing to this Season. |
| **Kindle** | Create a new Hearth. |
| **Tend** | Add your contribution this Season. |
| **Warmth** | The payout — what flows to the Kin. |
| **Season** | One round of the rotation. |

## How it works (simplified)

1. **Kindle a Hearth** — choose Keepers (by wallet), the tending amount, and the Season length.
2. **Keepers tend** — each Season, every Keeper sends their tending in USDC. Freighter signs.
3. **Warmth flows** — once everyone has tended, the contract sends the Hearth balance to the next Kin in the rotation.
4. **Season advances** — the rotation moves forward; everyone tends again next Season.

```text
Browser (Vite + React)  ——►  Freighter (sign)
       |
       +——►  Soroban RPC / Horizon  (read + invoke)
       |
       +——►  Optional: GET/POST /hearths, POST /hearths/:id/join  (file-backed groups.json)
```

## Project structure

```text
MALUNGGAY-PANDESAL/              # Repository root (folder name kept for git history)
├─ contract/                      # Soroban Rust contract (lib.rs, tests, snapshots)
│  ├─ Cargo.toml                  # crate name: "hearth"
│  └─ src/
│     ├─ lib.rs                   # struct Hearth + impl
│     └─ test.rs
└─ hearth/
   ├─ backend/                    # Express API for shared Hearth metadata
   │  ├─ server.js
   │  └─ data/groups.json         # endpoint paths still use /groups (compat)
   ├─ frontend/                   # React + Vite + Tailwind
   │  ├─ src/                     # pages, components, hooks, store, services
   │  ├─ public/Hearth_LogoPure.png
   │  └─ .env.example
   └─ README.md                   # Hearth subproject details
```

> The Soroban contract is **deployed on Stellar Testnet**; its public function names (`initialize`, `join_group`, `contribute`, `release`, `get_group_state`, `get_member_info`) are unchanged for compatibility. Only internal Rust struct/comments and the source-side crate name were updated to `hearth` / `Hearth`.

## Architecture

| Layer     | Stack |
|----------|--------|
| Frontend | React, Vite, Tailwind, Zustand, Freighter |
| Backend  | Node.js, Express, CORS, JSON file persistence |
| On-chain | Soroban (Rust) contract, Stellar Testnet |

## Environment variables (frontend)

Copy `hearth/frontend/.env.example` to `hearth/frontend/.env` and set:

- `VITE_SOROBAN_RPC_URL` — Soroban RPC (testnet).
- `VITE_HORIZON_URL` — Horizon (testnet).
- `VITE_CONTRACT_ID` — Your deployed contract ID.
- `VITE_USDC_ISSUER` — Testnet USDC issuer.
- `VITE_NETWORK_PASSPHRASE` — `Test SDF Network ; September 2015`.
- `VITE_GROUPS_API_BASE_URL` — e.g. `http://localhost:4000`.

> The example contract ID in `.env.example` is for development only.

## Local development

**1. Shared Hearths API (optional but recommended)**

```bash
cd hearth/backend
npm install
npm run dev
```

Default: `http://localhost:4000` — `GET /health`, `GET/POST /groups`, `POST /groups/:id/join`.

**2. Frontend**

```bash
cd hearth/frontend
npm install
cp .env.example .env   # then edit
npm run dev
```

**3. Contract**

```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
# Deploy and CLI examples in hearth/README.md
```

## Deploying on Vercel

The Vite app lives at `hearth/frontend`, not the repository root.

1. **Project → Settings → General → Root Directory** → `hearth/frontend`.
2. **Framework Preset:** Vite. **Build Command:** `npm run build`. **Output Directory:** `dist`.
3. Add the `VITE_*` variables from `hearth/frontend/.env.example`.
4. The included `hearth/frontend/vercel.json` adds a SPA rewrite so client routes load `index.html`.

## Privacy & custody

- **Non-custodial** — private keys stay in the browser via Freighter.
- The backend stores only what you write to `groups.json` (Hearth name, public wallet strings, app user IDs).

## Why Stellar & Soroban

- **Fast and cheap** — suited to small, frequent tendings.
- **Soroban** — explicit on-chain logic for the Hearth and rotation.
- **Auditable** — Stellar explorers and contract reads keep families honest with each other.

---

*Built on Stellar. Secured by Soroban. Made with care.*
