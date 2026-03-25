# ── shared / database / prisma.ts ──────────────────────────────
cat > backend / src / shared / database / prisma.ts << 'EOF'
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
EOF

# ── shared / utils / logger.ts ─────────────────────────────────
cat > backend / src / shared / utils / logger.ts << 'EOF'
import pino from "pino";

export const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    transport:
        process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty", options: { colorize: true } }
            : undefined,
});
EOF

# ── shared / utils / errors.ts ─────────────────────────────────
cat > backend / src / shared / utils / errors.ts << 'EOF'
export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = "AppError";
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404, "NOT_FOUND");
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, "VALIDATION_ERROR");
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, "CONFLICT");
    }
}

export class UnauthorizedError extends AppError {
    constructor() {
        super("Unauthorized", 401, "UNAUTHORIZED");
    }
}
EOF

# ── shared / utils / encryption.ts ────────────────────────────
cat > backend / src / shared / utils / encryption.ts << 'EOF'
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

export function decrypt(data: string): string {
    const [ivHex, authTagHex, encryptedHex] = data.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final("utf8");
}
EOF

# ── shared / middleware / auth.ts ──────────────────────────────
cat > backend / src / shared / middleware / auth.ts << 'EOF'
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/errors";

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return next(new UnauthorizedError());
    }
    try {
        const token = header.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET!);
        (req as any).user = payload;
        next();
    } catch {
        next(new UnauthorizedError());
    }
}
EOF

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
EOF

# ── shared / middleware / validate.ts ─────────────────────────
cat > backend / src / shared / middleware / validate.ts << 'EOF'
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Validation failed",
                issues: result.error.issues,
            });
        }
        req.body = result.data;
        next();
    };
}
EOF

# ── shared / middleware / rateLimit.ts ────────────────────────
cat > backend / src / shared / middleware / rateLimit.ts << 'EOF'
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: { error: "Too many requests, please try again later." },
});

export const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10,
    message: { error: "Payment rate limit exceeded." },
});
EOF

# ── shared / queue / queues.ts ─────────────────────────────────
cat > backend / src / shared / queue / queues.ts << 'EOF'
import { Queue } from "bullmq";
import Redis from "ioredis";

export const connection = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
});

export const paymentQueue = new Queue("payments", { connection });
export const settlementQueue = new Queue("settlements", { connection });
export const webhookQueue = new Queue("webhooks", { connection });
EOF

# ── shared / queue / workers / payment.worker.ts ────────────────
cat > backend / src / shared / queue / workers / payment.worker.ts << 'EOF'
import { Worker, Job } from "bullmq";
import { connection } from "../queues";
import { prisma } from "../../database/prisma";
import { logger } from "../../utils/logger";
import { settlementQueue } from "../queues";

export const paymentWorker = new Worker(
    "payments",
    async (job: Job) => {
        switch (job.name) {
            case "watch-deposit": {
                const { paymentId } = job.data;
                const payment = await prisma.payment.findUnique({
                    where: { id: paymentId },
                });
                if (!payment) throw new Error(`Payment not found: ${paymentId}`);
                if (payment.status === "CONFIRMED") {
                    await settlementQueue.add("settle-payment", { paymentId });
                    return { confirmed: true };
                }
                if (new Date() > payment.expiresAt) {
                    await prisma.payment.update({
                        where: { id: paymentId },
                        data: { status: "EXPIRED" },
                    });
                    return { expired: true };
                }
                throw new Error("Awaiting deposit");
            }
            default:
                logger.warn(`Unknown payment job: ${job.name}`);
        }
    },
    { connection, concurrency: 20 }
);

paymentWorker.on("failed", (job, err) => {
    logger.error(`Payment job failed [${job?.id}]: ${err.message}`);
});
EOF

# ── shared / queue / workers / settlement.worker.ts ─────────────
cat > backend / src / shared / queue / workers / settlement.worker.ts << 'EOF'
import { Worker, Job } from "bullmq";
import { connection } from "../queues";
import { logger } from "../../utils/logger";
import { SettlementService } from "../../../modules/settlement/settlement.service";

const service = new SettlementService();

export const settlementWorker = new Worker(
    "settlements",
    async (job: Job) => {
        switch (job.name) {
            case "settle-payment":
                await service.settle(job.data.paymentId);
                break;
            default:
                logger.warn(`Unknown settlement job: ${job.name}`);
        }
    },
    {
        connection,
        concurrency: 5,
        limiter: { max: 10, duration: 1000 },
    }
);

settlementWorker.on("failed", (job, err) => {
    logger.error(`Settlement job failed [${job?.data?.paymentId}]: ${err.message}`);
});
EOF

# ── shared / queue / workers / webhook.worker.ts ────────────────
cat > backend / src / shared / queue / workers / webhook.worker.ts << 'EOF'
import { Worker, Job } from "bullmq";
import { connection } from "../queues";
import { logger } from "../../utils/logger";
import { WebhookService } from "../../../modules/webhooks/webhook.service";

const service = new WebhookService();

export const webhookWorker = new Worker(
    "webhooks",
    async (job: Job) => {
        const { paymentId, event, payload } = job.data;
        await service.dispatch(paymentId, event, payload);
    },
    {
        connection,
        concurrency: 10,
        limiter: { max: 50, duration: 1000 },
    }
);

webhookWorker.on("failed", (job, err) => {
    logger.error(`Webhook job failed [${job?.id}]: ${err.message}`);
});
EOF

echo "✅ All shared files written"
