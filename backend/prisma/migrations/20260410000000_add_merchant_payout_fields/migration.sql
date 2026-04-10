-- Add Paystack payout fields to Merchant
-- payoutType: "phone" | "till" | "paybill"
-- payoutAccount: phone number, till number, or paybill number
-- payoutAccountRef: paybill account reference (optional)
-- payoutCurrency: KES | NGN | GHS | TZS | UGX

ALTER TABLE "Merchant"
  ADD COLUMN IF NOT EXISTS "payoutType"       TEXT NOT NULL DEFAULT 'till',
  ADD COLUMN IF NOT EXISTS "payoutAccount"    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "payoutAccountRef" TEXT,
  ADD COLUMN IF NOT EXISTS "payoutCurrency"   TEXT NOT NULL DEFAULT 'KES';

-- Back-fill payoutAccount from existing mpesaTill
UPDATE "Merchant" SET "payoutAccount" = "mpesaTill" WHERE "payoutAccount" = '';
