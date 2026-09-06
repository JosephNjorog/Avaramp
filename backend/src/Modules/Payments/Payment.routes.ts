import { Router }             from "express";
import { PaymentController }  from "./payment.controller";
import { authenticateMerchant } from "../../shared/Middleware/apiKeyAuth";
import { idempotency }        from "../../shared/Middleware/indempotency";
import { validate }           from "../../shared/Middleware/Validate";
import { paymentLimiter }     from "../../shared/Middleware/rateLimit";
import { createPaymentSchema } from "./Payment.schema";

const router     = Router();
const controller = new PaymentController();

// List all payments for the authenticated user (with optional filters)
router.get(
  "/",
  authenticateMerchant,
  controller.list.bind(controller)
);

// Analytics summary
router.get(
  "/analytics",
  authenticateMerchant,
  controller.analytics.bind(controller)
);

// Create payment
router.post(
  "/",
  authenticateMerchant,
  paymentLimiter,
  idempotency,
  validate(createPaymentSchema),
  controller.create.bind(controller)
);

// Get single payment — public so customers can poll /pay/:id without a JWT
router.get(
  "/:id",
  controller.getById.bind(controller)
);

export default router;
