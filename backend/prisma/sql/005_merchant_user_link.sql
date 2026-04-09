-- Migration 005: Link Merchant to User
-- Run this in your Neon console (SQL editor) before deploying the backend.

ALTER TABLE "Merchant"
  ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Unique constraint so each user owns at most one merchant profile
ALTER TABLE "Merchant"
  DROP CONSTRAINT IF EXISTS "Merchant_userId_key";

ALTER TABLE "Merchant"
  ADD CONSTRAINT "Merchant_userId_key" UNIQUE ("userId");

-- Foreign key: Merchant.userId → User.id (SET NULL on delete)
ALTER TABLE "Merchant"
  DROP CONSTRAINT IF EXISTS "Merchant_userId_fkey";

ALTER TABLE "Merchant"
  ADD CONSTRAINT "Merchant_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL;
