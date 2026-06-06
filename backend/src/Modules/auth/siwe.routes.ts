import { Router } from "express";
import { SiweController } from "./siwe.controller";
import { authenticate }   from "../../shared/Middleware/Auth";

const router     = Router();
const controller = new SiweController();

// Public — called before the user has a token
router.get ("/nonce",   controller.nonce.bind(controller));
router.post("/verify",  controller.verify.bind(controller));

// Authenticated — payer must have a valid JWT
router.get  ("/me",     authenticate, controller.profile.bind(controller));
router.patch("/me",     authenticate, controller.updateProfile.bind(controller));

export default router;
