-- ============================================================
-- AvaRamp — Migration 001: Enums & Users
-- Run this first in your Neon SQL editor
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (available by default on Neon)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'SETTLED',
    'REFUNDED',
    'EXPIRED',
    'FAILED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "KycStatus" AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Users ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "User" (
  "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "email"        TEXT        NOT NULL,
  "phone"        TEXT,
  "passwordHash" TEXT,
  "kycStatus"    "KycStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User" ("email");

-- Auto-update updatedAt on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "User_updatedAt_trigger" ON "User";
CREATE TRIGGER "User_updatedAt_trigger"
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify
SELECT 'Enums and User table created successfully' AS status;
