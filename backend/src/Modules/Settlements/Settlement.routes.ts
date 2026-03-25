import { Router }               from "express";
import { SettlementController } from "./settlement.controller";
import { authenticate }          from "../../shared/middleware/auth";
const router     = Router();
const controller = new SettlementController();
router.post("/",     authenticate, controller.settle.bind(controller));
router.get("/:id",  authenticate, controller.getById.bind(controller));
export default router;
