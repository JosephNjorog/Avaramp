import { z } from "zod";

export const createPaymentSchema = z.object({
  merchantId:  z.string().min(1, "merchantId required"),
  // Accept either amountUsdc (internal) or amount (frontend shorthand)
  amountUsdc:  z.string().optional(),
  amount:      z.string().optional(),
  // Accept either fiatCurrency (internal) or currency (frontend shorthand)
  fiatCurrency: z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]).optional(),
  currency:     z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]).optional(),
  phone:       z.string().optional(),
  reference:   z.string().optional(),
  userId:      z.string().uuid().optional(),
  metadata:    z.record(z.unknown()).optional(),
}).transform((data) => ({
  merchantId:   data.merchantId,
  amountUsdc:   data.amountUsdc ?? data.amount ?? "0",
  fiatCurrency: data.fiatCurrency ?? data.currency ?? "KES",
  phone:        data.phone,
  reference:    data.reference,
  userId:       data.userId,
  metadata:     data.metadata,
}));
