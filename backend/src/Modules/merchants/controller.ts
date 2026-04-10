import { Request, Response, NextFunction } from "express";
import { MerchantService } from "./merchant.service";
const service = new MerchantService();
export class MerchantController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub as string | undefined;
      const result = await service.createMerchant({ ...req.body, userId });
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub as string;
      const result = await service.getMerchantByUserId(userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getMerchant(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async updatePayout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub as string;
      const merchant = await service.getMerchantByUserId(userId);
      const { payoutType, payoutAccount, payoutAccountRef, payoutCurrency } = req.body;
      const result = await service.updatePayoutSettings(merchant.id, {
        payoutType, payoutAccount, payoutAccountRef, payoutCurrency,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}
