-- ============================================================
-- AvaRamp — Migration 003: Transactions, Ledger & Webhooks
-- Run this AFTER 002_merchants_and_payments.sql
-- ============================================================

-- ── Transactions ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Transaction" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "paymentId"   TEXT        NOT NULL,
  "txHash"      TEXT        NOT NULL,
  "blockNumber" INTEGER     NOT NULL,
  "fromAddress" TEXT        NOT NULL,
  "toAddress"   TEXT        NOT NULL,
  "amount"      TEXT        NOT NULL,
  "token"       TEXT        NOT NULL DEFAULT 'USDC',
  "chainId"     INTEGER     NOT NULL DEFAULT 43114,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Transaction_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "Transaction_txHash_key" UNIQUE ("txHash"),
  CONSTRAINT "Transaction_paymentId_fk" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Transaction_paymentId_idx" ON "Transaction" ("paymentId");
CREATE INDEX IF NOT EXISTS "Transaction_txHash_idx"    ON "Transaction" ("txHash");
CREATE INDEX IF NOT EXISTS "Transaction_chainId_idx"   ON "Transaction" ("chainId");

-- ── Ledger Entries ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "LedgerEntry" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "paymentId" TEXT        NOT NULL,
  "type"      TEXT        NOT NULL,   -- e.g. 'SETTLEMENT', 'FEE', 'REFUND'
  "side"      TEXT        NOT NULL,   -- 'DEBIT' | 'CREDIT'
  "account"   TEXT        NOT NULL,   -- merchant wallet or protocol treasury
  "amount"    TEXT        NOT NULL,   -- human-readable (e.g. "10.50")
  "amountRaw" BIGINT      NOT NULL,   -- raw units (6 decimals for USDC)
  "currency"  TEXT        NOT NULL,   -- 'USDC' | 'KES' | 'NGN' etc.
  "metadata"  JSONB       NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "LedgerEntry_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "LedgerEntry_paymentId_fk" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "LedgerEntry_paymentId_idx" ON "LedgerEntry" ("paymentId");
CREATE INDEX IF NOT EXISTS "LedgerEntry_account_idx"   ON "LedgerEntry" ("account");
CREATE INDEX IF NOT EXISTS "LedgerEntry_type_idx"      ON "LedgerEntry" ("type");
CREATE INDEX IF NOT EXISTS "LedgerEntry_createdAt_idx" ON "LedgerEntry" ("createdAt" DESC);

-- ── Webhook Deliveries ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "WebhookDelivery" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "paymentId" TEXT        NOT NULL,
  "event"     TEXT        NOT NULL,   -- e.g. 'payment.confirmed', 'payment.settled'
  "status"    TEXT        NOT NULL,   -- 'SUCCESS' | 'FAILED' | 'RETRYING'
  "error"     TEXT,
  "sentAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "WebhookDelivery_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "WebhookDelivery_paymentId_fk" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "WebhookDelivery_paymentId_idx" ON "WebhookDelivery" ("paymentId");
CREATE INDEX IF NOT EXISTS "WebhookDelivery_event_idx"     ON "WebhookDelivery" ("event");
CREATE INDEX IF NOT EXISTS "WebhookDelivery_status_idx"    ON "WebhookDelivery" ("status");

-- ── Helpful views ─────────────────────────────────────────────────────────────

-- Quick overview of payment status distribution
CREATE OR REPLACE VIEW "v_payment_summary" AS
SELECT
  m."name"                            AS merchant,
  p."status",
  p."fiatCurrency"                    AS currency,
  COUNT(*)                            AS count,
  SUM(p."fxRate" * CAST(p."amountUsdc" AS NUMERIC)) AS total_fiat_approx
FROM "Payment" p
JOIN "Merchant" m ON m."id" = p."merchantId"
GROUP BY m."name", p."status", p."fiatCurrency";

-- Daily settlement volume per merchant
CREATE OR REPLACE VIEW "v_daily_settlements" AS
SELECT
  DATE_TRUNC('day', p."settledAt") AS day,
  m."name"                         AS merchant,
  p."fiatCurrency"                 AS currency,
  COUNT(*)                         AS payments_settled,
  SUM(CAST(p."fiatAmount" AS NUMERIC)) AS total_fiat
FROM "Payment" p
JOIN "Merchant" m ON m."id" = p."merchantId"
WHERE p."status" = 'SETTLED'
  AND p."settledAt" IS NOT NULL
GROUP BY DATE_TRUNC('day', p."settledAt"), m."name", p."fiatCurrency"
ORDER BY day DESC;

-- Verify everything
SELECT
  tablename,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = t.tablename AND table_schema = 'public') AS column_count
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('User','Merchant','Payment','Transaction','LedgerEntry','WebhookDelivery')
ORDER BY tablename;

SELECT 'All AvaRamp tables created successfully' AS status;
