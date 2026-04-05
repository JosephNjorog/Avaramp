import { Router }        from "express";
import { UserController } from "./user.controller";
import { authenticate }   from "../../shared/Middleware/Auth";

const router     = Router();
const controller = new UserController();

// Authenticated user's own profile
router.get  ("/me",           authenticate, controller.me.bind(controller));
router.patch("/me",           authenticate, controller.updateMe.bind(controller));
router.get  ("/me/webhooks",  authenticate, controller.webhooks.bind(controller));

// Generic CRUD (kept for admin use)
router.post ("/",    controller.create.bind(controller));
router.get  ("/:id", authenticate, controller.getById.bind(controller));

export default router;
