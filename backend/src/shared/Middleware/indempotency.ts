# ── shared / middleware / idempotency.ts ──────────────────────
cat > backend / src / shared / middleware / idempotency.ts << 'EOF'
import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";

export async function idempotency(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const key = req.headers["idempotency-key"] as string;
    if (!key) return next();

    const existing = await prisma.payment.findUnique({
        where: { idempotencyKey: key },
    });

    if (existing) {
        return res.status(200).json({
            cached: true,
            payment: existing,
        });
    }

    req.body.idempotencyKey = key;
    next();
}


