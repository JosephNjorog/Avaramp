import { Request, Response, NextFunction } from "express";
import { apiKeyService } from "./apiKey.service";
import { prisma } from "../../shared/database/prisma";
import { UnauthorizedError } from "../../shared/Utils/Errors";

async function resolveMerchantId(req: Request): Promise<string> {
  const userId = (req as any).user?.sub as string | undefined;
  if (!userId) throw new UnauthorizedError();
  const merchant = await prisma.merchant.findUnique({ where: { userId }, select: { id: true } });
  if (!merchant) throw new UnauthorizedError("No merchant profile for this account");
  return merchant.id;
}

export class ApiKeyController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await resolveMerchantId(req);
      const mode = req.body?.mode === "test" ? "test" : "live";
      const result = await apiKeyService.create(merchantId, req.body?.name, mode);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await resolveMerchantId(req);
      const result = await apiKeyService.list(merchantId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async revoke(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = await resolveMerchantId(req);
      await apiKeyService.revoke(merchantId, req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  }
}
