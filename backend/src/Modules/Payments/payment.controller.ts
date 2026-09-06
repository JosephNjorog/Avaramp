import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";
import { prisma } from "../../shared/database/prisma";

const service = new PaymentService();

export class PaymentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub as string | undefined;
      const apiKeyMerchantId = (req as any).merchantId as string | undefined;

      // Auto-inject merchantId: API-key auth resolves it directly, JWT auth via the user's merchant profile
      let { merchantId } = req.body;
      if (!merchantId && apiKeyMerchantId) {
        merchantId = apiKeyMerchantId;
      } else if (!merchantId && userId) {
        const merchant = await prisma.merchant.findUnique({ where: { userId } });
        if (merchant) merchantId = merchant.id;
      }

      const isTest = (req as any).isTestKey === true;
      const result = await service.createPayment({ ...req.body, merchantId, userId, isTest });
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async statement(req: Request, res: Response, next: NextFunction) {
    try {
      const apiKeyMerchantId = (req as any).merchantId as string | undefined;
      let merchantId = apiKeyMerchantId;
      if (!merchantId) {
        const userId = (req as any).user?.sub;
        const merchant = await prisma.merchant.findUnique({ where: { userId }, select: { id: true } });
        merchantId = merchant?.id;
      }
      const csv = await service.getStatementCsv(merchantId ?? "");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="settlement-statement.csv"');
      res.send(csv);
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
      const apiKeyMerchantId = (req as any).merchantId as string | undefined;
      const result = await service.listPayments({
        merchantId: apiKeyMerchantId ?? (req.query.merchantId as string | undefined),
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
      const apiKeyMerchantId = (req as any).merchantId as string | undefined;
      let merchantId = apiKeyMerchantId;
      if (!merchantId) {
        const userId = (req as any).user?.sub;
        // Enforce ownership — derive merchantId from the authenticated user, ignore query param
        const merchant = await prisma.merchant.findUnique({ where: { userId }, select: { id: true } });
        merchantId = merchant?.id;
      }
      const result = await service.getAnalyticsSummary(merchantId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}
