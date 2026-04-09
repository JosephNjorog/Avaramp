import { Router }             from "express";
import { MerchantController } from "./controller";
import { authenticate }        from "../../shared/Middleware/Auth";
const router     = Router();
const controller = new MerchantController();
router.post("/",     authenticate, controller.create.bind(controller));
router.get("/me",    authenticate, controller.getMe.bind(controller));
router.get("/:id",   authenticate, controller.getById.bind(controller));
export default router;
