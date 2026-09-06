import { Router } from "express";
import { ApiKeyController } from "./apiKey.controller";
import { authenticate } from "../../shared/Middleware/Auth";

const router = Router();
const controller = new ApiKeyController();

// Key management is a dashboard/session action — JWT only, not API-key-authenticable itself
router.post("/", authenticate, controller.create.bind(controller));
router.get("/", authenticate, controller.list.bind(controller));
router.delete("/:id", authenticate, controller.revoke.bind(controller));

export default router;
