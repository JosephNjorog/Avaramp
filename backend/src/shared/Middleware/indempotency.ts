import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";

export async function idempotency(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["idempotency-key"] as string;
  if (!key) return next();

  const userId = (req as any).user?.sub as string | undefined;
  const existing = await prisma.payment.findFirst({
    where: {
      idempotencyKey: key,
      ...(userId ? { userId } : {}), // scope to authenticated user to prevent cross-merchant leakage
    },
  });

  if (existing) {
    return res.status(200).json({ cached: true, data: existing });
  }

  req.body.idempotencyKey = key;
  next();
}
