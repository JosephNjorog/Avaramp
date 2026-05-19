# Avaramp — Presentation Slides
### Crypto ↔ Fiat Infrastructure for Africa | Built on Avalanche

---

## SLIDE 1 — Hook / Opening

**"What if paying a local business with crypto was as simple as sending an SMS?"**

- Crypto adoption in Africa is booming — but spending it is still broken
- People hold USDC, they want to pay a merchant in Nairobi, Lagos, Accra
- Today: DEX → CEX → bank → wait 3 days → pay
- **Avaramp: one link, one click, settled in minutes**

---

## SLIDE 2 — The Problem We're Solving

**Africa has a crypto-fiat gap**

| The Reality | The Gap |
|---|---|
| 40M+ crypto holders in Africa | Can't spend crypto at local businesses |
| Merchants want stable income | Don't accept USDC / ETH |
| M-Pesa, Airtel Money are universal | No bridge to crypto wallets |
| Stablecoins solve inflation | Off-ramp is expensive and slow |

> *Sending $100 USDC to a Kenyan merchant today costs 3–5% in fees and takes 1–3 business days*

---

## SLIDE 3 — What Is Avaramp?

**Avaramp is a payment infrastructure product that bridges crypto and local payment systems across Africa**

- Merchants generate a payment link in seconds
- Customers pay via **Paystack** (card, mobile money, bank transfer) — familiar UX
- Settlements flow automatically to the merchant's **M-Pesa till / paybill / mobile money**
- Built on **Avalanche** — fast, low-cost, EVM-compatible

**One sentence:** *Stripe for the crypto-fiat corridor in Africa*

---

## SLIDE 4 — How It Works (The Full Flow)

```
MERCHANT                    CUSTOMER                   PAYSTACK / BLOCKCHAIN
   │                            │                              │
   ├─ Creates payment link ──►  │                              │
   │  (amount in KES/NGN/GHS)   │                              │
   │                            │                              │
   │  ◄── Shares /pay/[id] ──►  │                              │
   │                            │                              │
   │                            ├─ Opens link ──────────────►  │
   │                            │  Sees amount in local fiat   │
   │                            │                              │
   │                            ├─ Clicks "Pay with Paystack"  │
   │                            │  ─────────────────────────►  │
   │                            │  Pays by card / M-Pesa /     │
   │                            │  bank transfer               │
   │                            │                              │
   │                            │  ◄── charge.success ────────┤
   │                            │      webhook                 │
   │                            │                              │
   │  ◄── Settlement ──────────────────────────────────────── │
   │  (M-Pesa / till / paybill                                 │
   │   within minutes)                                         │
```

**Steps:**
1. Merchant sets up account → configures payout (till / paybill / phone)
2. Creates a payment link (KES 5,000 for dinner)
3. Shares link via WhatsApp / SMS / email
4. Customer opens link → pays on Paystack (familiar, trusted)
5. Avaramp receives `charge.success` → confirms → triggers settlement
6. Merchant receives mobile money — done

---

## SLIDE 5 — Why Avalanche?

**Avaramp is built on Avalanche C-Chain**

- **Sub-second finality** — settlements don't wait for 12-block confirmations
- **Low fees** — $0.001 per transaction vs $2–10 on Ethereum mainnet
- **EVM-compatible** — standard tooling, easy to integrate
- **Institutional trust** — Avalanche is used by major financial institutions globally
- **USDC native** — Circle's USDC is first-class on Avalanche; no bridging needed

> *Why does this matter for Africa? Mobile money is instant. Blockchain must match that expectation — Avalanche does.*

---

## SLIDE 6 — Why Stablecoins? Why USDC?

**The inflation problem is real**

- KES lost 25% vs USD in 2023
- NGN lost 40% vs USD in 2023
- A merchant holding KES for 30 days loses real value

**USDC as a settlement layer:**
- Merchants can choose when to off-ramp
- Treasury held in USDC = inflation hedge
- USDC on Avalanche = fast, audited, 1:1 USD backing (Circle)
- No exposure to crypto volatility during the payment flow

---

## SLIDE 7 — Business Model

**Revenue: 1.5% platform fee on every settled payment**

| Volume | Monthly Revenue |
|---|---|
| $100K / month | $1,500 |
| $1M / month | $15,000 |
| $10M / month | $150,000 |

**Who pays?** The merchant (deducted from settlement) — just like Stripe/Paystack.

**Why merchants will pay:**
- Paystack's standard fee is 1.5% — Avaramp adds zero extra cost for the customer
- Access to a global crypto customer base they can't reach today
- Instant settlement vs 3-day bank wait times

---

## SLIDE 8 — Target Market

**Phase 1: East Africa (KES)**
- Kenya — 30M+ M-Pesa users, 2.3M crypto holders
- Uganda, Tanzania — mobile money dominant

**Phase 2: West Africa (NGN, GHS)**
- Nigeria — largest crypto market in Africa by volume
- Ghana — strong Cedi/crypto activity

**Merchant verticals:**
- E-commerce stores
- Freelancers / agencies billing international clients
- Event ticketing
- Cross-border B2B payments
- NGOs receiving donor funds in crypto

---

## SLIDE 9 — For Developers: The API

**Integrate Avaramp in 3 API calls**

```bash
# 1. Create a payment link
POST /payments
{
  "amountFiat": "5000",
  "fiatCurrency": "KES",
  "reference": "Order #123"
}
# → returns { authorizationUrl, paymentId }

# 2. Poll payment status
GET /payments/:id
# → { status: "PENDING" | "CONFIRMED" | "SETTLED" }

# 3. Receive webhook on settlement
POST your-webhook-url
{ event: "payment.settled", paymentId, amount, currency }
```

**Also available:**
- Idempotency keys on payment creation
- Webhook delivery with automatic retry
- Full analytics API
- Merchant payout configuration (phone / till / paybill)

---

## SLIDE 10 — Live Demo Flow

**What we'll show:**

1. **Merchant Dashboard** → Settings → Configure payout (M-Pesa till number, KES)
2. **Create Payment** → Enter 500 KES → Get payment link
3. **Customer Page** → `/pay/[id]` → See amount → Click "Pay with Paystack"
4. **Paystack Checkout** → Pay via card/mobile money
5. **Dashboard** → Payment status flips PENDING → CONFIRMED → SETTLED
6. **Admin Dashboard** → See fee collected, total volume

---

## SLIDE 11 — Current State

**What's live today:**

- ✅ Merchant registration + KYC flow
- ✅ Payment link creation (instant, via Paystack)
- ✅ Customer-facing payment page
- ✅ Paystack webhook → confirm → settle
- ✅ Automatic mobile money settlement (M-Pesa, Airtel, MTN, etc.)
- ✅ Multi-currency support (KES, NGN, GHS, TZS, UGX)
- ✅ Merchant dashboard with analytics
- ✅ Admin panel with fee tracking
- ✅ Webhook delivery system for merchant integrations

---

## SLIDE 12 — The Bigger Vision

**Avaramp is infrastructure — not just a product**

- Any fintech can embed our settlement rails via API
- Any crypto wallet can integrate our off-ramp in one endpoint
- Cross-border: a customer in London pays USDC → a merchant in Nairobi gets KES instantly
- B2B: a company pays contractors in multiple African countries from a single USDC wallet

**The north star:** *Make the USDC → local money corridor as fast and cheap as sending a WhatsApp message*

---

## SLIDE 13 — Why Now?

- **Regulatory clarity is improving** — Kenya, Nigeria, Ghana all have crypto frameworks in 2024-2025
- **Paystack has 200K+ merchants** — distribution is already there
- **Avalanche is expanding in emerging markets** — AVAX Foundation has Africa programs
- **Stablecoin volume in Africa grew 40% YoY** (Chainalysis 2024)
- **Mobile money is the default** — no need to educate users; just connect the rails

---

## SLIDE 14 — Call to Action

**For builders in the room:**

- **Test the API** — create a payment in 5 minutes with your Paystack test keys
- **Build on top** — subscription billing, escrow, bulk payments — all possible with these rails
- **Partner** — if you have merchant distribution, we handle the crypto ↔ fiat layer

**Connect:**
- GitHub: foeg-Labs / Avaramp
- Built at the intersection of Avalanche + African mobile money

> *"The best payment infrastructure is invisible. You just get paid."*

---

## QUICK REFERENCE — Key Numbers

| Metric | Value |
|---|---|
| Settlement time | < 3 minutes |
| Platform fee | 1.5% |
| Supported currencies | KES, NGN, GHS, TZS, UGX |
| Payment expiry | 30 minutes |
| Webhook retries | Automatic |
| Blockchain | Avalanche C-Chain |
| Collection | Paystack (card / mobile money / bank) |
| Payout | M-Pesa, Airtel, MTN, bank transfer |
