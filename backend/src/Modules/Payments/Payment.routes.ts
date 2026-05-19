import { Router, Request, Response } from "express";
import { PaymentController }  from "./payment.controller";
import { authenticate }       from "../../shared/Middleware/Auth";
import { idempotency }        from "../../shared/Middleware/indempotency";
import { validate }           from "../../shared/Middleware/Validate";
import { paymentLimiter }     from "../../shared/Middleware/rateLimit";
import { createPaymentSchema } from "./Payment.schema";
import { prisma }             from "../../shared/database/prisma";
import { settlementQueue }    from "../../shared/queue/queues";

const router     = Router();
const controller = new PaymentController();

// List all payments for the authenticated user (with optional filters)
router.get(
  "/",
  authenticate,
  controller.list.bind(controller)
);

// Analytics summary
router.get(
  "/analytics",
  authenticate,
  controller.analytics.bind(controller)
);

// Create payment
router.post(
  "/",
  authenticate,
  paymentLimiter,
  idempotency,
  validate(createPaymentSchema),
  controller.create.bind(controller)
);

// Get single payment — public so customers can poll the /pay/:id page without a JWT
router.get(
  "/:id",
  controller.getById.bind(controller)
);

// Dev-only: simulate charge.success (only when PAYSTACK_SKIP_SETTLEMENT=true)
router.post("/:id/dev-confirm", async (req: Request, res: Response) => {
  if (process.env.PAYSTACK_SKIP_SETTLEMENT !== "true") {
    return res.status(403).json({ error: "Not available in production" });
  }
  const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!payment || payment.status !== "PENDING") {
    return res.status(400).json({ error: "Payment not PENDING" });
  }
  await prisma.payment.update({
    where: { id: payment.id },
    data:  { status: "CONFIRMED", confirmedAt: new Date() },
  });
  await settlementQueue.add("settle-payment", { paymentId: payment.id });
  return res.json({ ok: true });
});

export default router;
