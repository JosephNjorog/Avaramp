import { Router }        from "express";
import { UserController } from "./user.controller";
import { authenticate }   from "../../shared/Middleware/Auth";

const router     = Router();
const controller = new UserController();

// Authenticated user's own profile
router.get  ("/me",              authenticate, controller.me.bind(controller));
router.patch("/me",              authenticate, controller.updateMe.bind(controller));
router.patch("/me/password",     authenticate, controller.changePassword.bind(controller));
router.get  ("/me/webhooks",     authenticate, controller.webhooks.bind(controller));

// Admin-only user management
router.get  ("/:id", authenticate, controller.getById.bind(controller));

export default router;
