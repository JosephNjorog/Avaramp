-- ============================================================
-- AvaRamp — Migration 004: Legal Consent Records
-- Run this in your Neon SQL editor
-- Tracks every explicit legal acceptance for audit purposes
-- ============================================================

CREATE TABLE IF NOT EXISTS "ConsentRecord" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "userId"      TEXT        NOT NULL,
  "policyType"  TEXT        NOT NULL,   -- 'TERMS' | 'PRIVACY' | 'COOKIES'
  "version"     TEXT        NOT NULL,   -- e.g. '2026-04-10'
  "acceptedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress"   TEXT,
  "userAgent"   TEXT,

  CONSTRAINT "ConsentRecord_pkey"    PRIMARY KEY ("id"),
  CONSTRAINT "ConsentRecord_user_fk" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ConsentRecord_userId_idx"      ON "ConsentRecord" ("userId");
CREATE INDEX IF NOT EXISTS "ConsentRecord_policyType_idx"  ON "ConsentRecord" ("policyType");
CREATE INDEX IF NOT EXISTS "ConsentRecord_acceptedAt_idx"  ON "ConsentRecord" ("acceptedAt" DESC);

-- Quick view for admin export
CREATE OR REPLACE VIEW "v_consent_audit" AS
SELECT
  cr."id",
  u."email",
  u."phone",
  cr."policyType",
  cr."version",
  cr."acceptedAt",
  cr."ipAddress",
  cr."userAgent"
FROM "ConsentRecord" cr
JOIN "User" u ON u."id" = cr."userId"
ORDER BY cr."acceptedAt" DESC;

SELECT 'ConsentRecord table created successfully' AS status;
