import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";
import { prisma } from "../../shared/database/prisma";

const service = new PaymentService();

export class PaymentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub as string | undefined;

      // Auto-inject merchantId from the authenticated user's merchant profile
      let { merchantId } = req.body;
      if (!merchantId && userId) {
        const merchant = await prisma.merchant.findUnique({ where: { userId } });
        if (merchant) merchantId = merchant.id;
      }

      const result = await service.createPayment({ ...req.body, merchantId, userId });
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getPayment(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const limit  = Math.min(parseInt(req.query.limit  as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await service.listPayments({
        merchantId: req.query.merchantId as string | undefined,
        userId:     (req as any).user?.sub,
        status:     req.query.status as string | undefined,
        limit,
        offset,
      });
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async analytics(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = req.query.merchantId as string | undefined;
      const result = await service.getAnalyticsSummary(merchantId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}
