# AvaRamp

> **Your Launchpad for payment integrations in a snapshot**

AvaRamp is a **crypto-to-fiat payment gateway** built on the **Avalanche C-Chain**. It enables merchants to accept **USDC stablecoin payments** from users and receive settlements directly in local fiat currency — starting with **M-Pesa** for East and West African markets (KES, NGN, GHS, TZS, UGX).

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Smart Contracts](#smart-contracts)
- [Job Queues & Workers](#job-queues--workers)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)

---

## Overview

AvaRamp bridges the gap between decentralized finance and everyday commerce in emerging markets. The core problem it solves: merchants in Africa want to accept payments but their customers may hold USDC on-chain rather than local fiat. AvaRamp handles the full lifecycle:

1. A merchant registers and gets a wallet address.
2. A customer initiates a payment — AvaRamp generates a unique USDC deposit address for that transaction.
3. The customer sends USDC to that address on Avalanche.
4. AvaRamp detects the on-chain deposit, converts to fiat at the live FX rate, and settles to the merchant's M-Pesa till number.
5. The merchant receives a webhook notification and the ledger is updated with full double-entry accounting records.

**Supported fiat settlement currencies:**

| Currency | Country |
|----------|---------|
| KES | Kenya |
| NGN | Nigeria |
| GHS | Ghana |
| TZS | Tanzania |
| UGX | Uganda |

---

## How It Works

```
User                     AvaRamp Backend                  Avalanche C-Chain         M-Pesa
 │                              │                                  │                   │
 │  POST /payments              │                                  │                   │
 │─────────────────────────────>│                                  │                   │
 │                              │  Generate deposit address        │                   │
 │  { depositAddress, amount }  │                                  │                   │
 │<─────────────────────────────│                                  │                   │
 │                              │                                  │                   │
 │  Send USDC to depositAddress │                                  │                   │
 │─────────────────────────────────────────────────────────────>  │                   │
 │                              │                                  │                   │
 │                              │  PaymentWorker polls Glacier API │                   │
 │                              │<─────────────────────────────── │                   │
 │                              │                                  │                   │
 │                              │  Deposit confirmed               │                   │
 │                              │  → FX conversion (USDC → fiat)  │                   │
 │                              │  → Enqueue settlement job        │                   │
 │                              │                                  │                   │
 │                              │  SettlementWorker runs           │                   │
 │                              │─────────────────────────────────────────────────>   │
 │                              │                                  │  M-Pesa STK Push  │
 │                              │  Record ledger entries           │                   │
 │                              │  Fire merchant webhook           │                   │
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.4 |
| Runtime | Node.js |
| Framework | Express.js 4.18 |
| Database | PostgreSQL 15 (via Prisma ORM) |
| Cache / Queue | Redis 7 + BullMQ |
| Blockchain | Avalanche C-Chain — ethers.js 6, Glacier API |
| Token | USDC (`0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6C`) |
| Smart Contracts | Solidity 0.8.24 (OpenZeppelin) |
| Authentication | JWT (Bearer tokens) |
| Validation | Zod |
| Encryption | AES-256-GCM (Node.js crypto) |
| Logging | Pino |
| Security Headers | Helmet, CORS, Rate limiting |
| Infrastructure | Docker + Docker Compose |

---

## Architecture

AvaRamp follows a **modular monolith** architecture with clear domain separation. Each domain has its own routes, controller, service, and repository.

```
backend/src/
├── main.ts                  # Entry point — starts server on PORT (default 3000)
├── app.ts                   # Express app setup — middleware, route registration
│
├── config/
│   └── env.config.ts        # Zod-validated environment configuration
│
├── Modules/                 # Domain modules
│   ├── blockchain/
│   │   └── glacier.service.ts     # Avalanche Glacier API — ERC-20 transfer queries
│   ├── merchants/                 # Merchant registration & management
│   ├── Payments/                  # Payment creation & status tracking
│   ├── Settlements/               # Fiat settlement (M-Pesa)
│   ├── users/                     # User accounts & KYC
│   ├── Fx/                        # FX conversion rates (scaffolded)
│   └── Webhooks/                  # Outbound webhook delivery (scaffolded)
│
└── shared/
    ├── database/
    │   ├── prisma.ts              # Prisma client singleton
    │   └── ledger.ts              # Double-entry ledger service
    ├── Middleware/
    │   ├── Auth.ts                # JWT authentication
    │   ├── indempotency.ts        # Idempotency key deduplication
    │   ├── rateLimit.ts           # Rate limiting (10/min payments, 100/15min global)
    │   └── Validate.ts            # Zod schema validation middleware
    ├── Utils/
    │   ├── Errors.ts              # AppError, NotFoundError, ValidationError, etc.
    │   ├── Logger.ts              # Pino logger (pretty in dev, JSON in prod)
    │   └── Encryption.ts          # AES-256-GCM encrypt/decrypt
    └── queue/
        ├── queues.ts              # BullMQ queue definitions
        └── workers/
            ├── payment.worker.ts  # Polls for on-chain USDC deposits
            ├── settlement.worker.ts # Triggers M-Pesa settlement
            └── Webhook.worker.ts  # Delivers webhooks to merchant URLs
```

### Request Lifecycle

Every authenticated request flows through:

```
Request
  → Helmet (security headers)
  → CORS
  → express.json()
  → authenticate (JWT)       ← skipped for public endpoints
  → idempotency check        ← payment creation only
  → validate (Zod schema)    ← where applicable
  → rate limiter             ← payment creation: 10/min
  → Controller
  → Service
  → Repository (Prisma)
  → Response
```

---

## Database Schema

AvaRamp uses a **double-entry accounting** ledger to ensure financial integrity.

### Core Models

**User**
```
id            UUID (PK)
email         String (unique)
phone         String?
kycStatus     KycStatus (PENDING | VERIFIED | REJECTED)
createdAt     DateTime
updatedAt     DateTime
```

**Merchant**
```
id              UUID (PK)
name            String
email           String (unique)
walletAddress   String (unique)       ← Avalanche wallet address
mpesaTillNumber String?               ← M-Pesa till for settlement
webhookUrl      String?               ← Notified on payment events
webhookSecret   String?               ← HMAC signing secret
feeOverrideBps  Int?                  ← Custom fee in basis points
isActive        Boolean
createdAt       DateTime
updatedAt       DateTime
```

**Payment**
```
id                UUID (PK)
idempotencyKey    String? (unique)    ← Deduplication key
merchantId        UUID (FK → Merchant)
userId            UUID? (FK → User)
amountUsdc        Decimal             ← USDC amount expected
amountFiat        Decimal             ← Fiat equivalent
fiatCurrency      String              ← KES | NGN | GHS | TZS | UGX
depositAddress    String              ← Unique USDC deposit address
depositKey        String              ← Encrypted private key for deposit address
status            PaymentStatus       ← PENDING → CONFIRMED → SETTLED
expiresAt         DateTime
confirmedTxHash   String?
confirmedAt       DateTime?
onChainAmount     Decimal?
fxRate            Decimal?
mpesaReceiptId    String?
settledAt         DateTime?
metadata          Json?
```

**Transaction** — On-chain transaction records
```
id          UUID (PK)
paymentId   UUID (FK → Payment)
txHash      String (unique)
blockNumber Int
fromAddress String
toAddress   String
amount      Decimal
token       String (default: USDC)
chainId     Int (default: 43114)
```

**LedgerEntry** — Double-entry accounting
```
id        UUID (PK)
paymentId UUID (FK → Payment)
type      LedgerEntryType           ← USDC_RECEIVED | FX_CONVERSION | PROTOCOL_FEE
                                       MPESA_SETTLED | REFUND_ISSUED | MERCHANT_WITHDRAWAL
side      LedgerSide                ← DEBIT | CREDIT
account   String                    ← "merchant:{uuid}" | "treasury" | "escrow"
amount    String
amountRaw BigInt
currency  String
metadata  Json?
```

**WebhookDelivery** — Tracks outbound webhook attempts
```
id        UUID (PK)
paymentId UUID (FK → Payment)
event     String
status    String
error     String?
sentAt    DateTime?
```

---

## API Reference

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/payments` | Required | Create a new payment request |
| `GET` | `/payments/:id` | Required | Get payment status and details |

**POST /payments — Request body:**
```json
{
  "merchantId": "uuid",
  "userId": "uuid",
  "amountUsdc": 10.50,
  "amountFiat": 1350.00,
  "fiatCurrency": "KES"
}
```

**POST /payments — Response:**
```json
{
  "id": "uuid",
  "depositAddress": "0x...",
  "amountUsdc": 10.50,
  "expiresAt": "2026-03-29T12:00:00Z",
  "network": "avalanche",
  "token": "USDC"
}
```

### Merchants

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/merchants` | Required | Register a new merchant |
| `GET` | `/merchants/:id` | Required | Get merchant details |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/users` | Public | Register a new user |
| `GET` | `/users/:id` | Required | Get user details |

### Settlements

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/settlements` | Required | Manually trigger settlement |
| `GET` | `/settlements/:id` | Required | Get settlement details |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | Public | Service health check |

---

## Smart Contracts

### PaymentGateway.sol (`Contracts/Core/`)

Deployed on **Avalanche C-Chain** (chainId: 43114).

**Core functions:**

| Function | Role | Description |
|----------|------|-------------|
| `deposit(paymentId, merchant, amount)` | User | Deposit USDC to pay a merchant |
| `markSettled(paymentId)` | OPERATOR_ROLE | Mark payment settled after M-Pesa confirmation |
| `refund(paymentId)` | OPERATOR_ROLE | Refund USDC to original payer |
| `registerMerchant(merchant)` | OPERATOR_ROLE | Whitelist a new merchant |
| `merchantWithdraw(amount)` | MERCHANT_ROLE | Merchant withdraws USDC balance |
| `treasuryWithdraw(amount)` | TREASURY_ROLE | Protocol fee withdrawal |
| `setProtocolFee(newBps)` | DEFAULT_ADMIN | Update protocol fee (max 5%) |
| `setTreasury(newTreasury)` | DEFAULT_ADMIN | Update treasury address |

**Access control roles:**
- `DEFAULT_ADMIN_ROLE` — Protocol owner
- `TREASURY_ROLE` — Can withdraw protocol fees
- `OPERATOR_ROLE` — Can register merchants, mark settled, issue refunds
- `MERCHANT_ROLE` — Can withdraw merchant balance

**Security features:**
- `ReentrancyGuard` — Prevents reentrancy attacks
- `Pausable` — Emergency stop capability
- `SafeERC20` — Safe token transfer patterns
- `AccessControl` — Role-based permissions
- `processedIds` mapping — Prevents duplicate payment processing

---

## Job Queues & Workers

AvaRamp uses **BullMQ** backed by Redis for all asynchronous work.

### Queues

| Queue | Purpose |
|-------|---------|
| `paymentQueue` | Monitor on-chain deposits |
| `settlementQueue` | Process M-Pesa settlements |
| `webhookQueue` | Deliver merchant webhook events |

### Workers

**PaymentWorker** (concurrency: 20)
- Job: `watch-deposit`
- Polls Avalanche Glacier API for USDC transfers to the payment's deposit address
- On confirmed deposit: enqueues a `settle-payment` job
- On expiry: marks payment as `EXPIRED`

**SettlementWorker** (concurrency: 5, rate: 10/sec)
- Job: `settle-payment`
- Calls the settlement service to execute M-Pesa STK push
- Records ledger entries on completion

**WebhookWorker** (concurrency: 10, rate: 50/sec)
- Delivers `payment.confirmed`, `payment.settled`, and `payment.failed` events to merchant webhook URLs

---

## Security

| Mechanism | Implementation |
|-----------|---------------|
| Authentication | JWT Bearer tokens (HS256, min 32-char secret) |
| Encryption at rest | AES-256-GCM for deposit private keys |
| HTTP security | Helmet (XSS, clickjacking, HSTS, etc.) |
| Request deduplication | Idempotency keys on payment creation |
| Rate limiting | 10 req/min per IP on `/payments`, 100 req/15min globally |
| Input validation | Zod schemas on all request bodies |
| Webhook integrity | HMAC-signed webhook payloads with per-merchant secret |
| Smart contract safety | ReentrancyGuard, Pausable, SafeERC20, AccessControl |

---

## Environment Variables

Create a `.env` file in `backend/` with the following:

```env
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://avaramp:avaramp_secret@localhost:5432/avaramp

# Redis
REDIS_URL=redis://localhost:6379

# Avalanche
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_WS_URL=wss://api.avax.network/ext/bc/C/ws
GLACIER_API_KEY=your_glacier_api_key

# Wallet / Keys
OPERATOR_PRIVATE_KEY=your_operator_private_key
HD_MNEMONIC=your_12_or_24_word_mnemonic

# Contracts
PAYMENT_GATEWAY_ADDRESS=0x...deployed_contract_address

# M-Pesa
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret

# Security
ENCRYPTION_KEY=64_char_hex_string_for_aes256gcm
JWT_SECRET=minimum_32_character_jwt_signing_secret
```

---

## Running Locally

### Prerequisites
- Docker & Docker Compose
- Node.js 20+

### 1. Start infrastructure

```bash
docker-compose up -d postgres redis
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Run database migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### 5. Run the full stack with Docker

```bash
docker-compose up --build
```

---

## Project Structure

```
Avaramp/
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.ts
│   │   ├── config/
│   │   ├── Modules/
│   │   └── shared/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
├── Contracts/
│   └── Core/
│       └── PaymentGateway.sol
├── docker-compose.yml
└── README.md
```

---

## License

Private — All rights reserved.
