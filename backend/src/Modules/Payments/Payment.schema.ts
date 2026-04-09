import { z } from "zod";

// Accept amount as either a string ("10.50") or a number (10.50)
const amountField = z.union([
  z.string().min(1),
  z.number().positive().transform(String),
]);

export const createPaymentSchema = z.object({
  // merchantId is optional — controller injects it from auth token
  merchantId:   z.string().optional(),
  // amountFiat: merchant enters the fiat amount they want to receive (e.g. 5000 KES)
  // amountUsdc: legacy — direct USDC amount (kept for API compatibility)
  amountFiat:   amountField.optional(),
  amountUsdc:   amountField.optional(),
  amount:       amountField.optional(),  // alias for amountFiat
  fiatCurrency: z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]).optional(),
  currency:     z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]).optional(),
  phone:        z.string().optional(),
  reference:    z.string().optional(),
  userId:       z.string().uuid().optional(),
  metadata:     z.record(z.unknown()).optional(),
}).transform((data) => ({
  merchantId:   data.merchantId,
  // If amountFiat/amount is provided, the service will derive amountUsdc from the FX rate.
  // amountFiat takes precedence; amountUsdc is the fallback for direct USDC input.
  amountFiat:   data.amountFiat ?? data.amount,
  amountUsdc:   data.amountUsdc,
  fiatCurrency: data.fiatCurrency ?? data.currency ?? "KES",
  phone:        data.phone,
  reference:    data.reference,
  userId:       data.userId,
  metadata:     data.metadata,
}));
