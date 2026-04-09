import { Request, Response } from "express";
import { prisma } from "../../shared/database/prisma";

const CURRENT_VERSION = "2026-04-10";
const VALID_POLICIES  = ["TERMS", "PRIVACY", "COOKIES"] as const;

// ── POST /api/consent ─────────────────────────────────────────────────────────
// Record acceptance of one or more policy types at signup
export async function recordConsent(req: Request, res: Response) {
  try {
    const userId    = (req as any).user?.id;
    const { types } = req.body as { types: string[] };

    if (!userId)               return res.status(401).json({ error: "Unauthorized" });
    if (!Array.isArray(types)) return res.status(400).json({ error: "types must be an array" });

    const ipAddress = (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null
    );
    const userAgent = req.headers["user-agent"] || null;

    const validTypes = types.filter((t): t is typeof VALID_POLICIES[number] =>
      (VALID_POLICIES as readonly string[]).includes(t)
    );

    if (validTypes.length === 0) {
      return res.status(400).json({ error: "No valid policy types provided" });
    }

    const records = await prisma.$transaction(
      validTypes.map((policyType) =>
        prisma.consentRecord.create({
          data: { userId, policyType, version: CURRENT_VERSION, ipAddress, userAgent },
        })
      )
    );

    return res.json({ success: true, recorded: records.length });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to record consent" });
  }
}

// ── GET /api/admin/consents ───────────────────────────────────────────────────
// List all consent records (admin only)
export async function listConsents(req: Request, res: Response) {
  try {
    const { page = "1", limit = "50", policyType, search } = req.query as Record<string, string>;
    const take = Math.min(parseInt(limit) || 50, 200);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const [records, total] = await Promise.all([
      prisma.consentRecord.findMany({
        where: {
          ...(policyType && { policyType }),
          ...(search && {
            user: {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
              ],
            },
          }),
        },
        include: { user: { select: { email: true, phone: true } } },
        orderBy: { acceptedAt: "desc" },
        take,
        skip,
      }),
      prisma.consentRecord.count({
        where: {
          ...(policyType && { policyType }),
          ...(search && {
            user: {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
              ],
            },
          }),
        },
      }),
    ]);

    return res.json({ records, total, page: parseInt(page), limit: take });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch consent records" });
  }
}

// ── GET /api/admin/consents/export ───────────────────────────────────────────
// Export all consent records as CSV
export async function exportConsents(req: Request, res: Response) {
  try {
    const records = await prisma.consentRecord.findMany({
      include: { user: { select: { email: true, phone: true } } },
      orderBy: { acceptedAt: "desc" },
      take:    100_000, // hard limit
    });

    const header = "id,email,phone,policyType,version,acceptedAt,ipAddress,userAgent\n";
    const rows   = records.map((r) => [
      r.id,
      r.user.email,
      r.user.phone ?? "",
      r.policyType,
      r.version,
      r.acceptedAt.toISOString(),
      r.ipAddress ?? "",
      `"${(r.userAgent ?? "").replace(/"/g, '""')}"`,
    ].join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="consent-records-${new Date().toISOString().slice(0,10)}.csv"`);
    return res.send(header + rows);
  } catch (err: any) {
    return res.status(500).json({ error: "Export failed" });
  }
}
