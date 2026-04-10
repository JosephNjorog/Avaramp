import { Router } from "express";
import { authenticate } from "../../shared/Middleware/Auth";
import { adminAuth }    from "../../shared/Middleware/adminAuth";
import * as ctrl        from "./admin.controller";

const router = Router();
const guard  = [authenticate, adminAuth];

// Stats
router.get("/stats",                     ...guard, ctrl.getStats);

// Merchants
router.get("/merchants",                 ...guard, ctrl.getMerchants);
router.get("/merchants/:id",             ...guard, ctrl.getMerchantById);
router.patch("/merchants/:id",           ...guard, ctrl.updateMerchant);

// Payments
router.get("/payments",                  ...guard, ctrl.getPayments);
router.get("/payments/:id",              ...guard, ctrl.getPaymentById);

// Users
router.get("/users",                     ...guard, ctrl.getUsers);
router.patch("/users/:id/kyc",           ...guard, ctrl.updateUserKyc);
router.patch("/users/:id/make-admin",    ...guard, ctrl.makeUserAdmin);

// Financials
router.get("/financials",                ...guard, ctrl.getFinancials);

// Settlements
router.get("/settlements",               ...guard, ctrl.getSettlements);

// Webhooks
router.get("/webhooks",                  ...guard, ctrl.getWebhooks);
router.post("/webhooks/:id/retry",       ...guard, ctrl.retryWebhook);

// Consent
router.get("/consent",                   ...guard, ctrl.getConsentRecords);
router.get("/consent/export",            ...guard, ctrl.exportConsentCsv);

export default router;
