import { Router }           from "express";
import { PaymentController } from "./payment.controller";
import { authenticate }      from "../../shared/middleware/auth";
import { idempotency }       from "../../shared/middleware/idempotency";
import { validate }          from "../../shared/middleware/validate";
import { paymentLimiter }    from "../../shared/middleware/rateLimit";
import { createPaymentSchema } from "./payment.schema";
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
