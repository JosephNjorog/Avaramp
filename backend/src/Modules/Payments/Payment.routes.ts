import { Router }             from "express";
import { PaymentController }  from "./payment.controller";
import { authenticate }       from "../../shared/Middleware/Auth";
import { idempotency }        from "../../shared/Middleware/indempotency";
import { validate }           from "../../shared/Middleware/Validate";
import { paymentLimiter }     from "../../shared/Middleware/rateLimit";
import { createPaymentSchema } from "./Payment.schema";

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

// Get single payment
router.get(
  "/:id",
  authenticate,
  controller.getById.bind(controller)
);

export default router;
