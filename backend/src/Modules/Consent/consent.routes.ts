import { Router } from "express";
import { authenticate } from "../../shared/Middleware/Auth";
import { adminAuth }    from "../../shared/Middleware/adminAuth";
import { recordConsent, listConsents, exportConsents } from "./consent.controller";

const router = Router();

// Record consent at signup (authenticated)
router.post("/",               authenticate, recordConsent);

// Admin-only routes — require both valid JWT and ADMIN role
router.get("/admin/consents",         authenticate, adminAuth, listConsents);
router.get("/admin/consents/export",  authenticate, adminAuth, exportConsents);

export default router;
