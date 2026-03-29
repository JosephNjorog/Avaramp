import { Router }               from "express";
import { SettlementController } from "./Settlement.controller";
import { authenticate }          from "../../shared/Middleware/Auth";
const router     = Router();
const controller = new SettlementController();
router.post("/",     authenticate, controller.settle.bind(controller));
router.get("/:id",  authenticate, controller.getById.bind(controller));
export default router;
