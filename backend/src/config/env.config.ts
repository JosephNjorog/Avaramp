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
  // Paystack (collection + settlement provider)
  PAYSTACK_SECRET_KEY:      z.string().min(1),
  PAYSTACK_PUBLIC_KEY:      z.string().optional(),
  PAYSTACK_WEBHOOK_URL:     z.string().optional(),
  PAYSTACK_SKIP_SETTLEMENT: z.string().optional(),
  FRONTEND_URL:             z.string().optional(),
  ENCRYPTION_KEY:           z.string().length(64),
  JWT_SECRET:               z.string().min(32),
  NODE_ENV:                 z.enum(["development", "production", "test"]),
  PORT:                     z.string().default("3000"),
});
export const env = envSchema.parse(process.env);
