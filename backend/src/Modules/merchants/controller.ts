import { Request, Response, NextFunction } from "express";
import { MerchantService } from "./merchant.service";
const service = new MerchantService();
export class MerchantController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.createMerchant(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getMerchant(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}
