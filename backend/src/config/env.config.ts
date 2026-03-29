import { z } from "zod";
const envSchema = z.object({
  DATABASE_URL:             z.string().min(1),
  REDIS_URL:                z.string().min(1),
  AVALANCHE_RPC_URL:        z.string().url(),
  AVALANCHE_WS_URL:         z.string().min(1),
  GLACIER_API_KEY:          z.string().min(1),
  OPERATOR_PRIVATE_KEY:     z.string().min(1),
  HD_MNEMONIC:              z.string().min(1),
  PAYMENT_GATEWAY_ADDRESS:  z.string().optional(),
  MPESA_CONSUMER_KEY:         z.string().min(1),
  MPESA_CONSUMER_SECRET:      z.string().min(1),
  MPESA_SHORTCODE:            z.string().min(1),
  MPESA_INITIATOR_NAME:       z.string().min(1),
  MPESA_SECURITY_CREDENTIAL:  z.string().min(1),
  MPESA_B2C_RESULT_URL:       z.string().url(),
  MPESA_B2C_TIMEOUT_URL:      z.string().url(),
  ENCRYPTION_KEY:           z.string().length(64),
  JWT_SECRET:               z.string().min(32),
  NODE_ENV:                 z.enum(["development", "production", "test"]),
  PORT:                     z.string().default("3000"),
});
export const env = envSchema.parse(process.env);
