import { Router }           from "express";
import { PaymentController } from "./payment.controller";
import { authenticate }      from "../../shared/Middleware/Auth";
import { idempotency }       from "../../shared/Middleware/indempotency";
import { validate }          from "../../shared/Middleware/Validate";
import { paymentLimiter }    from "../../shared/Middleware/rateLimit";
import { createPaymentSchema } from "./Payment.schema";
const router     = Router();
const controller = new PaymentController(); 
router.post(
  "/",
  authenticate,
  paymentLimiter,
  idempotency,
  validate(createPaymentSchema),
  controller.create.bind(controller)
);
router.get(
  "/:id",
  authenticate,
  controller.getById.bind(controller)
);
export default router;
