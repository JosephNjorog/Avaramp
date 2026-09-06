import { Request, Response, NextFunction } from "express";
import { ApiKeyRepository } from "../../Modules/ApiKeys/apiKey.repository";
import { hashKey } from "../../Modules/ApiKeys/apiKey.service";
import { UnauthorizedError } from "../Utils/Errors";
import { authenticate } from "./Auth";

const repo = new ApiKeyRepository();

/**
 * Accepts either a merchant-scoped API key (`x-api-key` header) or a login
 * JWT (`Authorization: Bearer`). API-key requests attach `req.merchantId`
 * directly; JWT requests fall through to the existing `authenticate`
 * middleware, which attaches `req.user` for downstream merchant lookup.
 */
export async function authenticateMerchant(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (apiKey) {
    try {
      const record = await repo.findActiveByHash(hashKey(apiKey));
      if (!record) return next(new UnauthorizedError("Invalid API key"));
      repo.touchLastUsed(record.id).catch(() => {});
      (req as any).merchantId = record.merchantId;
      (req as any).authType = "apiKey";
      return next();
    } catch {
      return next(new UnauthorizedError("Invalid API key"));
    }
  }

  return authenticate(req, res, next);
}
