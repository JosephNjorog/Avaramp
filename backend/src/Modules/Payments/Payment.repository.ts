import { prisma } from "../../shared/database/prisma";
import { PaymentStatus } from "@prisma/client";
export class PaymentRepository {
  async create(data: any) {
    return prisma.payment.create({ data });
  }
  async findById(id: string) {
    return prisma.payment.findUnique({
      where:   { id },
      include: { transactions: true, ledgerEntries: true, merchant: true },
    });
  }
  async findPending() {
    return prisma.payment.findMany({
      where: { status: PaymentStatus.PENDING },
      take:  50,
    });
  }
  async updateStatus(id: string, status: PaymentStatus, data?: any) {
    return prisma.payment.update({
      where: { id },
      data:  { status, ...data },
    });
  }

  async list(filters: { merchantId?: string; userId?: string; status?: PaymentStatus; limit?: number; offset?: number }) {
    const { merchantId, userId, status, limit = 20, offset = 0 } = filters;
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          ...(merchantId && { merchantId }),
          ...(userId     && { userId }),
          ...(status     && { status }),
        },
        orderBy: { createdAt: "desc" },
        take:    limit,
        skip:    offset,
        select: {
          id: true, merchantId: true, userId: true, amountUsdc: true,
          amountFiat: true, fiatCurrency: true, depositAddress: true,
          status: true, fxRate: true, fiatAmount: true, mpesaReceiptId: true,
          expiresAt: true, confirmedAt: true, settledAt: true,
          createdAt: true, updatedAt: true, idempotencyKey: true,
        },
      }),
      prisma.payment.count({
        where: {
          ...(merchantId && { merchantId }),
          ...(userId     && { userId }),
          ...(status     && { status }),
        },
      }),
    ]);
    return { payments, total, limit, offset };
  }

  async getAnalyticsSummary(merchantId?: string) {
    const where = merchantId ? { merchantId } : {};
    const [total, settled, pending, failed] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.count({ where: { ...where, status: "SETTLED" } }),
      prisma.payment.count({ where: { ...where, status: "PENDING" } }),
      prisma.payment.count({ where: { ...where, status: { in: ["FAILED", "EXPIRED"] } } }),
    ]);

    // Daily volume for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSettled = await prisma.payment.findMany({
      where: { ...where, status: "SETTLED", settledAt: { gte: sevenDaysAgo } },
      select: { amountUsdc: true, settledAt: true, fiatCurrency: true, amountFiat: true },
    });

    // Group by day
    const volumeByDay: Record<string, number> = {};
    for (const p of recentSettled) {
      const day = p.settledAt!.toISOString().slice(0, 10);
      volumeByDay[day] = (volumeByDay[day] || 0) + parseFloat(p.amountUsdc);
    }
    const dailyVolume = Object.entries(volumeByDay)
      .map(([date, volume]) => ({ date, volume: parseFloat(volume.toFixed(2)) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { total, settled, pending, failed, dailyVolume };
  }
}
