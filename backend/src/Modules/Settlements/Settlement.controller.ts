import { Request, Response, NextFunction } from "express";
import { SettlementService } from "./settlement.service";
const service = new SettlementService();
export class SettlementController {
  async settle(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.settle(req.body.paymentId);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getSettlement(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}
