import { prisma } from "../../shared/database/prisma";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function subDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() - n); return r;
}
function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10); // "yyyy-MM-dd"
}

export class AdminService {
  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStats() {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const [
      totalMerchants,
      activeMerchants,
      inactiveMerchants,
      totalUsers,
      newMerchantsThisMonth,
      newUsersThisMonth,
      paymentsByStatus,
      settledPayments,
    ] = await Promise.all([
      prisma.merchant.count(),
      prisma.merchant.count({ where: { isActive: true } }),
      prisma.merchant.count({ where: { isActive: false } }),
      prisma.user.count(),
      prisma.merchant.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.payment.groupBy({ by: ["status"], _count: true }),
      prisma.payment.findMany({
        where: { status: "SETTLED" },
        select: { amountUsdc: true },
      }),
    ]);

    const totalUsdcVolume = settledPayments.reduce(
      (sum, p) => sum + parseFloat(p.amountUsdc || "0"),
      0
    );
    const estimatedFeeRevenue = totalUsdcVolume * 0.01;

    const statusMap: Record<string, number> = {};
    for (const g of paymentsByStatus) {
      statusMap[g.status] = g._count;
    }

    return {
      totalMerchants,
      activeMerchants,
      inactiveMerchants,
      totalUsers,
      newMerchantsThisMonth,
      newUsersThisMonth,
      paymentsByStatus: statusMap,
      totalPayments: Object.values(statusMap).reduce((a, b) => a + b, 0),
      totalUsdcVolume,
      estimatedFeeRevenue,
    };
  }

  // ── Merchants ─────────────────────────────────────────────────────────────

  async getMerchants(page = 1, limit = 20, search = "") {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { payments: true } },
          payments: {
            where: { status: "SETTLED" },
            select: { amountUsdc: true },
          },
        },
      }),
      prisma.merchant.count({ where }),
    ]);

    const data = merchants.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      walletAddress: m.walletAddress,
      mpesaTill: m.mpesaTill,
      webhookUrl: m.webhookUrl,
      feeOverrideBps: m.feeOverrideBps,
      isActive: m.isActive,
      createdAt: m.createdAt,
      paymentCount: m._count.payments,
      totalVolume: m.payments.reduce((s, p) => s + parseFloat(p.amountUsdc || "0"), 0),
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMerchantById(id: string) {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, phone: true, kycStatus: true, role: true, createdAt: true } },
        payments: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { email: true } } },
        },
        _count: { select: { payments: true } },
      },
    });
    if (!merchant) throw Object.assign(new Error("Merchant not found"), { statusCode: 404 });

    const settled = merchant.payments.filter((p) => p.status === "SETTLED");
    const totalVolume = settled.reduce((s, p) => s + parseFloat(p.amountUsdc || "0"), 0);

    return { ...merchant, totalVolume, settledCount: settled.length };
  }

  async updateMerchant(id: string, data: { isActive?: boolean; feeOverrideBps?: number | null; webhookUrl?: string }) {
    return prisma.merchant.update({ where: { id }, data });
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  async getPayments(
    page = 1,
    limit = 20,
    filters: { status?: string; merchantId?: string; currency?: string; search?: string } = {}
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.merchantId) where.merchantId = filters.merchantId;
    if (filters.currency) where.fiatCurrency = filters.currency;
    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: "insensitive" } },
        { reference: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { merchant: { select: { id: true, name: true, email: true } } },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data: payments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPaymentById(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        merchant: true,
        user: { select: { id: true, email: true, phone: true, kycStatus: true } },
        transactions: true,
        webhooks: { orderBy: { sentAt: "desc" }, take: 10 },
        ledgerEntries: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!payment) throw Object.assign(new Error("Payment not found"), { statusCode: 404 });
    return payment;
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20, search = "") {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          phone: true,
          kycStatus: true,
          role: true,
          createdAt: true,
          merchant: { select: { id: true, name: true, isActive: true } },
          _count: { select: { payments: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUserKyc(id: string, kycStatus: "PENDING" | "VERIFIED" | "REJECTED") {
    return prisma.user.update({ where: { id }, data: { kycStatus } });
  }

  async makeUserAdmin(id: string) {
    return prisma.user.update({ where: { id }, data: { role: "ADMIN" } });
  }

  // ── Financials ────────────────────────────────────────────────────────────

  async getFinancials() {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const [settledPayments, merchantData] = await Promise.all([
      prisma.payment.findMany({
        where: { status: "SETTLED" },
        select: {
          amountUsdc: true,
          amountFiat: true,
          fiatCurrency: true,
          settledAt: true,
          merchantId: true,
          merchant: { select: { name: true, feeOverrideBps: true } },
        },
        orderBy: { settledAt: "desc" },
      }),
      prisma.merchant.findMany({
        select: {
          id: true,
          name: true,
          feeOverrideBps: true,
          payments: {
            where: { status: "SETTLED" },
            select: { amountUsdc: true, fiatCurrency: true },
          },
        },
      }),
    ]);

    const totalUsdcVolume = settledPayments.reduce(
      (s, p) => s + parseFloat(p.amountUsdc || "0"),
      0
    );
    const estimatedFeeRevenue = totalUsdcVolume * 0.01;

    // Fiat volume by currency
    const fiatVolumeByCurrency: Record<string, number> = {};
    for (const p of settledPayments) {
      fiatVolumeByCurrency[p.fiatCurrency] =
        (fiatVolumeByCurrency[p.fiatCurrency] || 0) + parseFloat(p.amountFiat || "0");
    }

    // Revenue by day (last 30 days)
    const dayMap: Record<string, { usdcVolume: number; estimatedFee: number }> = {};
    for (const p of settledPayments) {
      if (!p.settledAt || p.settledAt < thirtyDaysAgo) continue;
      const day = fmtDate(p.settledAt);
      if (!dayMap[day]) dayMap[day] = { usdcVolume: 0, estimatedFee: 0 };
      const usdc = parseFloat(p.amountUsdc || "0");
      dayMap[day].usdcVolume += usdc;
      dayMap[day].estimatedFee += usdc * 0.01;
    }
    const revenueByDay = Object.entries(dayMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fee by merchant
    const feeByMerchant = merchantData.map((m) => {
      const volume = m.payments.reduce((s, p) => s + parseFloat(p.amountUsdc || "0"), 0);
      const feeBps = m.feeOverrideBps ?? 100;
      const fee = volume * (feeBps / 10000);
      const currencies = [...new Set(m.payments.map((p) => p.fiatCurrency))];
      return { merchantId: m.id, merchantName: m.name, volume, feeBps, fee, currencies };
    });

    // Top merchants by volume
    const topMerchants = [...feeByMerchant]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    // Currency breakdown
    const currencyBreakdown = Object.entries(fiatVolumeByCurrency).map(([currency, volume]) => ({
      currency,
      volume,
    }));

    return {
      totalUsdcVolume,
      estimatedFeeRevenue,
      totalFiatVolume: fiatVolumeByCurrency,
      revenueByDay,
      feeByMerchant,
      topMerchants,
      currencyBreakdown,
    };
  }

  // ── Settlements ───────────────────────────────────────────────────────────

  async getSettlements() {
    const payments = await prisma.payment.findMany({
      where: { status: "SETTLED" },
      orderBy: { settledAt: "desc" },
      include: {
        merchant: { select: { id: true, name: true } },
      },
    });
    return payments;
  }

  // ── Webhooks ──────────────────────────────────────────────────────────────

  async getWebhooks(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [webhooks, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        skip,
        take: limit,
        orderBy: { sentAt: "desc" },
        include: {
          payment: {
            select: {
              id: true,
              merchantId: true,
              merchant: { select: { name: true } },
            },
          },
        },
      }),
      prisma.webhookDelivery.count(),
    ]);
    return { data: webhooks, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async retryWebhook(id: string) {
    return prisma.webhookDelivery.update({
      where: { id },
      data: { status: "RETRY", error: null },
    });
  }

  // ── Consent ───────────────────────────────────────────────────────────────

  async getConsentRecords(page = 1, limit = 20, search = "") {
    const skip = (page - 1) * limit;
    const where: any = search
      ? { user: { email: { contains: search, mode: "insensitive" } } }
      : {};

    const [records, total] = await Promise.all([
      prisma.consentRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { acceptedAt: "desc" },
        include: { user: { select: { email: true } } },
      }),
      prisma.consentRecord.count({ where }),
    ]);

    return { data: records, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async exportConsentCsv(): Promise<string> {
    const records = await prisma.consentRecord.findMany({
      orderBy: { acceptedAt: "desc" },
      include: { user: { select: { email: true } } },
    });

    const header = "id,userEmail,policyType,version,acceptedAt,ipAddress,userAgent\n";
    const rows = records
      .map((r) => {
        const cells = [
          r.id,
          r.user.email,
          r.policyType,
          r.version,
          r.acceptedAt.toISOString(),
          r.ipAddress ?? "",
          (r.userAgent ?? "").replace(/,/g, ";"),
        ];
        return cells.map((c) => `"${c}"`).join(",");
      })
      .join("\n");

    return header + rows;
  }
}
