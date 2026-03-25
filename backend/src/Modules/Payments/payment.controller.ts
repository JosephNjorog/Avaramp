import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";
const service = new PaymentService();
export class PaymentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.createPayment(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getPayment(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}
