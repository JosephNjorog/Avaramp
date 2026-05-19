# Avaramp — Presentation Slides

## Crypto → Fiat Infrastructure for Africa | Built on Avalanche

---

## SLIDE 1 — Hook / Opening

**"What if a crypto holder in London could pay a business in Nairobi — instantly, with no exchange accounts, no waiting, no friction?"**

- 40M+ crypto holders in Africa. Merchants want local currency.
- The gap: you have USDC, the merchant needs KES — no simple bridge exists
- Banks take 3 days. CEX withdrawals require KYC + waiting. M-Pesa doesn't accept USDC.
- **Avaramp closes that gap in under 3 minutes**

---

## SLIDE 2 — The Problem

**The crypto-to-local-currency corridor is broken**

| Pain Point | Reality Today |
|---|---|
| Crypto holder wants to pay a merchant | Must go CEX → bank → M-Pesa → merchant |
| Merchant wants crypto customers | Can't accept USDC without technical setup |
| Cross-border freelancer payment | 3–5 days, 5–8% fees on both ends |
| NGO receiving donor USDC | Manual OTC, opaque rates, slow settlement |

> Every step in that chain costs money and time. Avaramp collapses it into one.

---

## SLIDE 3 — What Is Avaramp?

**Avaramp is payment infrastructure that lets crypto holders pay merchants who receive local mobile money — automatically.**

### The One-Liner

> "Send USDC on Avalanche, merchant receives KES on M-Pesa — no CEX, no waiting."

### What It Is NOT

- Not a wallet
- Not a DEX
- Not another crypto exchange

### What It IS

- A payments API and hosted checkout
- Middleware between Avalanche USDC and African mobile money
- Infrastructure any fintech can embed

---

## SLIDE 4 — The Correct Flow (End to End)

```
CUSTOMER (crypto holder)         AVARAMP                    MERCHANT
        │                            │                          │
  Has USDC on Avalanche              │                          │
        │                            │                          │
        │  Merchant shares           │                          │
        │  /pay/[id] link ◄──────────┤◄── Creates payment link  │
        │                            │    "5000 KES = 19.23 USDC"
        │                            │                          │
        │  Opens link                │                          │
        │  Sees: Send 19.23 USDC     │                          │
        │  to Avalanche address      │                          │
        │  (QR code / WalletConnect) │                          │
        │                            │                          │
        ├── Sends USDC on Avalanche ►│                          │
        │                            │                          │
        │         Glacier API detects on-chain deposit          │
        │                            │→ Payment CONFIRMED        │
        │                            │                          │
        │                            ├── Paystack Transfer ────►│
        │                            │   5000 KES sent to       │
        │                            │   merchant M-Pesa / till │
        │                            │                          │
        │         Paystack webhook: transfer.success            │
        │                            │→ Payment SETTLED          │
        │                            │                          │
  Customer page ✅                   │         Merchant gets    │
  shows complete                     │         KES ✅           │
```

**3 actors. 1 flow. Under 3 minutes.**

---

## SLIDE 5 — Why Avalanche?

**The chain matters. Here is why we chose Avalanche.**

| Property | Why It Matters |
|---|---|
| Sub-second finality | Mobile money is instant — our on-ramp must match |
| Fees < $0.01 | Sending $50 of USDC can't cost $5 in gas |
| EVM-compatible | Standard tooling; any Ethereum wallet works |
| USDC native | Circle's USDC is first-class on Avalanche — no bridging |
| Avalanche Subnet support | Future: dedicated AvaRamp subnet for compliance |

> "Why does finality speed matter? Because a Nairobi merchant can't explain 'wait 12 confirmations' to a customer."

---

## SLIDE 6 — Why Stablecoins? Why USDC?

**Stablecoins are the right unit of account for this corridor**

### For the Customer (Sender)

- Holds USDC as an inflation hedge — doesn't want volatile crypto
- Wants to send exact value — USDC is dollar-pegged, no price risk during the transaction

### For Avaramp (the Bridge)

- Known input value = clean FX calculation
- USDC on Avalanche: audited reserves (Circle), deep liquidity, instant settlement

### For the Merchant (Receiver)

- Gets local currency — KES, NGN, GHS, TZS, UGX
- No crypto exposure, no wallets to manage
- Receives on mobile money they already use daily

---

## SLIDE 7 — The FX Layer

**How does USDC → KES conversion work?**

```
Customer sends: 19.23 USDC
        │
        ▼
AvaRamp FX Service (live rates via oracle)
   1 USDC = 130 KES  →  19.23 × 130 = 2,500 KES
        │
        ▼  Avaramp fee: 1.5%  →  deduct 37.5 KES
        │
        ▼
Paystack Transfer: 2,462.5 KES → Merchant M-Pesa
```

- FX rate locked at payment creation — no slippage risk for merchant
- 1.5% platform fee deducted before settlement
- Merchant sees the exact net amount on their dashboard

---

## SLIDE 8 — Merchant Experience

**For the merchant, Avaramp is like Stripe — just set it up and get paid**

### Setup (Once)

1. Register and set payout destination (M-Pesa till / paybill / phone number)
2. Choose settlement currency (KES, NGN, GHS, TZS, UGX)
3. Done — no crypto knowledge required

### Per Payment

1. Open dashboard → click "New Payment"
2. Enter amount (e.g. 5,000 KES) + optional reference
3. Get a payment link — share via WhatsApp, SMS, email, or embed on a website
4. Customer pays in USDC → merchant receives mobile money automatically

### Dashboard Shows

- All payments with status (PENDING / CONFIRMED / SETTLED)
- 7-day volume chart
- Analytics summary

---

## SLIDE 9 — Customer Experience

**For the customer (crypto holder), Avaramp is already familiar**

1. Receive payment link: `avaramp.io/pay/abc123`
2. See the amount: **"Send 19.23 USDC on Avalanche C-Chain"**
3. Three ways to pay:
   - **Scan QR code** with any Avalanche wallet app
   - **WalletConnect** — connect MetaMask, Trust Wallet, etc. and sign
   - **Copy address** and send manually from any wallet
4. Page polls automatically — shows confirmation when USDC lands on-chain
5. Done — no account needed, no KYC, just a crypto wallet

---

## SLIDE 10 — Business Model

**Revenue: 1.5% fee on every settled payment**

| Monthly Volume | Monthly Revenue |
|---|---|
| $50K | $750 |
| $500K | $7,500 |
| $5M | $75,000 |
| $50M | $750,000 |

### Unit Economics

- Paystack transfer fee: ~₦50 flat (< $0.05)
- Glacier API: usage-based, negligible at scale
- Avalanche on-chain watching: < $0.01 per payment

**Net margin is very high** — the cost per transaction is nearly zero once infrastructure is in place.

Who pays the fee? Deducted from merchant settlement — invisible to the customer.

---

## SLIDE 11 — Target Market

**Phase 1: East Africa (KES)**

- Kenya — 32M M-Pesa users, among the highest crypto adoption rates globally
- Tanzania, Uganda — Airtel Money, MTN Mobile Money

**Phase 2: West Africa (NGN, GHS)**

- Nigeria — largest crypto volume in Africa by absolute amount
- Ghana — strong stablecoin adoption

### Merchant Verticals

| Vertical | Use Case |
|---|---|
| E-commerce | Accept global crypto customers |
| Freelancers | Receive international USDC client payments |
| Event ticketing | Sell tickets to the diaspora crypto community |
| Cross-border B2B | Pay African suppliers from a USDC treasury |
| NGOs | Convert donor USDC to local field operations cash |

---

## SLIDE 12 — For Developers: The API

**Integrate in 3 API calls**

```bash
# 1. Create payment (merchant backend)
POST /payments
Authorization: Bearer <merchant-jwt>
{
  "amountFiat": "5000",
  "fiatCurrency": "KES",
  "reference": "Order #123"
}
# Returns: { depositAddress, amountUsdc, expiresAt, paymentId }

# 2. Poll status (customer page — no auth required)
GET /payments/:id
# Returns: { status: "PENDING" | "CONFIRMED" | "SETTLED", amountUsdc, fiatAmount }

# 3. Receive webhook on settlement
POST your-webhook-url
{ "event": "payment.settled", "paymentId": "...", "amount": "5000", "currency": "KES" }
```

### Stack

- Backend: Express + TypeScript + Prisma (PostgreSQL on Neon)
- Queue: BullMQ + Redis (deposit watching, settlement, webhook delivery)
- Chain: Avalanche C-Chain via Glacier API
- Settlement: Paystack Transfers API (KES/NGN/GHS/TZS/UGX)

---

## SLIDE 13 — Live Demo

**What we are showing right now:**

1. **Merchant Settings** — Payout configured to M-Pesa till number (KES)
2. **Dashboard → New Payment** — Enter 500 KES → Get USDC deposit address
3. **Customer page** `/pay/[id]` — QR code + "Send 3.85 USDC on Avalanche"
4. **After USDC lands** — status flips PENDING → CONFIRMED → SETTLED automatically
5. **Merchant dashboard** — Payment shows SETTLED, fiat amount received

---

## SLIDE 14 — Current State

**What is live today:**

- ✅ Merchant registration and payout configuration
- ✅ Payment link creation with live FX (USDC ↔ KES/NGN/GHS/TZS/UGX)
- ✅ Customer pay page — QR code + WalletConnect + manual send
- ✅ On-chain USDC deposit detection (Avalanche Glacier API)
- ✅ Automatic fiat settlement via Paystack Transfers
- ✅ Multi-currency payout (M-Pesa personal, M-Pesa till, Paybill, Airtel, MTN)
- ✅ Merchant dashboard with analytics and payment history
- ✅ Admin panel — fee tracking, merchant management, volume stats
- ✅ Webhook delivery system with automatic retry
- ✅ Idempotent payment creation (API-safe)

---

## SLIDE 15 — The Bigger Vision

**Avaramp is rails, not a product**

Today: **USDC on Avalanche → mobile money in Africa**

Tomorrow:

- Any stablecoin (USDT, EURC) → any local currency
- Any EVM chain → any mobile money network globally
- Merchant plugin for Shopify and WooCommerce
- Subscription billing in USDC settled daily in local currency
- B2B payroll: pay African staff from a USDC multi-sig

The moat is not the code — it is the settlement network relationships and the compliance layer.

> "Every payment rail that matters today started as infrastructure nobody else wanted to build."

---

## SLIDE 16 — Why Now

- **Regulation is clarifying** — Kenya VASP framework 2024, Nigeria SEC crypto rules, Ghana BSAG
- **Paystack has 200K+ merchants** — distribution exists, we just need to reach it
- **Avalanche Foundation is active in Africa** — ecosystem grants available
- **Stablecoin volume in Africa up 40% YoY** (Chainalysis 2024)
- **Diaspora remittances = $100B+/year to Africa** — current cost: 6–9%; we can do 1.5%

---

## SLIDE 17 — Call to Action

**For builders in this call:**

- **Test the flow tonight** — create a payment link with your Paystack test keys, send yourself USDC on Avalanche testnet
- **Build on the API** — escrow, subscriptions, bulk payroll — all possible on these rails
- **Connect** — if you have merchant distribution or a fintech problem that needs this corridor, let's talk

### The Technical Moat

- Blockchain deposit watching at scale (Glacier API + BullMQ)
- FX oracle with locked rates at payment creation
- Paystack settlement with automatic recipient creation
- All wired together into a 3-minute end-to-end flow

> "The best payment infrastructure is invisible. Your customer sends crypto. Your merchant gets paid. Nobody had to understand why."

---

## Quick Reference

| Property | Value |
|---|---|
| Customer pays in | USDC (Avalanche C-Chain) |
| Merchant receives in | KES / NGN / GHS / TZS / UGX |
| Settlement method | Paystack Transfer → M-Pesa / till / paybill |
| Settlement time | Under 3 minutes |
| Platform fee | 1.5% |
| Payment expiry | 30 minutes |
| FX rate lock | At payment creation |
| Chain | Avalanche C-Chain |
| On-chain detection | Glacier API + BullMQ watcher |
