import { z } from "zod";
const envSchema = z.object({
  DATABASE_URL:             z.string().min(1),
  REDIS_URL:                z.string().min(1),
  AVALANCHE_RPC_URL:        z.string().url(),
  AVALANCHE_WS_URL:         z.string().optional(),   // optional — used only by legacy WS listener
  GLACIER_API_KEY:          z.string().min(1),
  OPERATOR_PRIVATE_KEY:     z.string().optional(),   // optional — used only for on-chain operator txns
  HD_MNEMONIC:              z.string().min(1),
  PAYMENT_GATEWAY_ADDRESS:  z.string().optional(),
  // Settlement provider (fiat payout + FX rates)
  PRETIUM_API_KEY:          z.string().min(1),
  PRETIUM_BASE_URL:         z.string().url(),
  PRETIUM_SETTLEMENT_ADDRESS: z.string().min(1), // on-chain address swept USDC is sent to before payout
  PRETIUM_WEBHOOK_SECRET:   z.string().optional(),
  PRETIUM_SKIP_SETTLEMENT:  z.string().optional(),
  PUBLIC_BASE_URL:          z.string().url(),
  ENCRYPTION_KEY:           z.string().length(64),
  JWT_SECRET:               z.string().min(32),
  NODE_ENV:                 z.enum(["development", "production", "test"]),
  PORT:                     z.string().default("3000"),
});
export const env = envSchema.parse(process.env);
