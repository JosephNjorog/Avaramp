import { z } from "zod";

// Accept amount as either a string ("10.50") or a number (10.50)
const amountField = z.union([
  z.string().min(1),
  z.number().positive().transform(String),
]);

export const createPaymentSchema = z.object({
  // merchantId is optional in the body — the controller injects it from the auth token
  merchantId:   z.string().optional(),
  amountUsdc:   amountField.optional(),
  amount:       amountField.optional(),
  fiatCurrency: z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]).optional(),
  currency:     z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]).optional(),
  phone:        z.string().optional(),
  reference:    z.string().optional(),
  userId:       z.string().uuid().optional(),
  metadata:     z.record(z.unknown()).optional(),
}).transform((data) => ({
  merchantId:   data.merchantId,
  amountUsdc:   data.amountUsdc ?? data.amount ?? "0",
  fiatCurrency: data.fiatCurrency ?? data.currency ?? "KES",
  phone:        data.phone,
  reference:    data.reference,
  userId:       data.userId,
  metadata:     data.metadata,
}));
