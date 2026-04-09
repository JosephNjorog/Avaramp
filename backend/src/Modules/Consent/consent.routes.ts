import { Router } from "express";
import { authenticate } from "../../shared/Middleware/Auth";
import { recordConsent, listConsents, exportConsents } from "./consent.controller";

const router = Router();

// Record consent at signup (authenticated)
router.post("/",               authenticate, recordConsent);

// Admin routes
router.get("/admin/consents",         authenticate, listConsents);
router.get("/admin/consents/export",  authenticate, exportConsents);

export default router;
