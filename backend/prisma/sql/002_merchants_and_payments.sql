-- ============================================================
-- AvaRamp — Migration 002: Merchants & Payments
-- Run this AFTER 001_enums_and_users.sql
-- ============================================================

-- ── Merchants ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Merchant" (
  "id"             TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "name"           TEXT        NOT NULL,
  "email"          TEXT        NOT NULL,
  "walletAddress"  TEXT        NOT NULL,
  "mpesaTill"      TEXT        NOT NULL,
  "webhookUrl"     TEXT,
  "webhookSecret"  TEXT        NOT NULL,
  "feeOverrideBps" INTEGER,
  "isActive"       BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Merchant_email_key"         ON "Merchant" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Merchant_walletAddress_key" ON "Merchant" ("walletAddress");

DROP TRIGGER IF EXISTS "Merchant_updatedAt_trigger" ON "Merchant";
CREATE TRIGGER "Merchant_updatedAt_trigger"
  BEFORE UPDATE ON "Merchant"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Payments ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Payment" (
  "id"              TEXT            NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "idempotencyKey"  TEXT,
  "merchantId"      TEXT            NOT NULL,
  "userId"          TEXT,
  "amountUsdc"      TEXT            NOT NULL,
  "amountFiat"      TEXT            NOT NULL,
  "fiatCurrency"    TEXT            NOT NULL,
  "phone"           TEXT,
  "reference"       TEXT,
  "depositAddress"  TEXT            NOT NULL,
  "depositPk"       TEXT            NOT NULL,
  "status"          "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt"       TIMESTAMPTZ     NOT NULL,
  "confirmedTxHash" TEXT,
  "confirmedAt"     TIMESTAMPTZ,
  "onChainAmount"   TEXT,
  "fxRate"          DOUBLE PRECISION,
  "fiatAmount"      TEXT,
  "mpesaReceiptId"  TEXT,
  "settledAt"       TIMESTAMPTZ,
  "metadata"        JSONB,
  "createdAt"       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT "Payment_pkey"           PRIMARY KEY ("id"),
  CONSTRAINT "Payment_merchantId_fk"  FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT,
  CONSTRAINT "Payment_userId_fk"      FOREIGN KEY ("userId")     REFERENCES "User" ("id")     ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_idempotencyKey_key"  ON "Payment" ("idempotencyKey") WHERE "idempotencyKey" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_depositAddress_key"  ON "Payment" ("depositAddress");
CREATE        INDEX IF NOT EXISTS "Payment_merchantId_idx"      ON "Payment" ("merchantId");
CREATE        INDEX IF NOT EXISTS "Payment_userId_idx"          ON "Payment" ("userId");
CREATE        INDEX IF NOT EXISTS "Payment_status_idx"          ON "Payment" ("status");
CREATE        INDEX IF NOT EXISTS "Payment_expiresAt_idx"       ON "Payment" ("expiresAt");
CREATE        INDEX IF NOT EXISTS "Payment_createdAt_idx"       ON "Payment" ("createdAt" DESC);

DROP TRIGGER IF EXISTS "Payment_updatedAt_trigger" ON "Payment";
CREATE TRIGGER "Payment_updatedAt_trigger"
  BEFORE UPDATE ON "Payment"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify
SELECT 'Merchant and Payment tables created successfully' AS status;
