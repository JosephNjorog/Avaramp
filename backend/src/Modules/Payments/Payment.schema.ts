import { z } from "zod";
export const createPaymentSchema = z.object({
  merchantId:    z.string().uuid(),
  userId:        z.string().uuid().optional(),
  amountUsdc:    z.string().min(1),
  amountFiat:    z.string().min(1),
  fiatCurrency:  z.enum(["KES", "NGN", "GHS", "TZS", "UGX"]),
  metadata:      z.record(z.unknown()).optional(),
});
