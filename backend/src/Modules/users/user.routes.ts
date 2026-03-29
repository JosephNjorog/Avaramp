import { Router }        from "express";
import { UserController } from "./user.controller";
import { authenticate }   from "../../shared/Middleware/Auth";
const router     = Router();
const controller = new UserController();
router.post("/",    controller.create.bind(controller));
router.get("/:id",  authenticate, controller.getById.bind(controller));
export default router;
